/**
 * Root Layout Component
 * 
 * This is the main layout component for the entire application.
 * It sets up:
 * 1. Custom fonts loading
 * 2. Platform detection through context
 * 3. The main navigation stack structure
 */
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Platform } from "react-native";
import { PlatformContext } from "../contexts/PlatformContext";

export default function RootLayout() {
  // Load custom fonts for consistent typography across the app
  useFonts({
    myfont: require("./../assets/fonts/myfont-Regular.ttf"),
    "myfont-medium": require("./../assets/fonts/myfont-Medium.ttf"),
    "myfont-bold": require("./../assets/fonts/myfont-Bold.ttf"),
  });

  // Create platform-specific values to be used throughout the app
  // This allows components to adapt their behavior based on platform
  const platformValue = {
    platform: Platform.OS,
    isWeb: Platform.OS === "web",
    isIOS: Platform.OS === "ios",
    isAndroid: Platform.OS === "android",
    isMacos: Platform.OS === "macos",
  };

  return (
    // Provide platform information to all child components
    <PlatformContext.Provider value={platformValue}>
      {/* Main navigation stack with header hidden by default */}
      <Stack screenOptions={{ headerShown: false }}>
        {/* <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        </Stack> */}
        
        {/* Main app screens */}
        <Stack.Screen name="(tabs)" /> {/* Tab-based navigation group */}
        <Stack.Screen name="settings" /> {/* Settings screen */}
        <Stack.Screen name="PersonalInfo" /> {/* Personal information screen */}
        <Stack.Screen name="CalorieGoal" /> {/* Calorie goal setting screen */}
      </Stack>
    </PlatformContext.Provider>
  );
}
