/**
 * Sign In Screen Component
 * 
 * This component provides a user interface for the sign-in functionality
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
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors.ts";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { usePlatform } from "../../../contexts/PlatformContext.jsx";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../configs/FirebaseConfig.js";

export default function SignIn() {
  const navigation = useNavigation();
  const router = useRouter();

  // Hide the header when component mounts
  useEffect(() => {
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false,
      });
    }
  }, [navigation]);

  // State variables for user credentials
  const [email, setEmail] = useState(""); // just for testing
  const [password, setPassword] = useState(""); // just for testing

  // Get platform-specific information from context
  const { isWeb, isIOS, isAndroid, isMacos, platform } = usePlatform();
  
  /**
   * Handle user sign-in with Firebase authentication
   * 
   * Validates user inputs, attempts authentication with Firebase,
   * and handles platform-specific error messages.
   */
  const SignIn = () => {
    // Validate that email and password fields are not empty
    if (!email || !password) {
      if (isAndroid)
        ToastAndroid.show("Please fill all fields.", ToastAndroid.BOTTOM);
      console.log("Please fill all fields.");
      if (isIOS) {
        Alert.alert("Please fill all fields.");
      }
      return;
    }
    
    // Attempt Firebase authentication with provided credentials
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        router.replace("/SearchFood");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
        console.log("-----------------");

        let errorMsg = "Login failed, please try again"; // Default error message

        // Provide specific error messages based on Firebase error codes
        if (errorCode === "auth/invalid-credential") {
          errorMsg = "Invalid login credentials";
        } else if (errorCode === "auth/missing-password") {
          errorMsg = "Please enter your password";
        } else if (errorCode === "auth/wrong-password") {
          errorMsg = "Wrong password, please try again";
        } else if (errorCode === "auth/user-not-found") {
          errorMsg = "The user does not exist, please check your email or register a new account";
        } else if (errorCode === "auth/too-many-requests") {
          errorMsg = "Too many login attempts, please try again later";
        } else if (errorCode === "auth/network-request-failed") {
          errorMsg = "Network connection failed, please check your network";
        }

        // Display error message according to platform
        if (isAndroid) {
          ToastAndroid.show(errorMsg, ToastAndroid.BOTTOM);
        }
        if (isIOS) {
          Alert.alert("Login Error", errorMsg);
        }
        if (isWeb || isMacos) {
          console.error("Login Error:", errorMsg);
          // If there are other ways to display errors on the web, add them here
          Alert.alert("Login Error", errorMsg);
        }
        console.log(errorMsg);
        
        return;
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
                transform: [{ rotate: "180deg" }],
                top: -40,
                right: -10,
                zIndex: 0,
              }}
            />
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: "absolute",
                padding: 20,
                marginTop: 20,
              }}>
              <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
            </TouchableOpacity>
            {/* Main form container */}
            <View style={{ padding: 20, marginTop: "50%" }}>
              <Text
                style={{
                  fontSize: 38,
                  fontFamily: "myfont-bold",
                }}>
                Hello!
              </Text>

              <Text
                style={{
                  fontSize: 28,
                  fontFamily: "myfont",
                  marginTop: 10,
                  color: Colors.GRAY,
                }}>
                Please Sign In
              </Text>
              {/* Email input field */}
              <View style={{ marginTop: 30 }}>
                <Text style={{ fontFamily: "myfont-bold", marginLeft: 10 }}>
                  Email
                </Text>
                <TextInput
                  placeholder="Enter Your Email"
                  style={styles.inputForm}
                  onChangeText={(value) => setEmail(value)}
                />
              </View>
              {/* Password input field */}
              <View style={{ marginTop: 15 }}>
                <Text style={{ fontFamily: "myfont-bold", marginLeft: 10 }}>
                  Password
                </Text>
                <TextInput
                  placeholder="Enter Password"
                  secureTextEntry
                  style={styles.inputForm}
                  onChangeText={(value) => setPassword(value)}
                />
              </View>

              {/* Sign In button */}
              <TouchableOpacity
                onPress={SignIn}
                style={{
                  backgroundColor: Colors.WHITE,
                  padding: 15,
                  borderRadius: 10,
                  borderWidth: 1,
                  marginTop: "10%",
                  borderRadius: 20,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: "myfont-medium",
                    color: Colors.BLACK,
                    textAlign: "center",
                    flex: 1,
                  }}>
                  Submit
                </Text>
                <AntDesign
                  name="caretright"
                  size={24}
                  color="black"
                  style={{
                    position: "absolute",
                    right: 20,
                  }}
                />
              </TouchableOpacity>
              {/* Text and icon for new users */}
              <View
                style={{
                  marginTop: 13,
                  flexDirection: "row",
                }}>
                <Text
                  style={{
                    fontFamily: "myfont-medium",
                    fontSize: 15,
                    marginRight: 5,
                  }}>
                  First time users
                </Text>
                <MaterialCommunityIcons
                  name="arrow-down-right"
                  size={24}
                  color="black"
                  style={{
                    position: "relative",
                    top: 4,
                    right: 4,
                  }}
                />
              </View>
              {/* Create Account button */}
              <TouchableOpacity
                onPress={() => router.push("auth/sign-up")}
                style={{
                  backgroundColor: Colors.BLACK,
                  padding: 15,
                  borderRadius: 10,
                  borderWidth: 1,
                  marginTop: "2%",
                  borderRadius: 20,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
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
