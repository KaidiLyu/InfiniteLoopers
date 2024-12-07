import {
  View,
  Text,
  Image,
  Button,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  PanResponder,
  Animated,
} from "react-native";
import React, { useEffect } from "react";
import {
  Link,
  useNavigation,
  useRouter,
  useLocalSearchParams,
} from "expo-router";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { getRecipe } from "../api/GetRecipe";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";

export default function Recipe() {
  const router = useRouter();
  const navigation = useNavigation();
  const { title, id, name, image } = useLocalSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [savedImagePath, setSavedImagePath] = React.useState(null);
  const [isImageViewVisible, setIsImageViewVisible] = React.useState(false);
  const [scale] = React.useState(new Animated.Value(1));
  const [translateX] = React.useState(new Animated.Value(0));
  const [translateY] = React.useState(new Animated.Value(0));

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    nutritionLabel();
  }, []);

  const nutritionLabel = async () => {
    try {
      setLoading(true);
      console.log("Getting nutrition label for recipe id:", id);
      const filePath = await getRecipe(id);
      console.log("filePath: ", filePath);
      setSavedImagePath(filePath);
    } catch (error) {
      console.error("Error getting recipe:", error);
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Recipe", `Are you sure you want to delete ${name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Recipes", id));
            Alert.alert("Success", "Recipe deleted successfully");
            router.push({
              pathname: "/MyFood",
              params: { refresh: Date.now() },
            });
          } catch (error) {
            console.error("Error deleting recipe:", error);
            Alert.alert("Error", "Failed to delete recipe");
          }
        },
      },
    ]);
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.changedTouches.length === 2) {
          const touch1 = evt.nativeEvent.changedTouches[0];
          const touch2 = evt.nativeEvent.changedTouches[1];
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
              Math.pow(touch2.pageY - touch1.pageY, 2)
          );

          const newScale = distance / 200;
          scale.setValue(Math.max(1, Math.min(3, newScale)));
        } else {
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.WHITE,
      }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Recipe</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ marginTop: 20 }}>
          {/* <Text
            style={{
              fontSize: 24,
              fontFamily: "myfont-bold",
              textAlign: "center",
              textDecorationLine: "underline",
            }}>
            {name}
          </Text> */}
          {/* <Image
            source={{
              uri:
                title === "Recipes"
                  ? image
                  : `https://spoonacular.com/cdn/ingredients_100x100/${image}`,
            }}
            style={{
              width: 100,
              height: 100,
              alignSelf: "center",
              borderRadius: 50,
              borderWidth: 1,
              marginTop: "5%",
            }}
          /> */}
        </View>

        {savedImagePath &&
          (loading ? (
            <Image
              source={require("../../assets/picture/loading-gif.gif")}
              style={{
                width: 100,
                height: 100,
                alignSelf: "center",
                marginTop: 20,
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                onPress={() => setIsImageViewVisible(true)}
                style={{
                  width: "100%",
                  height: 400,
                  marginTop: 20,
                }}>
                <Image
                  source={{ uri: savedImagePath }}
                  style={{
                    width: "130%",
                    height: "130%",
                    resizeMode: "contain",
                    alignSelf: "center",
                  }}
                />
                {/* <Text
                  style={{
                    textAlign: "center",
                    color: Colors.GRAY,
                    fontFamily: "myfont",
                  }}>
                  Tap to zoom
                </Text> */}
              </TouchableOpacity>

              <Image
                source={{ uri: savedImagePath }}
                visible={isImageViewVisible}
              />
            </>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY,
  },
  deleteButton: {
    padding: 5,
  },
  headerText: {
    fontSize: 24,
    fontFamily: "myfont-bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  zoomableImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  zoomableImage: {
    width: "100%",
    height: "100%",
  },
});
