import { StreamClient } from '@stream-io/node-sdk';

import { LESSONS } from '@/data/lessons';

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  ja: 'Japanese',
  de: 'German',
  en: 'English',
};

export async function POST(request: Request): Promise<Response> {
  if (!apiKey || !apiSecret) {
    return Response.json({ error: 'Stream credentials not configured' }, { status: 500 });
  }

  const body = await request.json();
  const { userId, lessonId, languageCode } = body as {
    userId: string;
    lessonId: string;
    languageCode?: string;
  };

  if (!userId || !lessonId) {
    return Response.json({ error: 'Missing userId or lessonId' }, { status: 400 });
  }

  const client = new StreamClient(apiKey, apiSecret);
  const code = languageCode ?? 'en';
  const languageName = LANGUAGE_NAMES[code] ?? code.toUpperCase();
  const token = client.generateUserToken({ user_id: userId });
  const callId = `lesson-${lessonId}-${code}`;

  const lesson = LESSONS.find((l) => l.id === lessonId);

  // Build compact lesson context for the AI teacher — packed into call custom data
  const lessonContext = lesson
    ? {
        lessonTitle: lesson.title,
        languageCode: code,
        languageName,
        systemPrompt: lesson.aiTeacherPrompt.systemPrompt,
        introPrompt: lesson.aiTeacherPrompt.introMessage,
        topics: lesson.aiTeacherPrompt.topics,
        goals: lesson.goals.map((g) => g.description),
        vocabulary: lesson.vocabulary.map(({ word, translation, pronunciation }) => ({
          word,
          translation,
          pronunciation,
        })),
        phrases: lesson.phrases.map(({ text, translation, pronunciation }) => ({
          text,
          translation,
          pronunciation,
        })),
      }
    : { languageCode: code, languageName };

  try {
    const call = client.video.call('default', callId);
    await call.getOrCreate({
      data: {
        created_by_id: userId,
        // Give the agent admin role so it can publish audio immediately
        members: [
          { user_id: userId, role: 'call_member' },
          { user_id: 'lingua-teacher', role: 'admin' },
        ],
        custom: lessonContext,
        settings_override: {
          audio: { mic_default_on: true, default_device: 'speaker' },
          video: { camera_default_on: false },
        },
      },
    });
  } catch {
    // Call may already exist — proceed with the token
  }

  return Response.json({ token, callId });
}
