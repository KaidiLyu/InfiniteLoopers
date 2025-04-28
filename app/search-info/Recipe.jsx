/**
 * Recipe Information Component
 * 
 * This component displays nutritional information for a recipe or ingredient.
 * It fetches and displays a nutrition label image, provides recipe details,
 * and allows users to navigate to the full recipe or delete saved items.
 */
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useEffect } from "react";
import {
  Link,
  useNavigation,
  useRouter,
  useLocalSearchParams,
} from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { getNutritionLabel } from "../api/NutritionLabelRecipe";
import ResponsiveImageView from "react-native-responsive-image-view";
import Entypo from "@expo/vector-icons/Entypo";
import { Feather } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";

export default function NutritionInfo() {
  const router = useRouter();
  const navigation = useNavigation();
  // Get parameters passed from the previous screen
  const { title, id, name, image } = useLocalSearchParams();
  // Component state
  const [loading, setLoading] = React.useState(false);
  const [savedImagePath, setSavedImagePath] = React.useState(null);
  const [isImageViewVisible, setIsImageViewVisible] = React.useState(false);

  /**
   * Initialize component and fetch nutrition label on mount
   */
  useEffect(() => {
    // Hide the default header
    navigation.setOptions({
      headerShown: false,
    });
    // Log received parameters for debugging
    console.log("--------------------------------");
    console.log("title", title);
    console.log("id", id);
    console.log("name", name);
    console.log("image", image);
    console.log("--------------------------------");
    // Fetch nutrition label for the recipe
    nutritionLabel();
  }, []);

  /**
   * Fetch nutrition label image for the recipe
   * 
   * Calls the nutrition label API to generate and fetch
   * a nutrition facts label for the current recipe
   */
  const nutritionLabel = async () => {
    try {
      setLoading(true);
      console.log("Getting nutrition label for recipe id:", id);
      const filePath = await getNutritionLabel(id);
      console.log("filePath", filePath);
      setSavedImagePath(filePath);
    } catch (error) {
      console.error("Error getting nutrition label:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle item deletion from the database
   * 
   * Shows a confirmation dialog before deleting the recipe
   * from Firestore and navigating back to the search screen
   */
  const handleDelete = () => {
    Alert.alert("Delete Item", `Are you sure you want to delete ${name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Delete recipe document from Firestore
            await deleteDoc(doc(db, title, id));
            router.back();
            Alert.alert("Success", "Item deleted successfully");
            // Navigate back to search screen with refresh parameter
            router.push({
              pathname: "/(tabs)/SearchFood",
              params: { refresh: Date.now() },
            });
          } catch (error) {
            console.error("Error deleting item:", error);
            Alert.alert("Error", "Failed to delete item");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header with back button, title, and delete button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1}>
          Nutrition label
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Main content container */}
      <View style={styles.contentContainer}>
        {/* Recipe name and image section */}
        <View style={styles.titleSection}>
          <Text style={styles.itemName}>{name}</Text>
          <Image
            source={{
              uri:
                title === "Recipes"
                  ? image
                  : `https://spoonacular.com/cdn/ingredients_100x100/${image}`,
            }}
            style={styles.itemImage}
          />
        </View>

        {/* Nutrition label image section - displays loading state or nutrition image */}
        {savedImagePath &&
          (loading ? (
            <Image
              source={require("../../assets/picture/loading-gif.gif")}
              style={styles.loadingImage}
            />
          ) : (
            <>
              {/* Clickable nutrition label to show larger view */}
              <TouchableOpacity
                onPress={() => setIsImageViewVisible(true)}
                style={styles.nutritionImageContainer}>
                <Image
                  source={{ uri: savedImagePath }}
                  style={styles.nutritionImage}
                />
                <Text style={styles.zoomHint}></Text>
              </TouchableOpacity>

              {/* Full-size image viewer when expanded */}
              <Image
                source={{ uri: savedImagePath }}
                visible={isImageViewVisible}
              />
            </>
          ))}

        {/* Button to navigate to full recipe details */}
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/search-info/Recipe",
              params: { title, id, name, image },
            });
          }}
          style={styles.recipeButton}>
          <Text style={styles.recipeButtonText}>Get This Recipe!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Component styles
 * 
 * Defines styling for:
 * - Overall container and header layout
 * - Recipe title and image presentation
 * - Nutrition label image display
 * - Interactive elements like buttons
 * - Loading indicators
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    fontFamily: "myfont-bold",
    textAlign: "center",
    marginHorizontal: 10,
  },
  deleteButton: {
    padding: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  titleLabel: {
    fontSize: 22,
    fontFamily: "myfont-bold",
    textAlign: "center",
  },
  itemName: {
    fontSize: 24,
    fontFamily: "myfont-bold",
    textAlign: "center",
    textDecorationLine: "underline",
    marginVertical: 10,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    marginTop: 20,
  },
  loadingImage: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 20,
  },
  nutritionImageContainer: {
    width: "100%",
    height: 400,
    marginVertical: 20,
  },
  nutritionImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  zoomHint: {
    textAlign: "center",
    color: Colors.GRAY,
    fontFamily: "myfont",
    marginTop: 5,
  },
  recipeButton: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 20,
  },
  recipeButtonText: {
    color: Colors.WHITE,
    fontFamily: "myfont-bold",
    textAlign: "center",
    fontSize: 28,
  },
});
