import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "../../constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useRouter } from "expo-router";
export default function CreateNewFoodCard() {
  const router = useRouter();
  return (
    <View
      style={{
        display: "flex",
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
      }}>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          gap: "10%",
          marginTop: "15%",
          justifyContent: "center",
        }}>
        <MaterialCommunityIcons
          name="food-off"
          size={40}
          color={Colors.BLACK}
        />
      </View>
      <Text
        style={{
          fontFamily: "myfont-medium",
          fontSize: 30,
          textAlign: "center",
          marginTop: "2%",
        }}>
        Empty food history
      </Text>
      <Text
        style={{
          color: Colors.GRAY,
          fontFamily: "myfont",
          fontSize: 23,
          textAlign: "center",
          marginTop: "5%",
        }}>
        Uh oh... you have nothing saved. Click the button below to find
        nutritional information about your food!
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/SearchFood")}
        style={{
          backgroundColor: Colors.BLACK,
          padding: 14,
          borderRadius: 20,
          paddingLeft: 50,
          paddingRight: 50,
          marginTop: "8%",
          alignItems: "center",
          display: "flex",
          flexDirection: "row",
        }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: "myfont-medium",
            color: Colors.WHITE,
          }}>
          Search nutrition info{" "}
        </Text>
        <AntDesign
          name="caretright"
          size={24}
          color="white"
          style={{ position: "absolute", right: "5%" }}
        />
      </TouchableOpacity>
    </View>
  );
}
