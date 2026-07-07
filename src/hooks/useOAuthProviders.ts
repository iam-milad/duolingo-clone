import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { usePostHog } from "posthog-react-native";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "facebook" | "apple";

const STRATEGY_MAP = {
  google: "oauth_google",
  facebook: "oauth_facebook",
  apple: "oauth_apple",
} as const;

export function useOAuthProviders() {
  const router = useRouter();
  const posthog = usePostHog();
  const { startSSOFlow } = useSSO();

  const signInWithOAuth = async (provider: OAuthProvider) => {
    posthog.capture('oauth_sign_in_initiated', { provider });
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: STRATEGY_MAP[provider],
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        posthog.capture('oauth_sign_in_completed', { provider });
        router.replace("/");
      }
    } catch (err) {
      console.error("OAuth error:", err);
      posthog.captureException(err instanceof Error ? err : new Error(String(err)), { provider });
    }
  };

  return { signInWithOAuth };
}
