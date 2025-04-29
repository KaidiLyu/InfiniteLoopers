import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { auth, db } from "../../configs/FirebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useFocusEffect } from "expo-router";

// Helper function to get today's date string
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function NutritionTotals() {
  const user = auth.currentUser;
  const [trackedItems, setTrackedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const todayDateString = useMemo(() => getTodayDateString(), []);

  // Fetch tracked items for TODAY when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const q = query(
        collection(db, "dailyTracker"),
        where("userId", "==", user.uid),
        where("date", "==", todayDateString), // Always fetch for today
        orderBy("addedAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            items.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setTrackedItems(items);
          setLoading(false);
        },
        (err) => {
          setError("Error fetching nutrition data: " + err.message);
          console.error("Firestore Error:", err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    }, [user, todayDateString]) // Dependency on user and today's date string
  );

  // --- Nutrition Calculation Logic (copied from Tracker.jsx) ---
  const calculateTotalNutrition = () => {
    const totalNutrition = {
      calories: 0,
      total_fat: 0,
      saturated_fat: 0,
      trans_fat: 0,
      polyunsaturated_fat: 0,
      monounsaturated_fat: 0,
      cholesterol: 0,
      sodium: 0,
      total_carbs: 0,
      dietary_fiber: 0,
      sugars: 0,
      protein: 0,
      vitamin_d: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
    };

    trackedItems.forEach((item) => {
      const servingQty = item.servingQty || 0;

      totalNutrition.calories += (item.calories || 0) * servingQty;
      totalNutrition.total_fat += (item.nf_total_fat || 0) * servingQty;
      totalNutrition.saturated_fat += (item.nf_saturated_fat || 0) * servingQty;
      totalNutrition.trans_fat +=
        (item.full_nutrients?.find((n) => n.attr_id === 605)?.value || 0) *
        servingQty;
      totalNutrition.polyunsaturated_fat +=
        (item.full_nutrients?.find((n) => n.attr_id === 646)?.value || 0) *
        servingQty;
      totalNutrition.monounsaturated_fat +=
        (item.full_nutrients?.find((n) => n.attr_id === 645)?.value || 0) *
        servingQty;
      totalNutrition.cholesterol += (item.nf_cholesterol || 0) * servingQty;
      totalNutrition.sodium += (item.nf_sodium || 0) * servingQty;
      totalNutrition.total_carbs +=
        (item.nf_total_carbohydrate || 0) * servingQty;
      totalNutrition.dietary_fiber += (item.nf_dietary_fiber || 0) * servingQty;
      totalNutrition.sugars += (item.nf_sugars || 0) * servingQty;
      totalNutrition.protein += (item.nf_protein || 0) * servingQty;
      totalNutrition.vitamin_d +=
        (item.full_nutrients?.find((n) => n.attr_id === 324)?.value || 0) *
        servingQty;
      totalNutrition.calcium +=
        (item.full_nutrients?.find((n) => n.attr_id === 301)?.value || 0) *
        servingQty;
      totalNutrition.iron +=
        (item.full_nutrients?.find((n) => n.attr_id === 303)?.value || 0) *
        servingQty;
      totalNutrition.potassium +=
        (item.full_nutrients?.find((n) => n.attr_id === 306)?.value || 0) *
        servingQty;
    });

    return totalNutrition;
  };

  const nutritionFacts = useMemo(
    () => calculateTotalNutrition(),
    [trackedItems]
  );

  // --- Nutrition Label Rendering Logic (copied from Tracker.jsx) ---
  const renderNutritionLabel = () => {
    if (!nutritionFacts) return null;
    if (trackedItems.length === 0 && !loading) {
      return (
        <Text style={styles.emptyText}>
          No items tracked today to calculate totals.
        </Text>
      );
    }

    const dailyValue = {
      total_fat: 78,
      saturated_fat: 20,
      trans_fat: 0,
      cholesterol: 300,
      sodium: 2300,
      total_carbs: 275,
      dietary_fiber: 28,
      sugars: 50,
      protein: 50,
      vitamin_d: 20,
      calcium: 1300,
      iron: 18,
      potassium: 4700,
    };

    const calculateDailyValue = (nutrient, value) => {
      if (!dailyValue[nutrient] || !value) return 0;
      return Math.round((value / dailyValue[nutrient]) * 100);
    };

    return (
      <View style={styles.nutritionContainer}>
        <Text style={styles.nutritionTitle}>Today's Nutrition Intake</Text>
        <Text style={styles.servingSize}>Total Amount</Text>

        {/* Calories */}
        <View style={styles.nutritionMainRow}>
          <Text style={styles.nutritionMainLabel}>Calories</Text>
          <Text style={styles.nutritionMainValue}>
            {Math.round(nutritionFacts.calories)}
          </Text>
        </View>

        <View style={styles.nutritionDivider} />
        <Text style={styles.nutritionDailyValue}>% Daily Value*</Text>

        {/* Nutrients Loop (Simplified for brevity, copy full rows from original if needed) */}
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Total Fat</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.total_fat.toFixed(1)}g
            </Text>
            <Text style={styles.nutritionPercent}>
              {calculateDailyValue("total_fat", nutritionFacts.total_fat)}%
            </Text>
          </View>
        </View>
        <View style={styles.nutritionIndentedRow}>
          <Text style={styles.nutritionIndentedLabel}>Saturated Fat</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.saturated_fat.toFixed(1)}g
            </Text>
            <Text style={styles.nutritionPercent}>
              {calculateDailyValue(
                "saturated_fat",
                nutritionFacts.saturated_fat
              )}
              %
            </Text>
          </View>
        </View>
        <View style={styles.nutritionIndentedRow}>
          <Text style={styles.nutritionIndentedLabel}>Trans Fat</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.trans_fat.toFixed(1)}g
            </Text>
          </View>
        </View>
        {/* ... (Add rows for Cholesterol, Sodium, Carbs, Fiber, Sugars, Protein) ... */}
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Cholesterol</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.cholesterol.toFixed(1)}mg
            </Text>
            <Text style={styles.nutritionPercent}>
              {calculateDailyValue("cholesterol", nutritionFacts.cholesterol)}%
            </Text>
          </View>
        </View>
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Sodium</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.sodium.toFixed(1)}mg
            </Text>
            <Text style={styles.nutritionPercent}>
              {calculateDailyValue("sodium", nutritionFacts.sodium)}%
            </Text>
          </View>
        </View>
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Total Carbohydrates</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.total_carbs.toFixed(1)}g
            </Text>
            <Text style={styles.nutritionPercent}>
              {calculateDailyValue("total_carbs", nutritionFacts.total_carbs)}%
            </Text>
          </View>
        </View>
        <View style={styles.nutritionIndentedRow}>
          <Text style={styles.nutritionIndentedLabel}>Dietary Fiber</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.dietary_fiber.toFixed(1)}g
            </Text>
            <Text style={styles.nutritionPercent}>
              {calculateDailyValue(
                "dietary_fiber",
                nutritionFacts.dietary_fiber
              )}
              %
            </Text>
          </View>
        </View>
        <View style={styles.nutritionIndentedRow}>
          <Text style={styles.nutritionIndentedLabel}>Sugars</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.sugars.toFixed(1)}g
            </Text>
          </View>
        </View>
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Protein</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.protein.toFixed(1)}g
            </Text>
            <Text style={styles.nutritionPercent}>
              {calculateDailyValue("protein", nutritionFacts.protein)}%
            </Text>
          </View>
        </View>

        <View style={styles.nutritionDivider} />

        {/* Vitamins/Minerals */}
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Vitamin D</Text>
          <Text style={styles.nutritionPercent}>
            {calculateDailyValue("vitamin_d", nutritionFacts.vitamin_d)}%
          </Text>
        </View>
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Calcium</Text>
          <Text style={styles.nutritionPercent}>
            {calculateDailyValue("calcium", nutritionFacts.calcium)}%
          </Text>
        </View>
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Iron</Text>
          <Text style={styles.nutritionPercent}>
            {calculateDailyValue("iron", nutritionFacts.iron)}%
          </Text>
        </View>
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Potassium</Text>
          <Text style={styles.nutritionPercent}>
            {calculateDailyValue("potassium", nutritionFacts.potassium)}%
          </Text>
        </View>

        <View style={styles.nutritionDivider} />
        <Text style={styles.nutritionFooter}>
          * The % Daily Value tells you how much a nutrient in the total food
          intake contributes to a daily diet. 2,000 calories a day is used for
          general nutrition advice.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={Colors.PRIMARY}
            style={styles.loader}
          />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          renderNutritionLabel()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles (Copied relevant styles from Tracker.jsx) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_COLOR || Colors.WHITE,
  },
  container: {
    flex: 1,
    padding: 10,
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: Colors.RED,
    textAlign: "center",
    fontFamily: "myfont-medium",
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.DARK_GRAY,
    textAlign: "center",
    marginTop: 50,
    fontFamily: "myfont-medium",
  },
  nutritionContainer: {
    marginVertical: 10, // Adjusted margin
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderWidth: 2, // Thicker border for label
    borderColor: Colors.BLACK,
    borderRadius: 8, // Optional rounding
    marginTop: "20%",
  },
  nutritionTitle: {
    fontSize: 22, // Larger title
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    textAlign: "center",
    marginBottom: 5,
    borderBottomWidth: 10, // Thick line under title
    borderBottomColor: Colors.BLACK,
    paddingBottom: 5,
  },
  servingSize: {
    fontSize: 14,
    fontFamily: "myfont-regular",
    color: Colors.BLACK,
    marginVertical: 5, // Adjusted spacing
  },
  nutritionMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline", // Align text baseline
    marginVertical: 3,
  },
  nutritionMainLabel: {
    fontSize: 16,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
  },
  nutritionMainValue: {
    fontSize: 28, // Larger calorie value
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
  },
  nutritionDivider: {
    height: 5,
    backgroundColor: Colors.BLACK,
    marginVertical: 5,
  },
  nutritionThinDivider: {
    // Thinner divider below calories
    height: 1,
    backgroundColor: Colors.BLACK,
    marginVertical: 5,
  },
  nutritionDailyValue: {
    fontSize: 13, // Slightly larger
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    textAlign: "right",
    marginVertical: 4,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Align items vertically
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY, // Lighter divider
    paddingVertical: 2, // Adjust padding
    minHeight: 28, // Ensure consistent row height
  },
  nutritionIndentedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 15, // Indentation
    borderBottomWidth: 1,
    borderBottomColor: Colors.EXTRA_LIGHT_GRAY, // Even lighter divider
    paddingVertical: 2,
    minHeight: 28,
  },
  nutritionLabel: {
    fontSize: 14,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    flexShrink: 1, // Allow text to shrink if needed
  },
  nutritionIndentedLabel: {
    fontSize: 13,
    fontFamily: "myfont-regular", // Regular font for sub-nutrients
    color: Colors.BLACK,
    flexShrink: 1,
  },
  nutritionValue: {
    fontSize: 13,
    fontFamily: "myfont-regular",
    color: Colors.BLACK,
    marginRight: 5, // Space between value and unit/percent
    textAlign: "right",
  },
  nutritionPercent: {
    fontSize: 13, // Match value size
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    width: 40, // Allocate fixed width for alignment
    textAlign: "right",
  },
  valueContainer: {
    // Container for value + %DV
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 90, // Ensure enough space for value + %DV
  },
  nutritionFooter: {
    fontSize: 11, // Slightly larger footer
    fontFamily: "myfont-regular",
    color: Colors.BLACK,
    marginTop: 8,
  },
});
