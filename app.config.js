export default {
  expo: {
    name: "¿Qué Comemos Hoy?",
    slug: "que-comemos-hoy",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/logo.png",
      resizeMode: "contain",
      backgroundColor: "#F5F3EF",
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.recipechat.quecomemoshoy",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#F5A623",
      },
      package: "com.recipechat.quecomemoshoy",
    },
    web: {
      favicon: "./assets/logo.png",
    },
    extra: {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    },
  },
};
