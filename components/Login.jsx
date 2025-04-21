import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Login() {
  const router = useRouter();
  return (
    <View style={styles.wrapper}>
      <Image
        source={require("../assets/picture/Grilled Salmon with Veggies.jpg")}
        style={styles.heroImage}
      />
      <View style={styles.card}>
        <Text style={styles.title}>
          AI <Text style={styles.highlight}>Nutritional</Text> Search
        </Text>
        <Text style={styles.description}>
          Create, find, and save personalized nutritional info for your daily
          meals with a calorie and nutrition tracker to keep you the very best
          you can be.
        </Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push("auth/sign-in")}>
          <Text style={styles.continueButtonText}>Continue</Text>
          <AntDesign
            name="forward"
            size={24}
            color="#fff"
            style={styles.continueIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  heroImage: {
    width: "100%",
    height: "50%",
  },
  card: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    marginTop: -40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    borderWidth: 2,
    borderColor: Colors.BLACK,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontFamily: "myfont-bold",
    textAlign: "center",
    color: Colors.BLACK,
  },
  highlight: {
    color: Colors.BUTTON_GREEN,
    textDecorationLine: "underline",
  },
  description: {
    fontSize: 18,
    fontFamily: "myfont",
    maxWidth: "80%",
    textAlign: "center",
    alignSelf: "center",
    color: Colors.GRAY,
    marginVertical: 20,
  },
  continueButton: {
    backgroundColor: Colors.BLACK,
    paddingVertical: 20,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    position: "relative",
  },
  continueButtonText: {
    fontSize: 20,
    fontFamily: "myfont-medium",
    color: Colors.WHITE,
    minWidth: 100,
    textAlign: "center",
  },
  continueIcon: {
    position: "absolute",
    right: 20,
  },
});
