import Constants from 'expo-constants';

export function getApiBaseUrl(): string {
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) return `http://${hostUri}`;
  }
  return process.env.EXPO_PUBLIC_API_URL ?? '';
}
