export default {
  expo: {
    name: "Chef IA",
    slug: "chef-ia",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#2E7D32",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.recipechat.chefia",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#2E7D32",
      },
      package: "com.recipechat.chefia",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    },
  },
};
