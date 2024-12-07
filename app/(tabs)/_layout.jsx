import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors.ts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.BLACK,
      }}>
      <Tabs.Screen
        name="MyFood"
        options={{
          tabBarLabel: "Food History",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="SearchFood"
        options={{
          tabBarLabel: "Search",
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="magnifying-glass" size={24} color={color} />
          ),
        }}
      />
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
