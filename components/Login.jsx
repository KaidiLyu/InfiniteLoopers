import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "../constants/Colors";
import { Link, useRouter } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Login() {
  const router = useRouter();

  return (
    <View
      style={{
        backgroundColor: Colors.WHITE,
        height: "100%",
      }}>
      <Image
        source={require("../assets/picture/Grilled Salmon with Veggies.jpg")} //place holder until we get acual image
        style={{
          width: "100%",
          height: "50%",
        }}
      />
      <View style={styles.container}>
        <Text
          style={{
            fontSize: 30,
            fontFamily: "myfont-bold",
            textAlign: "center",
          }}>
          AI{" "}
          <Text
            style={{
              fontFamily: "myfont-bold",
              color: Colors.BUTTON_GREEN,
              textDecorationLine: "underline",
            }}>
            Nutritional
          </Text>{" "}
          Search
        </Text>

        <Text
          style={{
            fontSize: 20,
            fontFamily: "myfont",
            textAlign: "center",
            marginTop: 20,
            marginBottom: 20,
            color: Colors.GRAY,
          }}>
          Create and find personalized nutritional info for your daily meals
          with included recipes and recommendations. All with the help of our
          personalized AI tool.
        </Text>

        <TouchableOpacity
          onPress={() => router.push("auth/sign-in")}
          style={{
            backgroundColor: Colors.BLACK,
            padding: 20,
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
              color: Colors.WHITE,
              textAlign: "center",
              flex: 1,
            }}>
            Continue
          </Text>
          <AntDesign
            name="forward"
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
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    marginTop: -40,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 3,
    height: "100%",
  },
  // button: {
  //   backgroundColor: Colors.BLACK,
  //   padding: 10,
  //   borderRadius: 10,
  //   marginTop: "30%",
  //   borderRadius: 20,
  // },
});
