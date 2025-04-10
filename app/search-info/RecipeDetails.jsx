import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Share,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { getRecipeInformation } from "../api/GetRecipe";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { auth, db } from "../../configs/FirebaseConfig";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";

const renderNutrient = (label, amount, unit, indent = false) => (
  <View key={label} style={[styles.nutrientRow, indent && styles.indent]}>
    <Text style={styles.nutrientLabel}>{label}:</Text>
    <Text style={styles.nutrientValue}>
      {amount !== undefined && amount !== null
        ? `${amount.toFixed(1)} ${unit}`
        : "N/A"}
    </Text>
  </View>
);

export default function RecipeDetails() {
  const { recipeId, recipeTitle } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const user = auth.currentUser;

  const [recipeInfo, setRecipeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: recipeTitle || "Recipe Details",
      headerTitleStyle: {
        fontFamily: "myfont-bold",
      },
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginLeft: 15 }}>
          <FontAwesome6 name="arrow-left" size={20} color={Colors.BLACK} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity onPress={handleShare} style={{ marginRight: 15 }}>
          <MaterialCommunityIcons
            name="share-variant"
            size={24}
            color={Colors.BLACK}
          />
        </TouchableOpacity>
      ),
    });

    fetchRecipeDetails();
  }, [recipeId, recipeTitle]);

  const fetchRecipeDetails = async () => {
    if (!recipeId) {
      setError("Recipe ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getRecipeInformation(recipeId);
      setRecipeInfo(response.data);
    } catch (err) {
      console.error("Error fetching recipe details:", err);
      setError("Failed to load recipe details.");
    } finally {
      setLoading(false);
    }
  };

  const saveRecipeToLog = async () => {
    if (!recipeInfo || !user?.email) return;
    setLoading(true);
    try {
      const docId = `${user.uid}-${recipeInfo.id}-${Date.now()}`;
      await setDoc(doc(db, "recipesLog", docId), {
        userEmail: user.email,
        userId: user.uid,
        recipeId: recipeInfo.id,
        title: recipeInfo.title,
        image: recipeInfo.image,
        sourceUrl: recipeInfo.sourceUrl,
        nutritionSummary: recipeInfo.nutrition?.nutrients.reduce(
          (acc, curr) => {
            acc[curr.name] = `${curr.amount.toFixed(1)} ${curr.unit}`;
            return acc;
          },
          {}
        ),
        apiResult: recipeInfo,
        createdAt: new Date(),
      });
      alert("Recipe saved to your Log!");
    } catch (error) {
      console.error("Error saving recipe log: ", error);
      alert("Failed to save recipe.");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!recipeInfo?.sourceUrl) return;
    try {
      await Share.share({
        message: `Check out this recipe: ${recipeInfo.title}\n${recipeInfo.sourceUrl}`,
        url: recipeInfo.sourceUrl,
        title: recipeInfo.title,
      });
    } catch (error) {
      console.error("Error sharing recipe:", error);
      alert("Could not share recipe.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.BLACK} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!recipeInfo) {
    return (
      <View style={styles.centerContainer}>
        <Text>No recipe data found.</Text>
      </View>
    );
  }

  const nutrients = recipeInfo.nutrition?.nutrients || [];
  const calories = nutrients.find((n) => n.name === "Calories");
  const protein = nutrients.find((n) => n.name === "Protein");
  const fat = nutrients.find((n) => n.name === "Fat");
  const carbs = nutrients.find((n) => n.name === "Carbohydrates");
  const sugar = nutrients.find((n) => n.name === "Sugar");
  const fiber = nutrients.find((n) => n.name === "Fiber");
  const sodium = nutrients.find((n) => n.name === "Sodium");
  const cholesterol = nutrients.find((n) => n.name === "Cholesterol");

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {recipeInfo.image && (
        <Image source={{ uri: recipeInfo.image }} style={styles.recipeImage} />
      )}

      <Text style={styles.title}>{recipeInfo.title}</Text>

      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={saveRecipeToLog}>
          <MaterialCommunityIcons
            name="plus-box-outline"
            size={20}
            color={Colors.WHITE}
          />
          <Text style={styles.actionButtonText}> Log Recipe</Text>
        </TouchableOpacity>
        {recipeInfo.sourceUrl && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => Linking.openURL(recipeInfo.sourceUrl)}>
            <MaterialCommunityIcons
              name="link-variant"
              size={20}
              color={Colors.WHITE}
            />
            <Text style={styles.actionButtonText}> View Source</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Summary Section */}
      {recipeInfo.summary && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            {recipeInfo.summary.replace(/<[^>]*>?/gm, "")}
          </Text>
        </View>
      )}

      {/* Ingredients Section */}
      {recipeInfo.extendedIngredients?.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipeInfo.extendedIngredients.map((ing, index) => (
            <Text key={index} style={styles.ingredientText}>
              • {ing.original}
            </Text>
          ))}
        </View>
      )}

      {/* Nutrition Section */}
      {nutrients.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
          {renderNutrient("Calories", calories?.amount, calories?.unit)}
          {renderNutrient("Protein", protein?.amount, protein?.unit)}
          {renderNutrient("Fat", fat?.amount, fat?.unit)}
          {renderNutrient("Carbohydrates", carbs?.amount, carbs?.unit)}
          {renderNutrient("Sugar", sugar?.amount, sugar?.unit, true)}
          {renderNutrient("Fiber", fiber?.amount, fiber?.unit, true)}
          {renderNutrient("Sodium", sodium?.amount, sodium?.unit)}
          {renderNutrient(
            "Cholesterol",
            cholesterol?.amount,
            cholesterol?.unit
          )}
          {/* Add more nutrients if needed */}
        </View>
      )}

      {/* Instructions Section */}
      {recipeInfo.analyzedInstructions?.[0]?.steps.length > 0 && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipeInfo.analyzedInstructions[0].steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <Text style={styles.stepNumber}>{step.number}.</Text>
              <Text style={styles.stepText}>{step.step}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Add Spoonacular attribution if required by terms */}
      <Text style={styles.attributionText}>
        Recipe data powered by Spoonacular. Source:{" "}
        {recipeInfo.sourceName || "Unknown"}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  recipeImage: {
    width: "100%",
    height: 250,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: "myfont-bold",
    marginBottom: 15,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.BLACK,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: Colors.WHITE,
    fontFamily: "myfont-bold",
    fontSize: 14,
    marginLeft: 5,
  },
  sectionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: Colors.LIGHT_GRAY_BACKGROUND, // Use a light background for sections
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "myfont-bold",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
    paddingBottom: 5,
  },
  summaryText: {
    fontSize: 15,
    fontFamily: "myfont",
    lineHeight: 22,
  },
  ingredientText: {
    fontSize: 15,
    fontFamily: "myfont",
    marginBottom: 5,
    lineHeight: 20,
  },
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  indent: {
    marginLeft: 20,
  },
  nutrientLabel: {
    fontFamily: "myfont",
    fontSize: 15,
  },
  nutrientValue: {
    fontFamily: "myfont-medium",
    fontSize: 15,
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
  },
  stepNumber: {
    fontFamily: "myfont-bold",
    fontSize: 15,
    marginRight: 8,
    minWidth: 20, // Ensure alignment
  },
  stepText: {
    fontFamily: "myfont",
    fontSize: 15,
    flex: 1,
    lineHeight: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontFamily: "myfont",
  },
  attributionText: {
    fontSize: 12,
    color: Colors.GRAY,
    textAlign: "center",
    marginTop: 15,
    fontFamily: "myfont",
  },
});
