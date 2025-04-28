/**
 * Tabs Layout Component
 * 
 * This component defines the bottom tab navigation structure of the application.
 * It sets up the main navigation tabs and their visual appearance.
 */
import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors.ts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

/**
 * TabBarIcon Component
 * 
 * A reusable component for rendering icons in the tab bar.
 * Allows specifying different icon libraries for each tab.
 * 
 * @param {string} name - The icon name from the specified icon library
 * @param {string} color - The color of the icon (changes based on active state)
 * @param {Component} IconComponent - The icon library component to use
 */
const TabBarIcon = ({
  name,
  color,
  IconComponent = MaterialCommunityIcons,
}) => (
  <IconComponent
    name={name}
    size={28}
    color={color}
    style={{ marginBottom: -3 }}
  />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // Hide the header for all tab screens
        headerShown: false,
        // Set active and inactive tab colors
        tabBarActiveTintColor: Colors.BLACK,
        tabBarInactiveTintColor: Colors.GRAY,
        // Style the tab labels
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "myfont-medium",
        },
        // Style the entire tab bar
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}>
      {/* Food Search Tab - Main search functionality for finding food items */}
      <Tabs.Screen
        name="SearchFood"
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => (
            <TabBarIcon
              name="magnifying-glass"
              color={color}
              IconComponent={FontAwesome6}
            />
          ),
        }}
      />
      {/* MyFood Tab - Currently disabled
          Would show user's food history
      <Tabs.Screen
        name="MyFood"
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="history" color={color} />
          ),
        }}
      /> */}
      
      {/* Daily Tracker Tab - Shows food intake tracking for the day */}
      <Tabs.Screen
        name="Tracker"
        options={{
          tabBarLabel: "Daily Tracker",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar-check-outline" color={color} />
          ),
        }}
      />
      
      {/* Recipe Search Tab - Currently disabled
          Would provide recipe search functionality
      <Tabs.Screen
        name="RecipeSearch"
        options={{
          tabBarLabel: "Recipe Search",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chef-hat" size={24} color={color} />
          ),
        }}
      /> */}
      
      {/* User Profile Tab - Shows user information and settings */}
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
