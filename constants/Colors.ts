/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  WHITE: "#fff",
  BLACK: "#000",
  GRAY: "#78866B",
  DARK_GRAY: "#11181C",
  BUTTON_GREEN: "#73C913",
  DISABLED: "#f0f0f0",
  DISABLED_TEXT: "#c0c0c0",
  LIGHT_GRAY: "#e0e0e0",
  EXTRA_LIGHT_GRAY: "#f5f5f5",
  RED: "#E53935",
  PRIMARY: "#0A7EA4",
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
