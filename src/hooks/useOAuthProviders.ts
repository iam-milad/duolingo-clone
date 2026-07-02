import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "facebook" | "apple";

const STRATEGY_MAP = {
  google: "oauth_google",
  facebook: "oauth_facebook",
  apple: "oauth_apple",
} as const;

export function useOAuthProviders() {
  const router = useRouter();
  const { startSSOFlow } = useSSO();

  const signInWithOAuth = async (provider: OAuthProvider) => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: STRATEGY_MAP[provider],
      });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  return { signInWithOAuth };
}
