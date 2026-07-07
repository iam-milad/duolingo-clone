# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Lingua AI language learning app. The integration adds event tracking across the full user journey — from onboarding through auth and into active learning — plus user identification via Clerk, screen tracking via Expo Router, and autocapture of touch interactions.

## What changed

| File | Change |
|------|--------|
| `src/lib/posthog.ts` | New PostHog client config file (reads token/host from `app.config.js` extras via `expo-constants`) |
| `app.config.js` | Created to replace `app.json` and expose `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` as `extra` fields |
| `.env` | Added `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` |
| `src/app/_layout.tsx` | Added `PostHogProvider`, manual screen tracking with `usePathname`, and `AuthSync` component for Clerk → PostHog user identification |
| `src/app/onboarding.tsx` | Captures `onboarding_get_started` |
| `src/app/(auth)/sign-up.tsx` | Captures `sign_up_initiated` and `sign_up_completed` |
| `src/app/(auth)/sign-in.tsx` | Captures `sign_in_initiated` and `sign_in_completed` |
| `src/hooks/useOAuthProviders.ts` | Captures `oauth_sign_in_initiated`, `oauth_sign_in_completed`, and exceptions on OAuth failure |
| `src/app/language-selection.tsx` | Captures `language_selected` (with `language_code`, `language_name`) and `language_search_performed` |
| `src/app/(tabs)/index.tsx` | Captures `continue_learning_tapped` and `daily_plan_item_tapped` |

## Events

| Event | Description | File |
|-------|-------------|------|
| `onboarding_get_started` | User taps the Get Started button on the onboarding screen, entering the auth funnel | `src/app/onboarding.tsx` |
| `sign_up_initiated` | User submits their email and password to begin the sign-up flow | `src/app/(auth)/sign-up.tsx` |
| `sign_up_completed` | User successfully verifies their email and completes account creation | `src/app/(auth)/sign-up.tsx` |
| `sign_in_initiated` | User submits their email to begin the sign-in flow | `src/app/(auth)/sign-in.tsx` |
| `sign_in_completed` | User successfully verifies their email code and completes sign-in | `src/app/(auth)/sign-in.tsx` |
| `oauth_sign_in_initiated` | User taps a social auth provider button (Google, Facebook, or Apple) | `src/hooks/useOAuthProviders.ts` |
| `oauth_sign_in_completed` | User successfully signs in via a social OAuth provider | `src/hooks/useOAuthProviders.ts` |
| `language_selected` | User selects and confirms a language to start learning | `src/app/language-selection.tsx` |
| `language_search_performed` | User types in the language search field on the selection screen | `src/app/language-selection.tsx` |
| `continue_learning_tapped` | User taps the Continue button in the home screen learning banner | `src/app/(tabs)/index.tsx` |
| `daily_plan_item_tapped` | User taps an activity item in Today's Plan section on the home screen | `src/app/(tabs)/index.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics (wizard) — Dashboard](https://eu.posthog.com/project/218473/dashboard/801344)
- [User Onboarding Funnel](https://eu.posthog.com/project/218473/insights/Occhk9eU)
- [Daily Sign-ups & Sign-ins](https://eu.posthog.com/project/218473/insights/7GfsuKbb)
- [Language Selection Popularity](https://eu.posthog.com/project/218473/insights/btxBbW2N)
- [OAuth Sign-in Completion Rate](https://eu.posthog.com/project/218473/insights/3mkjXSYB)
- [Learning Engagement](https://eu.posthog.com/project/218473/insights/BTVxcd1M)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any onboarding scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — the `AuthSync` component in `_layout.tsx` runs on every app open and handles this, but verify it fires correctly for users who were already signed in before this integration was deployed.

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
