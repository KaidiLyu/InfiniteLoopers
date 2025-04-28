// Import necessary React Native components and libraries
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

// Define Settings screen component
export default function Settings() {
  const router = useRouter(); // Hook for navigation

  // Define the settings options available
  const settingsOptions = [
    { name: "Personal Information", screen: "/PersonalInfo" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Settings</Text>

      {/* Settings Options Card */}
      <View style={styles.card}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionButton}
            onPress={() => router.push(option.screen)}
          >
            <Text style={styles.optionText}>{option.name}</Text>
            <AntDesign name="right" size={20} color={Colors.WHITE} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/(tabs)/Profile")}
      >
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the Settings screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 32,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    textAlign: "center",
    marginBottom: "35%",
    marginTop: "10%",
  },
  card: {
    backgroundColor: Colors.BLACK,
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 30,
  },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomColor: Colors.GRAY,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 18,
    fontFamily: "myfont-medium",
    color: Colors.WHITE,
  },
  backButton: {
    backgroundColor: Colors.BLACK,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 18,
    fontFamily: "myfont-medium",
    color: Colors.WHITE,
  },
});
