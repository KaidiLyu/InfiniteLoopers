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
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const navigation = useNavigation();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { isWeb, isIOS, isAndroid, isMacos, platform } = usePlatform();

  const CreateAccount = () => {
    if (!email || !password || !name) {
      if (isAndroid)
        ToastAndroid.show("Please fill all the fields", ToastAndroid.BOTTOM);
      if (isWeb) console.log("Please fill all the fields");
      if (isIOS) alert("Please fill all the fields");
      if (isMacos) alert("Please fill all the fields");
      return;
    }
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
    <KeyboardAvoidingView behavior="height" style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: Colors.WHITE,
          }}>
          <View>
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
              </View>
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
