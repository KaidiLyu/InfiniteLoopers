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

  useEffect(() => {
    if (navigation && navigation.setOptions) {
      navigation.setOptions({
        headerShown: false,
      });
    }
  }, [navigation]);

  const [email, setEmail] = useState(""); // just for testing
  const [password, setPassword] = useState(""); // just for testing

  const { isWeb, isIOS, isAndroid, isMacos, platform } = usePlatform();
  const SignIn = () => {
    if (!email || !password) {
      if (isAndroid)
        ToastAndroid.show("Please fill all fields.", ToastAndroid.BOTTOM);
      console.log("Please fill all fields.");
      if (isIOS) {
        Alert.alert("Please fill all fields.");
      }
      return;
    }
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

        let errorMsg = "Login failed, please try again"; // 默认错误消息

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

        // 显示错误消息
        if (isAndroid) {
          ToastAndroid.show(errorMsg, ToastAndroid.BOTTOM);
        }
        if (isIOS) {
          Alert.alert("Login Error", errorMsg);
        }
        if (isWeb || isMacos) {
          console.error("Login Error:", errorMsg);
          // 如果Web端有其他显示错误的方式，可以在这里添加
          Alert.alert("Login Error", errorMsg);
        }
        console.log(errorMsg);
        
        return;
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
                transform: [{ rotate: "180deg" }],
                top: -40,
                right: -10,
                zIndex: 0,
              }}
            />
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: "absolute",
                padding: 20,
                marginTop: 20,
              }}>
              <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
            </TouchableOpacity>
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
