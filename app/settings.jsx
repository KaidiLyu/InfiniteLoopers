/**
 * Settings Screen
 * 
 * This is a wrapper component that renders the Settings component
 * from the components directory. It serves as a routing endpoint
 * in the application's navigation structure, providing users access
 * to various application settings and preferences.
 */
import React from "react";
import Settings from "../components/Settings";

/**
 * SettingsScreen Component
 * 
 * A simple functional component that renders the imported
 * Settings component. This follows the pattern of having
 * separate routing components that import and render the actual
 * functional components, which helps with code organization.
 * 
 * @returns {JSX.Element} The rendered Settings component
 */
export default function SettingsScreen() {
  return <Settings />;
}
