export default {
  expo: {
    name: 'duolingo-clone',
    slug: 'duolingo-clone',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assetss/images/icon.png',
    scheme: 'duolingoclone',
    userInterfaceStyle: 'automatic',
    ios: {
      bundleIdentifier: 'com.anonymous.duolingo-clone',
      infoPlist: {
        NSMicrophoneUsageDescription: 'This app uses the microphone for interactive audio lessons.',
      },
    },
    android: {
      package: 'com.anonymous.duolingoclone',
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assetss/images/android-icon-foreground.png',
        backgroundImage: './assetss/images/android-icon-background.png',
        monochromeImage: './assetss/images/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.BLUETOOTH',
        'android.permission.BLUETOOTH_CONNECT',
      ],
    },
    web: {
      output: 'static',
      favicon: './assetss/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#208AEF',
          android: {
            image: './assetss/images/splash-icon.png',
            imageWidth: 76,
          },
        },
      ],
      '@clerk/expo',
      'expo-secure-store',
      'expo-web-browser',
      '@stream-io/video-react-native-sdk',
      '@config-plugins/react-native-webrtc',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      posthogProjectToken: process.env.POSTHOG_PROJECT_TOKEN,
      posthogHost: process.env.POSTHOG_HOST || 'https://us.i.posthog.com',
    },
  },
}
