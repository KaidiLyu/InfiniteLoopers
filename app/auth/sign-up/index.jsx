/**
 * Sign Up Screen Component
 * 
 * This component provides a user interface for the sign-up functionality
 * using Firebase Authentication with email and password.
 * It includes form validation, error handling, and navigation between screens.
 */
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ToastAndroid,
} from "react-native";

import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors.ts";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../../configs/FirebaseConfig.js";
import { usePlatform } from "../../../contexts/PlatformContext.jsx";

export default function SignUp() {
  // Hide the header when component mounts
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const navigation = useNavigation();
  const router = useRouter();

  // State variables for user registration information
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  // Get platform-specific information from context
  const { isWeb, isIOS, isAndroid, isMacos, platform } = usePlatform();

  /**
   * Handle user account creation with Firebase authentication
   * 
   * Validates user inputs, attempts to create a new account with Firebase,
   * updates the user profile with display name, and handles platform-specific error messages.
   */
  const CreateAccount = () => {
    // Validate that all fields are not empty
    if (!email || !password || !name) {
      if (isAndroid)
        ToastAndroid.show("Please fill all the fields", ToastAndroid.BOTTOM);
      if (isWeb) console.log("Please fill all the fields");
      if (isIOS) alert("Please fill all the fields");
      if (isMacos) alert("Please fill all the fields");
      return;
    }
    // Attempt to create a new user with Firebase
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        // Update display name
        return updateProfile(user, {
          displayName: name,
        }).then(() => {
          console.log("Display name set successfully");
          router.replace("/SearchFood");
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode);
        // Handle specific Firebase error codes with platform-specific messages
        if (errorCode === "auth/weak-password") {
          if (isAndroid)
            ToastAndroid.show("Weak password", ToastAndroid.BOTTOM);
          if (isWeb) console.log("Weak password");
          if (isIOS) alert("Weak password");
          if (isMacos) alert("Weak password");
          return;
        }
        if (errorCode === "auth/invalid-email") {
          if (isAndroid)
            ToastAndroid.show("Invalid email", ToastAndroid.BOTTOM);
          if (isWeb) console.log("Invalid email");
          if (isIOS) alert("Invalid email");
          if (isMacos) alert("Invalid email");
          return;
        }
        if (errorCode === "auth/email-already-in-use") {
          if (isAndroid)
            ToastAndroid.show("Email already in use", ToastAndroid.BOTTOM);
          if (isWeb) console.log("Email already in use");
          if (isIOS) alert("Email already in use");
          if (isMacos) alert("Email already in use");
          return;
        }
        // ..
      });
  };

  return (
    // KeyboardAvoidingView adjusts layout when keyboard appears
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      {/* Dismiss keyboard when tapping outside input fields */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: Colors.WHITE,
          }}>
          <View>
            {/* Decorative background image */}
            <Image
              source={require("../../../assets/images/greenImage.jpg")}
              style={{
                width: "105%",
                height: "50%",
                position: "absolute",
                transform: [{ rotate: "90deg" }],
                top: -40,
                right: 10,
                zIndex: 0,
              }}
            />
            {/* Back button to sign-in screen */}
            <TouchableOpacity onPress={() => router.replace("auth/sign-in")}>
              <FontAwesome6
                name="circle-arrow-left"
                size={30}
                color="black"
                style={{
                  position: "relative",
                  padding: 20,
                  marginTop: 20,
                }}
              />
            </TouchableOpacity>
            {/* Main form container */}
            <View style={{ padding: 20, marginTop: "45%" }}>
              <Text
                style={{
                  fontSize: 35,
                  fontFamily: "myfont-medium",
                  textAlign: "right",
                }}>
                Create{" "}
                <Text
                  style={{
                    textDecorationLine: "underline",
                    color: Colors.BUTTON_GREEN,
                    fontFamily: "myfont-bold",
                  }}>
                  Free
                </Text>{" "}
                Account
              </Text>
              {/* Email input field */}
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontFamily: "myfont-bold", marginLeft: 10 }}>
                  Email
                </Text>
                <TextInput
                  placeholder="Enter Your Email"
                  style={styles.inputForm}
                  onChangeText={(value) => setEmail(value)}
                />
              </View>
              {/* Password input field with requirement note */}
              <View style={{ marginTop: 15 }}>
                <Text style={{ fontFamily: "myfont-bold", marginLeft: 10 }}>
                  Password
                </Text>
                <TextInput
                  placeholder="Enter Password"
                  secureTextEntry
                  style={styles.inputForm}
                  value={password}
                  onChangeText={(value) => setPassword(value)}
                />
                <Text style={{ fontFamily: "myfont-medium", fontSize: 12, color: Colors.GRAY, marginLeft: 10, marginTop: 4}}>
                  Password must be a minimum of 6 characters
                </Text>
              </View>
              {/* Name input field */}
              <View style={{ marginTop: 20 }}>
                <Text style={{ fontFamily: "myfont-bold", marginLeft: 10 }}>
                  Name
                </Text>
                <TextInput
                  placeholder="Enter Your Name"
                  style={styles.inputForm}
                  onChangeText={(value) => setName(value)}
                />
              </View>
              {/* Create Account button */}
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.BLACK,
                  padding: 15,
                  borderRadius: 20,
                  marginTop: "7%",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={CreateAccount}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "myfont-medium",
                    color: Colors.WHITE,
                    textAlign: "center",
                    flex: 1,
                  }}>
                  Create Account
                </Text>
                <AntDesign
                  name="caretright"
                  size={24}
                  color="white"
                  style={{
                    position: "absolute",
                    right: 20,
                  }}
                />
              </TouchableOpacity>
              {/* Sign in link for existing users */}
              <View
                style={{
                  flexDirection: "row",
                  marginTop: 10,
                }}>
                <Text
                  style={{
                    fontFamily: "myfont-medium",
                    fontSize: 15,
                    marginRight: 5,
                  }}>
                  Already have an account?
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("auth/sign-in")}>
                  <Text
                    style={{
                      textDecorationLine: "underline",
                      fontFamily: "myfont-medium",
                      fontSize: 15,
                    }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
  inputForm: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 20,
    fontFamily: "myfont",
    marginTop: 10,
  },
});
