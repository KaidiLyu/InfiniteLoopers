import { createContext, useContext } from "react";
import { Platform } from "react-native";

export const PlatformContext = createContext({
  platform: Platform.OS,
  isWeb: Platform.OS === "web",
  isIOS: Platform.OS === "ios",
  isAndroid: Platform.OS === "android",
  isMacos: Platform.OS === "macos",
});

export const usePlatform = () => useContext(PlatformContext);
