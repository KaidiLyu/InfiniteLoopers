import React from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { DailyTrackerProvider } from "../contexts/DailyTrackerContext";
import { Platform } from "react-native";

export default function TabLayout() {
  const tabBarHeight = Platform.OS === "ios" ? 85 : 65;

  return (
    <DailyTrackerProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.PRIMARY,
          tabBarInactiveTintColor: Colors.GRAY,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.WHITE,
            position: "absolute",
            left: 0,
            right: 0,
            height: tabBarHeight,
            paddingBottom: Platform.OS === "ios" ? 20 : 5,
            paddingTop: 5,
            borderTopWidth: 1,
            borderTopColor: Colors.LIGHT_GRAY,
            elevation: 5, // Android shadow
            shadowColor: "#000", // iOS shadow
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
          tabBarLabelStyle: {
            fontFamily: "myfont-medium",
            fontSize: 11,
            marginBottom: Platform.OS === "ios" ? -5 : 5,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === "ios" ? 5 : 0,
          },
        }}>
        {/* Tracker Tab */}
        <Tabs.Screen
          name="Tracker"
          options={{
            title: "Food Log",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="food-apple"
                size={28}
                color={color}
              />
            ),
          }}
        />

        {/* Nutrition Totals Tab */}
        <Tabs.Screen
          name="NutritionTotals"
          options={{
            title: "Daily Totals",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="nutrition"
                size={28}
                color={color}
              />
            ),
          }}
        />

        {/* SearchFood Tab */}
        <Tabs.Screen
          name="SearchFood"
          options={{
            title: "Search",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="magnify" size={28} color={color} />
            ),
          }}
        />

        {/* Profile Tab */}
        <Tabs.Screen
          name="Profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="account" size={28} color={color} />
            ),
          }}
        />
      </Tabs>
    </DailyTrackerProvider>
  );
}
