import { View, Text } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { Colors } from "../../constants/Colors.ts";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

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
        headerShown: false,
        tabBarActiveTintColor: Colors.BLACK,
        tabBarInactiveTintColor: Colors.GRAY,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "myfont-medium",
        },
        tabBarStyle: {
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}>
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
      {/* <Tabs.Screen
        name="MyFood"
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="history" color={color} />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="Tracker"
        options={{
          tabBarLabel: "Daily Tracker",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar-check-outline" color={color} />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="RecipeSearch"
        options={{
          tabBarLabel: "Recipe Search",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chef-hat" size={24} color={color} />
          ),
        }}
      /> */}
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
