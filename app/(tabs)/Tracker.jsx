import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
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
  deleteDoc,
  doc,
  setDoc,
  getDocs,
  getDoc,
  writeBatch,
  addDoc,
  Timestamp,
  limit,
} from "firebase/firestore";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { Picker } from "@react-native-picker/picker";
const user = auth.currentUser;

const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

const formatTime = (timestamp) => {
  if (!timestamp?.toDate) return "N/A";
  const options = { hour: "numeric", minute: "2-digit", hour12: true };
  return timestamp.toDate().toLocaleTimeString(undefined, options);
};

export default function Tracker() {
  const user = auth.currentUser;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trackedItems, setTrackedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("addedAt_desc");
  const [calorieGoal, setCalorieGoal] = useState(2000); // Default Target
  const [goalChecked, setGoalChecked] = useState(false);

  const today = useMemo(() => new Date(), []);
  const thirtyDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  }, []);

  const currentDateString = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, [currentDate]);

  // Calculate total cash
  const totalCalories = useMemo(() => {
    return trackedItems.reduce((sum, item) => {
      const servingQty = item.servingQty || 0;
      return sum + ((item.calories || 0) * servingQty);
    }, 0);
  }, [trackedItems]);

  // Loading the user's calorie goal
  const loadCalorieGoal = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const goalDocRef = doc(db, "userCalorieGoals", user.uid);
      const goalSnapshot = await getDoc(goalDocRef);
      
      if (goalSnapshot.exists()) {
        const goalData = goalSnapshot.data();
        setCalorieGoal(goalData.calorieGoal || 2000);
        console.log("Loaded calorie goal:", goalData.calorieGoal);
      }
    } catch (error) {
      console.error("Error loading calorie goal:", error);
    }
  }, [user]);

  // Check if the user has reached their calorie goal
  const checkCalorieGoal = useCallback(async () => {
    if (!user?.uid || goalChecked || trackedItems.length === 0) return;
    
    const isGoalMet = totalCalories <= calorieGoal;
    
    try {
      // Check if goal achievement has been recorded today
      const goalMetQuery = query(
        collection(db, "goalsMet"),
        where("userId", "==", user.uid),
        where("date", "==", currentDateString)
      );
      
      const goalMetSnapshot = await getDocs(goalMetQuery);
      
      // Get the total number of goalsMet documents for a user
      const allGoalsMetQuery = query(
        collection(db, "goalsMet"),
        where("userId", "==", user.uid)
      );
      
      const allGoalsMetSnapshot = await getDocs(allGoalsMetQuery);
      const currentMetCount = allGoalsMetSnapshot.size;
      
      if (isGoalMet) {
        // Achievement of goals
        if (goalMetSnapshot.empty) {
          // If there is no record today, add a record
          await addDoc(collection(db, "goalsMet"), {
            userId: user.uid,
            userEmail: user.email,
            date: currentDateString,
            goalCalories: calorieGoal,
            actualCalories: totalCalories,
            createdAt: Timestamp.now()
          });
          
          console.log("Calorie goal met for today!");
        }
      } else {
        // Exceeding the target
        // If there is already a record today, delete it
        if (!goalMetSnapshot.empty) {
          const batch = writeBatch(db);
          goalMetSnapshot.forEach((doc) => {
            batch.delete(doc.ref);
          });
          await batch.commit();
          console.log("Removed today's goal met record due to exceeding calorie limit");
        }
        
        // If there is no record currently, you need to reduce a history record
        if (goalMetSnapshot.empty && currentMetCount > 0) {
          // Delete the earliest record
          const oldestGoalMetQuery = query(
            collection(db, "goalsMet"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "asc"),
            limit(1)
          );
          
          const oldestGoalMetSnapshot = await getDocs(oldestGoalMetQuery);
          
          if (!oldestGoalMetSnapshot.empty) {
            await deleteDoc(oldestGoalMetSnapshot.docs[0].ref);
            console.log("Reduced goal met count by 1 due to exceeding calorie limit");
          }
        }
      }
      
      setGoalChecked(true);
    } catch (error) {
      console.error("Error checking calorie goal:", error);
    }
  }, [user, totalCalories, calorieGoal, currentDateString, goalChecked, trackedItems]);

  // Listen for changes in the tracked items
  useFocusEffect(
    useCallback(() => {
      if (!user?.uid) return;
      
      setLoading(true);
      setError(null);
      
      // Load the user's calorie goal
      loadCalorieGoal();
      
      // Real-time monitoring of the current date's tracked items
      const q = query(
        collection(db, "dailyTracker"),
        where("userId", "==", user.uid),
        where("date", "==", currentDateString),
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
          setError("Error fetching tracker data: " + err.message);
          setLoading(false);
        }
      );
      
      // Reset the goal check flag when the component gains focus
      setGoalChecked(false);
      
      return () => unsubscribe();
    }, [user, currentDateString])
  );

  // When the tracked items or calorie goal changes, check if the goal has been reached
  useEffect(() => {
    if (trackedItems.length > 0 && !goalChecked) {
      checkCalorieGoal();
    }
  }, [trackedItems, checkCalorieGoal, goalChecked]);

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
        (item.full_nutrients?.find((n) => n.attr_id === 605)?.value || 0) * servingQty;
      totalNutrition.polyunsaturated_fat +=
        (item.full_nutrients?.find((n) => n.attr_id === 646)?.value || 0) * servingQty;
      totalNutrition.monounsaturated_fat +=
        (item.full_nutrients?.find((n) => n.attr_id === 645)?.value || 0) * servingQty;
      totalNutrition.cholesterol += (item.nf_cholesterol || 0) * servingQty;
      totalNutrition.sodium += (item.nf_sodium || 0) * servingQty;
      totalNutrition.total_carbs += (item.nf_total_carbohydrate || 0) * servingQty;
      totalNutrition.dietary_fiber += (item.nf_dietary_fiber || 0) * servingQty;
      totalNutrition.sugars += (item.nf_sugars || 0) * servingQty;
      totalNutrition.protein += (item.nf_protein || 0) * servingQty;
      totalNutrition.vitamin_d +=
        (item.full_nutrients?.find((n) => n.attr_id === 324)?.value || 0) * servingQty;
      totalNutrition.calcium +=
        (item.full_nutrients?.find((n) => n.attr_id === 301)?.value || 0) * servingQty;
      totalNutrition.iron +=
        (item.full_nutrients?.find((n) => n.attr_id === 303)?.value || 0) * servingQty;
      totalNutrition.potassium +=
        (item.full_nutrients?.find((n) => n.attr_id === 306)?.value || 0) * servingQty;
    });

    return totalNutrition;
  };

  const nutritionFacts = useMemo(
    () => calculateTotalNutrition(),
    [trackedItems]
  );

  const renderNutritionLabel = () => {
    if (!nutritionFacts) return null;

    const dailyValue = {
      total_fat: 78, // g
      saturated_fat: 20, // g
      trans_fat: 0, // g
      cholesterol: 300, // mg
      sodium: 2300, // mg
      total_carbs: 275, // g
      dietary_fiber: 28, // g
      sugars: 50, // g
      protein: 50, // g
      vitamin_d: 20, // mcg
      calcium: 1300, // mg
      iron: 18, // mg
      potassium: 4700, // mg
    };

    const calculateDailyValue = (nutrient, value) => {
      if (!dailyValue[nutrient] || !value) return 0;
      return Math.round((value / dailyValue[nutrient]) * 100);
    };

    return (
      <View style={styles.nutritionContainer}>
        <Text style={styles.nutritionTitle}>
          {user.displayName}'s Nutrition Intake
        </Text>
        <Text style={styles.servingSize}>Amount Per Serving</Text>

        {/* Calories */}
        <View style={styles.nutritionMainRow}>
          <Text style={styles.nutritionMainLabel}>Calories</Text>
          <Text style={styles.nutritionMainValue}>
            {Math.round(nutritionFacts.calories)}
          </Text>
        </View>

        <View style={styles.nutritionDivider} />
        <Text style={styles.nutritionDailyValue}>% Daily Value*</Text>

        {/* Total Fat */}
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

        {/* Saturated Fat */}
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

        {/* Trans Fat */}
        <View style={styles.nutritionIndentedRow}>
          <Text style={styles.nutritionIndentedLabel}>Trans Fat</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.trans_fat.toFixed(1)}g
            </Text>
            <Text style={styles.nutritionPercent}></Text>
          </View>
        </View>

        {/* Cholesterol */}
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

        {/* Sodium */}
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

        {/* Total Carbohydrates */}
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

        {/* Dietary Fiber */}
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

        {/* Sugars */}
        <View style={styles.nutritionIndentedRow}>
          <Text style={styles.nutritionIndentedLabel}>Sugars</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.nutritionValue}>
              {nutritionFacts.sugars.toFixed(1)}g
            </Text>
            <Text style={styles.nutritionPercent}></Text>
          </View>
        </View>

        {/* Protein */}
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

        {/* Vitamin D */}
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Vitamin D</Text>
          <Text style={styles.nutritionPercent}>
            {calculateDailyValue("vitamin_d", nutritionFacts.vitamin_d)}%
          </Text>
        </View>

        {/* Calcium */}
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Calcium</Text>
          <Text style={styles.nutritionPercent}>
            {calculateDailyValue("calcium", nutritionFacts.calcium)}%
          </Text>
        </View>

        {/* Iron */}
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Iron</Text>
          <Text style={styles.nutritionPercent}>
            {calculateDailyValue("iron", nutritionFacts.iron)}%
          </Text>
        </View>

        {/* Potassium */}
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionLabel}>Potassium</Text>
          <Text style={styles.nutritionPercent}>
            {calculateDailyValue("potassium", nutritionFacts.potassium)}%
          </Text>
        </View>

        <View style={styles.nutritionDivider} />
        <Text style={styles.nutritionFooter}>
          * The % Daily Value tells you how much a nutrient in a serving of food
          contributes to a daily diet. 2,000 calories a day is used for general
          nutrition advice.
        </Text>
      </View>
    );
  };

  const sortedTrackedItems = useMemo(() => {
    let sorted = [...trackedItems];
    switch (sortOption) {
      case "addedAt_desc":
        sorted.sort(
          (a, b) => (b.addedAt?.toDate?.() || 0) - (a.addedAt?.toDate?.() || 0)
        );
        break;
      case "addedAt_asc":
        sorted.sort(
          (a, b) => (a.addedAt?.toDate?.() || 0) - (b.addedAt?.toDate?.() || 0)
        );
        break;
      case "calories_desc":
        sorted.sort((a, b) => (b.calories || 0) - (a.calories || 0));
        break;
      case "calories_asc":
        sorted.sort((a, b) => (a.calories || 0) - (b.calories || 0));
        break;
      case "name_asc":
        sorted.sort((a, b) => a.foodName.localeCompare(b.foodName));
        break;
      case "name_desc":
        sorted.sort((a, b) => b.foodName.localeCompare(a.foodName));
        break;
      default:
        break;
    }
    return sorted;
  }, [trackedItems, sortOption]);

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);

    if (newDate < thirtyDaysAgo || newDate > today) {
      if (newDate > today) {
        if (currentDate.toDateString() !== today.toDateString())
          setCurrentDate(today);
      } else {
        Alert.alert("Limit Reached", "You can only view the last 30 days.");
      }
      return;
    }
    setCurrentDate(newDate);
  };

  const deleteItem = async (itemId, itemName) => {
    Alert.alert("Delete Item", `Remove ${itemName} from today\'s log?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Delete items from dailyTracker
            await deleteDoc(doc(db, "dailyTracker", itemId));
            console.log("Deleted item from dailyTracker:", itemId);
            
           // Find and delete the corresponding item in mealsSaved
           // Note: Here we need to find the mealsSaved item that matches the current item
           // Since there is no direct reference, we match by date and food name
            const item = trackedItems.find(item => item.id === itemId);
            if (item) {
              const mealsSavedQuery = query(
                collection(db, "mealsSaved"),
                where("userId", "==", user.uid),
                where("foodName", "==", item.foodName),
                where("date", "==", item.date)
              );
              
              const mealsSavedSnapshot = await getDocs(mealsSavedQuery);
              
              if (!mealsSavedSnapshot.empty) {
                const batch = writeBatch(db);
                mealsSavedSnapshot.forEach((doc) => {
                  batch.delete(doc.ref);
                });
                await batch.commit();
                console.log("Deleted corresponding items from mealsSaved");
              }
            }
          } catch (err) {
            console.error("Error deleting tracker item:", err);
            Alert.alert("Error", "Could not remove item.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemRow}>
      <Image
        source={
          item.photo
            ? { uri: item.photo }
            : require("../../assets/picture/food-placeholder.png")
        }
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text
          style={styles.itemFoodName}
          numberOfLines={1}
          ellipsizeMode="tail">
          {item.foodName}
        </Text>
        <View style={styles.servingContainer}>
          <TouchableOpacity 
            style={[
              styles.qtyButton,
              item.servingQty <= 0 ? styles.qtyButtonDisabled : null
            ]}
            disabled={item.servingQty <= 0}
            onPress={async () => {
              if(item.servingQty > 0) {
                try {
                  await setDoc(doc(db, "dailyTracker", item.id), {
                    ...item,
                    servingQty: item.servingQty - 1
                  }, { merge: true });
                } catch (err) {
                  console.error("Error updating quantity", err);
                  Alert.alert("Error", "Could not update quantity");
                }
              }
            }}>
            <Text style={[
              styles.qtyButtonText,
              item.servingQty <= 0 ? styles.qtyButtonTextDisabled : null
            ]}>-</Text>
          </TouchableOpacity>
          <Text style={styles.itemServing}>
            {item.servingQty || 0} {item.servingUnit}
          </Text>
          <TouchableOpacity 
            style={[styles.qtyButton, styles.qtyButtonAdd]}
            onPress={async () => {
              try {
                await setDoc(doc(db, "dailyTracker", item.id), {
                  ...item,
                  servingQty: (item.servingQty || 0) + 1
                }, { merge: true });
              } catch (err) {
                console.error("Error updating quantity", err);
                Alert.alert("Error", "Could not update quantity");
              }
            }}>
            <Text style={[styles.qtyButtonText, styles.qtyButtonTextAdd]}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTime}>Added: {formatTime(item.addedAt)}</Text>
      </View>
      <View style={styles.caloriesContainer}>
        <Text style={styles.itemCalories}>
          {(item.calories * (item.servingQty || 0))?.toFixed(0) ?? "N/A"}
        </Text>
        <Text style={styles.calUnitText}>Cal</Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteItem(item.id, item.foodName)}
        style={styles.deleteButton}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={24}
          color={Colors.RED}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => changeDate(-1)}
            style={styles.navButton}
            disabled={currentDate <= thirtyDaysAgo}>
            <Ionicons
              name="chevron-back"
              size={28}
              color={
                currentDate <= thirtyDaysAgo
                  ? Colors.LIGHT_GRAY
                  : Colors.PRIMARY
              }
            />
          </TouchableOpacity>
          <Text style={styles.headerDate}>{formatDate(currentDate)}</Text>
          <TouchableOpacity
            onPress={() => changeDate(1)}
            style={styles.navButton}
            disabled={currentDate.toDateString() === today.toDateString()}>
            <Ionicons
              name="chevron-forward"
              size={28}
              color={
                currentDate.toDateString() === today.toDateString()
                  ? Colors.LIGHT_GRAY
                  : Colors.PRIMARY
              }
            />
          </TouchableOpacity>
        </View>

        {!loading && !error && trackedItems.length > 0 && (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={sortOption}
              onValueChange={(itemValue) => setSortOption(itemValue)}
              style={styles.picker}
              dropdownIconColor={Colors.PRIMARY}>
              <Picker.Item
                label="Sort by: Added (Newest)"
                value="addedAt_desc"
              />
              <Picker.Item
                label="Sort by: Added (Oldest)"
                value="addedAt_asc"
              />
              <Picker.Item
                label="Sort by: Calories (High-Low)"
                value="calories_desc"
              />
              <Picker.Item
                label="Sort by: Calories (Low-High)"
                value="calories_asc"
              />
              <Picker.Item label="Sort by: Name (A-Z)" value="name_asc" />
              <Picker.Item label="Sort by: Name (Z-A)" value="name_desc" />
            </Picker>
          </View>
        )}

        <View style={styles.contentArea}>
          {loading && (
            <View style={styles.centerMessage}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
          )}

          {!loading && error && (
            <View style={styles.centerMessage}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && trackedItems.length === 0 && (
            <View style={styles.centerMessage}>
              <Text style={styles.emptyText}>
                No items tracked for this day.
              </Text>
            </View>
          )}

          {!loading && !error && trackedItems.length > 0 && (
            <FlatList
              data={sortedTrackedItems}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
              contentContainerStyle={{ paddingBottom: 80 }}
            />
          )}
        </View>

        {!loading && !error && trackedItems.length > 0 && (
          <View style={styles.footerContainer}>
            {renderNutritionLabel()}
            <View style={styles.calorieStats}>
              <View style={styles.calorieStat}>
                <Text style={styles.calorieStatLabel}>Total Calories:</Text>
                <Text style={styles.totalCaloriesText}>{totalCalories.toFixed(0)}</Text>
              </View>
              
              <View style={styles.calorieStat}>
                <Text style={styles.calorieStatLabel}>Target:</Text>
                <Text style={styles.goalText}>{calorieGoal.toFixed(0)}</Text>
              </View>
              
              <View style={styles.calorieStat}>
                <Text style={styles.calorieStatLabel}>state:</Text>
                <Text style={[
                  styles.statusText,
                  totalCalories <= calorieGoal ? styles.metGoal : styles.exceededGoal
                ]}>
                  {totalCalories <= calorieGoal 
                    ? "✓ Achieve your goals" 
                    : `Beyond ${(totalCalories - calorieGoal).toFixed(0)} Calories`}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_COLOR || Colors.WHITE,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.EXTRA_LIGHT_GRAY,
  },
  navButton: {
    padding: 5,
  },
  headerDate: {
    fontSize: 18,
    fontFamily: "myfont-bold",
    color: Colors.DARK_GRAY,
  },
  pickerContainer: {
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 8,
    backgroundColor: Colors.WHITE,
    height: Platform.OS === "ios" ? 150 : 50,
    justifyContent: "center",
    overflow: Platform.OS === "ios" ? "hidden" : "visible",
  },
  picker: {
    height: Platform.OS === "ios" ? 150 : 50,
    width: "100%",
    color: Colors.BLACK,
  },
  contentArea: {
    flex: 1,
  },
  centerMessage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.RED,
    textAlign: "center",
    fontFamily: "myfont-medium",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.DARK_GRAY,
    textAlign: "center",
    fontFamily: "myfont-medium",
  },
  list: {
    flex: 1,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.EXTRA_LIGHT_GRAY,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
    marginRight: 10,
  },
  itemFoodName: {
    fontSize: 16,
    fontFamily: "myfont-semibold",
    color: Colors.BLACK,
    marginBottom: 2,
  },
  itemServing: {
    fontSize: 13,
    fontFamily: "myfont-regular",
    color: Colors.DARK_GRAY,
    marginHorizontal: 8,
  },
  itemTime: {
    fontSize: 12,
    fontFamily: "myfont-regular",
    color: Colors.GRAY,
  },
  caloriesContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: 50,
    marginRight: 10,
  },
  itemCalories: {
    fontSize: 18,
    fontFamily: "myfont-bold",
    color: Colors.PRIMARY,
  },
  calUnitText: {
    fontSize: 10,
    fontFamily: "myfont-regular",
    color: Colors.DARK_GRAY,
    marginTop: -2,
  },
  deleteButton: {
    padding: 8,
  },
  footerContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.EXTRA_LIGHT_GRAY,
    alignItems: "center",
  },
  calorieStats: {
    backgroundColor: Colors.EXTRA_LIGHT_GRAY,
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
  },
  calorieStat: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  calorieStatLabel: {
    fontSize: 14,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
  },
  totalCaloriesText: {
    fontSize: 16,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
  },
  goalText: {
    fontSize: 16,
    fontFamily: "myfont-bold",
    color: Colors.PRIMARY,
  },
  statusText: {
    fontSize: 16,
    fontFamily: "myfont-bold",
    color: Colors.PRIMARY,
  },
  metGoal: {
    color: Colors.GREEN,
  },
  exceededGoal: {
    color: Colors.RED,
  },
  nutritionContainer: {
    padding: 10,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BLACK,
    borderRadius: 5,
    marginBottom: 15,
  },
  nutritionTitle: {
    fontSize: 20,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    textAlign: "center",
    marginBottom: 5,
  },
  servingSize: {
    fontSize: 14,
    fontFamily: "myfont-regular",
    color: Colors.BLACK,
    marginBottom: 5,
  },
  nutritionMainRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  nutritionMainLabel: {
    fontSize: 16,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
  },
  nutritionMainValue: {
    fontSize: 26,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
  },
  nutritionDivider: {
    height: 5,
    backgroundColor: Colors.BLACK,
    marginVertical: 5,
  },
  nutritionDailyValue: {
    fontSize: 12,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    textAlign: "right",
    marginVertical: 3,
  },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
    paddingVertical: 1,
    height: 25,
  },
  nutritionIndentedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.EXTRA_LIGHT_GRAY,
    paddingVertical: 1,
    height: 25,
  },
  nutritionLabel: {
    fontSize: 14,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    flex: 1,
  },
  nutritionIndentedLabel: {
    fontSize: 13,
    fontFamily: "myfont-regular",
    color: Colors.BLACK,
    flex: 1,
  },
  nutritionValue: {
    fontSize: 13,
    fontFamily: "myfont-regular",
    color: Colors.BLACK,
    marginRight: 5,
    textAlign: "right",
  },
  nutritionPercent: {
    fontSize: 12,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    width: 30,
    textAlign: "right",
  },
  nutritionFooter: {
    fontSize: 10,
    fontFamily: "myfont-regular",
    color: Colors.BLACK,
    marginTop: 5,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 80,
    justifyContent: "flex-end",
  },
  servingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  qtyButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  qtyButtonText: {
    fontSize: 16,
    fontFamily: "myfont-bold",
    color: Colors.PRIMARY,
  },
  qtyButtonDisabled: {
    backgroundColor: Colors.DISABLED,
  },
  qtyButtonTextDisabled: {
    color: Colors.DISABLED_TEXT,
  },
  qtyButtonAdd: {
    backgroundColor: Colors.GREEN,
    borderColor: Colors.GREEN,
  },
  qtyButtonTextAdd: {
    color: Colors.WHITE,
  },
});
