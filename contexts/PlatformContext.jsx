/**
 * Platform Context Module
 * 
 * This module provides a React Context for platform-specific information,
 * making it easy to access the current platform (iOS, Android, web, macOS)
 * throughout the application without repeatedly using Platform API directly.
 */
import { createContext, useContext } from "react";
import { Platform } from "react-native";

/**
 * PlatformContext
 * 
 * A React Context that contains platform-specific information:
 * - platform: The current platform OS name (ios, android, web, macos)
 * - isWeb: Boolean flag indicating if the app is running on web
 * - isIOS: Boolean flag indicating if the app is running on iOS
 * - isAndroid: Boolean flag indicating if the app is running on Android
 * - isMacos: Boolean flag indicating if the app is running on macOS
 */
export const PlatformContext = createContext({
  platform: Platform.OS,
  isWeb: Platform.OS === "web",
  isIOS: Platform.OS === "ios",
  isAndroid: Platform.OS === "android",
  isMacos: Platform.OS === "macos",
});

/**
 * usePlatform Hook
 * 
 * A custom React hook that provides easy access to the platform information.
 * This hook can be used in any component to determine the current platform
 * and conditionally render platform-specific UI or behavior.
 * 
 * @returns {Object} The platform context object with platform information
 * @example
 * const { isIOS, isAndroid } = usePlatform();
 * // Now you can conditionally render based on platform
 * return isIOS ? <IOSComponent /> : <AndroidComponent />;
 */
export const usePlatform = () => useContext(PlatformContext);
