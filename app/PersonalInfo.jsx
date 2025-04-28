/**
 * Personal Information Screen
 * 
 * This is a wrapper component that renders the PersonalInfo component
 * from the SettingsList directory. It serves as a routing endpoint
 * in the application's navigation structure, providing users access
 * to view and edit their personal information.
 */
import React from "react";
import PersonalInfo from "../components/SettingsList/PersonalInfo";

/**
 * PersonalInfoScreen Component
 * 
 * A simple functional component that renders the imported
 * PersonalInfo component. This follows the pattern of having
 * separate routing components that import and render the actual
 * functional components, which helps with code organization.
 * 
 * @returns {JSX.Element} The rendered PersonalInfo component
 */
export default function PersonalInfoScreen() {
  return <PersonalInfo />;
}
