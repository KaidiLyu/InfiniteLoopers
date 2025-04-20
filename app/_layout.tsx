import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Platform } from "react-native";
import { PlatformContext } from "../contexts/PlatformContext";

export default function RootLayout() {
  useFonts({
    myfont: require("./../assets/fonts/myfont-Regular.ttf"),
    "myfont-medium": require("./../assets/fonts/myfont-Medium.ttf"),
    "myfont-bold": require("./../assets/fonts/myfont-Bold.ttf"),
  });

  const platformValue = {
    platform: Platform.OS,
    isWeb: Platform.OS === "web",
    isIOS: Platform.OS === "ios",
    isAndroid: Platform.OS === "android",
    isMacos: Platform.OS === "macos",
  };

  return (
    <PlatformContext.Provider value={platformValue}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        </Stack> */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="PersonalInfo" />
        <Stack.Screen name="CalorieGoal" />
      </Stack>
    </PlatformContext.Provider>
  );
}
