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
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Link, useNavigation, useRouter } from "expo-router";
import { Colors } from "../../../constants/Colors.ts";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../configs/FirebaseConfig.js";
import { getFriendlyAuthErrorMessage } from "../../../src/utils/authUtils";

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

  // State variables for user credentials and error handling
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * Handle user sign-in with Firebase authentication
   *
   * Validates user inputs, attempts authentication with Firebase,
   * and handles platform-specific error messages.
   */
  const handleSignIn = () => {
    setError(""); // Clear previous error on new attempt
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        // Navigate to main app screen on successful sign-in
        router.replace("/(tabs)/SearchFood"); // Example: Replace with your main tab route
      })
      .catch((err) => {
        const friendlyError = getFriendlyAuthErrorMessage(err);
        setError(friendlyError); // Set the error state to display message
        // console.error("Sign In Error:", err); // Keep detailed log for debugging
      });
  };

  return (
    // KeyboardAvoidingView adjusts layout when keyboard appears
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}>
      {/* Dismiss keyboard when tapping outside input fields */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled">
          <View>
            {/* Decorative background image */}
            <Image
              source={require("../../../assets/images/greenImage.jpg")}
              style={styles.backgroundImage}
            />
            {/* Back button */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}>
              <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
            </TouchableOpacity>
            {/* Main form container */}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Hello!</Text>
              <Text style={styles.subtitle}>Please Sign In</Text>
              {/* Email input field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  placeholder="Enter Your Email"
                  style={styles.inputForm}
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setError("");
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>
              {/* Password input field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  placeholder="Enter Password"
                  secureTextEntry
                  style={styles.inputForm}
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  textContentType="password"
                />
              </View>
              {/* Error Message Display */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              {/* Sign In button */}
              <TouchableOpacity
                onPress={handleSignIn}
                style={[styles.button, styles.submitButton]}>
                <Text style={[styles.buttonText, styles.submitButtonText]}>
                  Submit
                </Text>
                <AntDesign
                  name="caretright"
                  size={24}
                  color="black"
                  style={styles.buttonIconRight}
                />
              </TouchableOpacity>
              {/* Text and icon for new users */}
              <View style={styles.newUserContainer}>
                <Text style={styles.newUserText}>First time users</Text>
                <MaterialCommunityIcons
                  name="arrow-down-right"
                  size={24}
                  color="black"
                  style={styles.newUserIcon}
                />
              </View>
              {/* Create Account button */}
              <TouchableOpacity
                onPress={() => router.push("auth/sign-up")}
                style={[styles.button, styles.createButton]}>
                <Text style={[styles.buttonText, styles.createButtonText]}>
                  Create Account
                </Text>
                <AntDesign
                  name="caretright"
                  size={24}
                  color="white"
                  style={styles.buttonIconRight}
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
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: Colors.WHITE,
    justifyContent: "center",
  },
  backgroundImage: {
    width: "105%",
    height: "50%",
    position: "absolute",
    transform: [{ rotate: "180deg" }],
    top: -40,
    right: -10,
    zIndex: 0,
  },
  backButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 15,
    zIndex: 10,
    padding: 5,
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingVertical: 20,
    marginTop: "45%",
  },
  title: {
    fontSize: 38,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
  },
  subtitle: {
    fontSize: 28,
    fontFamily: "myfont",
    marginTop: 10,
    color: Colors.GRAY,
  },
  inputGroup: {
    marginTop: 25,
  },
  inputLabel: {
    fontFamily: "myfont-bold",
    marginLeft: 10,
    marginBottom: 5,
    color: Colors.DARK_GRAY,
  },
  inputForm: {
    paddingVertical: Platform.OS === "ios" ? 18 : 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 15,
    fontFamily: "myfont",
    fontSize: 16,
    backgroundColor: Colors.WHITE,
  },
  errorText: {
    color: Colors.RED,
    fontFamily: "myfont-medium",
    marginTop: 15,
    marginBottom: 5,
    textAlign: "center",
    fontSize: 14,
  },
  button: {
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 50,
  },
  submitButton: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1.5,
    borderColor: Colors.BLACK,
    marginTop: "10%",
  },
  submitButtonText: {
    color: Colors.BLACK,
  },
  createButton: {
    backgroundColor: Colors.BLACK,
    marginTop: 10,
  },
  createButtonText: {
    color: Colors.WHITE,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "myfont-medium",
    textAlign: "center",
    flex: 1,
  },
  buttonIconRight: {
    position: "absolute",
    right: 20,
  },
  newUserContainer: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
  },
  newUserText: {
    fontFamily: "myfont-medium",
    fontSize: 15,
    marginRight: 3,
    color: Colors.DARK_GRAY,
  },
  newUserIcon: {},
});
