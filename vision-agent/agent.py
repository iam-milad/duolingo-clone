import logging

from dotenv import load_dotenv
from vision_agents.core import Agent, Runner, User
from vision_agents.core.agents import AgentLauncher
from vision_agents.plugins import getstream, openai as va_openai

logger = logging.getLogger(__name__)

load_dotenv()

# Maps language codes (used in call IDs) to full display names.
# Kept in sync with src/data/languages.ts.
LANGUAGE_NAMES: dict[str, str] = {
    "es": "Spanish",
    "fr": "French",
    "ja": "Japanese",
    "de": "German",
    "en": "English",
}

BASE_INSTRUCTIONS = """
You are a warm and encouraging AI language teacher.
Your job is to run an interactive, back-and-forth voice lesson — not a lecture.

Rules:
- Always speak English — that is the language of instruction.
- Teach the target language through English explanations.
- When introducing a word or phrase, say it clearly in the target language, then give the English meaning and a quick pronunciation tip, then END YOUR TURN and wait for the student.
- Keep every turn to one or two sentences — one idea at a time.
- Be encouraging, playful, and patient.
- Celebrate correct answers enthusiastically.
- Gently correct mistakes: acknowledge the attempt, model the correct form, ask the student to try again.
- Avoid markdown, bullet points, or special characters — this is a voice session.
""".strip()


def _language_from_call_id(call_id: str) -> str:
    code = call_id.rsplit("-", 1)[-1]
    return LANGUAGE_NAMES.get(code, code.upper())


def _build_instructions(custom: dict) -> str:
    """Build a lesson-specific system prompt from call custom data."""
    system_prompt = str(custom.get("systemPrompt", "")).strip()
    if system_prompt:
        # The lesson already ships a fully-crafted system prompt — use it directly,
        # but append the voice-mode rules so the agent stays concise.
        return (
            system_prompt
            + "\n\n"
            + "Important: this is a voice session. Keep every turn to one or two sentences. "
            "Avoid markdown, bullets, or special characters."
        )

    # Fallback: build a generic prompt from whatever context we have
    language_name = str(custom.get("languageName", "the target language"))
    parts = [BASE_INSTRUCTIONS, f"\nYou are teaching {language_name}."]

    vocab = custom.get("vocabulary", [])
    if vocab:
        items = ", ".join(
            f"{v['word']} ({v['translation']})" for v in vocab[:8] if isinstance(v, dict)
        )
        parts.append(f"Vocabulary for this lesson: {items}.")

    phrases = custom.get("phrases", [])
    if phrases:
        items = ", ".join(
            f"{p['text']} ({p['translation']})" for p in phrases[:5] if isinstance(p, dict)
        )
        parts.append(f"Key phrases: {items}.")

    return " ".join(parts)


def _build_intro_prompt(custom: dict, language: str) -> str:
    """Return the simple_response seed for the opening turn."""
    intro = str(custom.get("introPrompt", "")).strip()
    title = str(custom.get("lessonTitle", "")).strip()

    if intro:
        return (
            f"The student has just joined. Your opening line is: \"{intro}\" "
            f"Say it naturally as the start of the lesson."
        )

    # Generic fallback
    context = f"the lesson on {title}" if title else f"their {language} lesson"
    return (
        f"The student is here to start {context}. "
        f"Greet them warmly in English, introduce yourself briefly, "
        f"and launch straight into the first teaching point."
    )


async def create_agent(**kwargs) -> Agent:
    # Instructions are generic at creation time; lesson context is layered in join_call.
    return Agent(
        edge=getstream.Edge(),
        agent_user=User(name="Lingua", id="lingua-teacher"),
        instructions=BASE_INSTRUCTIONS,
        # OpenAI Realtime handles STT + TTS natively; send_video=False for voice-only.
        llm=va_openai.Realtime(
            model="gpt-realtime-2",
            voice="marin",
            send_video=False,
        ),
    )


async def join_call(agent: Agent, call_type: str, call_id: str, **kwargs) -> None:
    call = await agent.create_call(call_type, call_id)

    # Read lesson context packed by the Expo API route into the call's custom data.
    custom: dict = getattr(call, "custom_data", None) or {}
    language = str(custom.get("languageName", _language_from_call_id(call_id)))

    # Update the agent's instructions with lesson-specific content.
    agent.instructions = _build_instructions(custom)

    # For audio_room call types the agent must go live before it can publish.
    if hasattr(call, "go_live"):
        try:
            await call.go_live()
        except Exception as exc:
            msg = str(exc).lower()
            if "unsupported" in msg and "call" in msg:
                # Expected: this call type does not require go_live.
                logger.debug("go_live skipped for call type %r: %s", call_type, exc)
            else:
                logger.error("go_live failed for call %r: %s", call_id, exc)
                raise

    async with agent.join(call):
        await agent.simple_response(_build_intro_prompt(custom, language))
        await agent.finish()


runner = Runner(AgentLauncher(create_agent=create_agent, join_call=join_call))

if __name__ == "__main__":
    runner.cli()
