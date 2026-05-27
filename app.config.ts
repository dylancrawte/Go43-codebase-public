import { ExpoConfig, ConfigContext } from '@expo/config';

const IS_DEV = process.env.APP_VARIANT === 'dev';
const IS_PROD = process.env.APP_VARIANT === 'prod';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return 'com.anonymous.GO43.dev';
  }

  if (IS_PREVIEW) {
    return 'com.anonymous.GO43.preview';
  }

  if (IS_PROD) {
    return 'com.anonymous.GO43';
  }

  return 'com.anonymous.GO43';
};

const getAppName = () => {
  if (IS_DEV) {
    return 'Go43 (Dev)';
  }

  if (IS_PREVIEW) {
    return 'Go43 (Preview)';
  }

  if (IS_PROD) {
    return 'Go43';
  }

  return 'Go43';
};

export default ({ config }: ConfigContext): ExpoConfig => {
  
  return {
    ...config,
    name: getAppName(),
    slug: 'GO43',
    icon: './assets/images/G-LOGO.png',
    version: '1.0.2',
    splash: {
      image: './assets/images/G-LOGO.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    orientation: 'portrait',
    scheme: 'go43app',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    platforms: ['ios', 'android', 'web'],
    ios: {
      icon: './assets/images/G-LOGO.png',
      ...config.ios,
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
      buildNumber: '7',
      splash: {
        image: './assets/images/G-LOGO.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        CFBundleDisplayName: getAppName(),
        NSPhotoLibraryUsageDescription: "We need access to your photo library so you can pick media to upload.",
      },
      associatedDomains: process.env.EXPO_PUBLIC_IOS_ASSOCIATED_DOMAINS
        ? process.env.EXPO_PUBLIC_IOS_ASSOCIATED_DOMAINS.split(",").map((d) => d.trim())
        : [],
    },
    android: {
      ...config.android,
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: getUniqueIdentifier(),
    },
    web: {
      output: 'static',
      favicon: './assets/images/adaptive-icon.png',
      bundler: 'metro',
    },
    plugins: [
      'expo-router',
      [
        'react-native-tiktok',
        {
          "tiktokClientKey": process.env.EXPO_PUBLIC_TIKTOK_CLIENT_KEY || "YOUR_TIKTOK_CLIENT_KEY"
        }
      ],
      [
        'expo-splash-screen',
        {
          image: './assets/images/GO43-LOGO.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
      'expo-font',
      'expo-web-browser',
      [
        'expo-notifications',
        {
          icon: './assets/images/G-LOGO.png',
          color: '#FF66C4',
          defaultChannel: 'default',
        },
      ],
      'sentry-expo',
    ],
    experiments: { typedRoutes: true },
    extra: {
      ...config.extra,
      router: { origin: false },
      appEnv: IS_DEV ? 'dev' : IS_PREVIEW ? 'preview' : 'prod',
      ...(process.env.EXPO_PUBLIC_EAS_PROJECT_ID
        ? { eas: { projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID } }
        : {}),
    },

    runtimeVersion: '1.0.0',
  };
};