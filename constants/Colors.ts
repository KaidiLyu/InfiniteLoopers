/**
 * Application Color Palette
 * 
 * This file defines the color schemes used throughout the application.
 * Colors are organized into primary constants and themed variants (light/dark mode).
 * 
 * The application uses a consistent color system to maintain visual harmony
 * across different screens and components.
 */

// Theme color variables for light and dark modes
const tintColorLight = "#0a7ea4";  // Primary accent color for light mode (blue-teal)
const tintColorDark = "#fff";      // Primary accent color for dark mode (white)

/**
 * Main color palette object exported for use throughout the app
 * Contains both flat color values and themed variants
 */
export const Colors = {
  // Flat colors (used regardless of theme)
  WHITE: "#fff",        // Pure white - backgrounds, text on dark surfaces
  BLACK: "#000",        // Pure black - text, icons on light surfaces
  GRAY: "#78866B",      // Medium gray with slight green tint - secondary text
  DARK_GRAY: "#11181C", // Nearly black gray - primary text in light mode
  BUTTON_GREEN: "#73C913", // Bright green - action buttons, success states
  DISABLED: "#f0f0f0",  // Very light gray - disabled component backgrounds
  DISABLED_TEXT: "#c0c0c0", // Light gray - text on disabled components
  LIGHT_GRAY: "#e0e0e0",    // Light gray - borders, dividers
  EXTRA_LIGHT_GRAY: "#f5f5f5", // Nearly white gray - secondary backgrounds, cards
  RED: "#E53935",       // Bright red - errors, deletions, warnings
  PRIMARY: "#0A7EA4",   // Primary brand color - headers, primary buttons
  GREEN: "#4CAF50",     // Medium green - success messages, positive indicators
  
  // Themed color variations (for light/dark mode support)
  light: {
    text: "#11181C",           // Primary text color in light mode
    background: "#fff",        // Primary background in light mode
    tint: tintColorLight,      // Accent color for light mode
    icon: "#687076",           // Default icon color in light mode
    tabIconDefault: "#687076", // Inactive tab icon color in light mode
    tabIconSelected: tintColorLight, // Active tab icon color in light mode
  },
  dark: {
    text: "#ECEDEE",           // Primary text color in dark mode
    background: "#151718",     // Primary background in dark mode
    tint: tintColorDark,       // Accent color for dark mode
    icon: "#9BA1A6",           // Default icon color in dark mode
    tabIconDefault: "#9BA1A6", // Inactive tab icon color in dark mode
    tabIconSelected: tintColorDark, // Active tab icon color in dark mode
  },
};
