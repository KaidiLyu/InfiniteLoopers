import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
} from "react";
import { Alert } from "react-native";
import { auth, db } from "../../configs/FirebaseConfig"; // Adjust path if needed
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

// Helper: Format Date String
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Create Context
const DailyTrackerContext = createContext();

// Create Provider Component
export const DailyTrackerProvider = ({ children }) => {
  const user = auth.currentUser; // Get user once

  // --- State Managed by Context ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [trackedItems, setTrackedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [calorieGoal, setCalorieGoal] = useState(2000); // Default Target
  const [goalChecked, setGoalChecked] = useState(false); // Goal checking status

  // --- Memoized Derived Values ---
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0); // Normalize to start of day
    return d;
  }, []);

  const thirtyDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    date.setHours(0, 0, 0, 0); // Normalize
    return date;
  }, []);

  const currentDateString = useMemo(
    () => formatDateString(currentDate),
    [currentDate]
  );

  // --- Data Fetching and Management ---

  // Load Calorie Goal
  const loadCalorieGoal = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const goalDocRef = doc(db, "userCalorieGoals", user.uid);
      const goalSnapshot = await getDoc(goalDocRef);
      if (goalSnapshot.exists()) {
        setCalorieGoal(goalSnapshot.data().calorieGoal || 2000);
      } else {
        setCalorieGoal(2000); // Reset to default if not found
      }
    } catch (err) {
      console.error("Error loading calorie goal:", err);
      setError("Could not load calorie goal.");
    }
  }, [user]);

  // Fetch Tracked Items listener based on currentDate
  useEffect(() => {
    if (!user?.uid) {
      setTrackedItems([]);
      setLoading(false);
      setError("User not logged in.");
      return;
    }

    setLoading(true);
    setError(null);
    setGoalChecked(false); // Reset goal check when date changes

    // Ensure goal is loaded for the current user as well
    loadCalorieGoal();

    const q = query(
      collection(db, "dailyTracker"),
      where("userId", "==", user.uid),
      where("date", "==", currentDateString),
      orderBy("addedAt", "desc") // Keep initial sort
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTrackedItems(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore Listener Error:", err);
        setError("Error fetching tracker data: " + err.message);
        setLoading(false);
      }
    );

    // Cleanup listener on component unmount or dependency change
    return () => unsubscribe();
  }, [user, currentDateString, loadCalorieGoal]); // Rerun when user or date changes

  // Check Calorie Goal achievement
  const checkCalorieGoal = useCallback(async (calculatedTotalCalories) => {
    // Pass totalCalories to avoid stale state issues
    if (!user?.uid || goalChecked || trackedItems.length === 0 || calorieGoal <= 0) return;

    const isGoalMet = calculatedTotalCalories <= calorieGoal;

    try {
      const goalMetQuery = query(
        collection(db, "goalsMet"),
        where("userId", "==", user.uid),
        where("date", "==", currentDateString)
      );
      const goalMetSnapshot = await getDocs(goalMetQuery);

      const allGoalsMetQuery = query(
        collection(db, "goalsMet"),
        where("userId", "==", user.uid)
      );
      const allGoalsMetSnapshot = await getDocs(allGoalsMetQuery);
      const currentMetCount = allGoalsMetSnapshot.size;

      if (isGoalMet) {
        if (goalMetSnapshot.empty) {
          await addDoc(collection(db, "goalsMet"), {
            userId: user.uid,
            userEmail: user.email,
            date: currentDateString,
            goalCalories: calorieGoal,
            actualCalories: calculatedTotalCalories,
            createdAt: Timestamp.now(),
          });
          console.log(`Goal met for ${currentDateString}`);
        }
      } else { // Exceeded goal
        if (!goalMetSnapshot.empty) {
          const batch = writeBatch(db);
          goalMetSnapshot.forEach((doc) => batch.delete(doc.ref));
          await batch.commit();
          console.log(`Removed goal met record for ${currentDateString}`);
        }
        if (goalMetSnapshot.empty && currentMetCount > 0) {
          const oldestGoalMetQuery = query(
            collection(db, "goalsMet"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "asc"),
            limit(1)
          );
          const oldestGoalMetSnapshot = await getDocs(oldestGoalMetQuery);
          if (!oldestGoalMetSnapshot.empty) {
            await deleteDoc(oldestGoalMetSnapshot.docs[0].ref);
            console.log("Reduced goal met count by 1");
          }
        }
      }
      setGoalChecked(true); // Mark as checked for this data load
    } catch (err) {
      console.error("Error checking calorie goal:", err);
    }
    // Dependencies include internal state and calculated values
  }, [user, calorieGoal, currentDateString, goalChecked, trackedItems.length]); // Depend on trackedItems.length to re-trigger when items appear/disappear

  // Calculate Total Calories
  const totalCalories = useMemo(() => {
    return trackedItems.reduce((sum, item) => {
      const itemCalories = item.calories || 0;
      const servingQty = item.servingQty || 0;
      return sum + itemCalories * servingQty;
    }, 0);
  }, [trackedItems]);

  // Effect to run goal check when totalCalories changes
  useEffect(() => {
    if (trackedItems.length > 0 && !goalChecked && calorieGoal > 0) {
      checkCalorieGoal(totalCalories); // Pass current totalCalories
    }
  }, [totalCalories, trackedItems.length, goalChecked, calorieGoal, checkCalorieGoal]);


  // Calculate Nutrition Facts
  const nutritionFacts = useMemo(() => {
    const totals = {
      calories: 0, total_fat: 0, saturated_fat: 0, trans_fat: 0,
      polyunsaturated_fat: 0, monounsaturated_fat: 0, cholesterol: 0,
      sodium: 0, total_carbs: 0, dietary_fiber: 0, sugars: 0,
      protein: 0, vitamin_d: 0, calcium: 0, iron: 0, potassium: 0,
    };
    trackedItems.forEach((item) => {
      const qty = item.servingQty || 0;
      totals.calories += (item.calories || 0) * qty;
      totals.total_fat += (item.nf_total_fat || 0) * qty;
      totals.saturated_fat += (item.nf_saturated_fat || 0) * qty;
      totals.cholesterol += (item.nf_cholesterol || 0) * qty;
      totals.sodium += (item.nf_sodium || 0) * qty;
      totals.total_carbs += (item.nf_total_carbohydrate || 0) * qty;
      totals.dietary_fiber += (item.nf_dietary_fiber || 0) * qty;
      totals.sugars += (item.nf_sugars || 0) * qty;
      totals.protein += (item.nf_protein || 0) * qty;

      // Handle full_nutrients array if present
      if (item.full_nutrients && Array.isArray(item.full_nutrients)) {
        const findNutrientValue = (id) => item.full_nutrients.find(n => n.attr_id === id)?.value || 0;
        totals.trans_fat += findNutrientValue(605) * qty;
        totals.polyunsaturated_fat += findNutrientValue(646) * qty;
        totals.monounsaturated_fat += findNutrientValue(645) * qty;
        totals.vitamin_d += findNutrientValue(324) * qty; // Often in mcg
        totals.calcium += findNutrientValue(301) * qty; // Often in mg
        totals.iron += findNutrientValue(303) * qty; // Often in mg
        totals.potassium += findNutrientValue(306) * qty; // Often in mg
      } else {
        // Fallback or default handling if full_nutrients is missing/not an array
        totals.potassium += (item.nf_potassium || 0) * qty; // Example using direct field if available
      }
    });
    return totals;
  }, [trackedItems]);

  // --- Functions to Modify State ---

  // Change Date
  const changeDate = useCallback((days) => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + days);
      newDate.setHours(0, 0, 0, 0); // Normalize

      // Check bounds
      if (newDate < thirtyDaysAgo) {
        Alert.alert("Limit Reached", "You can only view the last 30 days.");
        return prevDate; // Return previous state if out of bounds
      }
      if (newDate > today) {
        // If trying to go past today, set to today if not already today
        return prevDate.toDateString() === today.toDateString() ? prevDate : today;
      }
      return newDate; // Return new date if within bounds
    });
  }, [today, thirtyDaysAgo]); // Dependencies are stable


  // Delete Single Item
  const deleteItem = useCallback(async (itemId, itemName) => {
    if (!user?.uid) return;
    // Find item details *before* showing alert, as state might update
    const itemToDelete = trackedItems.find(item => item.id === itemId);

    Alert.alert("Delete Item", `Remove ${itemName || 'this item'} from log?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // Delete from dailyTracker
            await deleteDoc(doc(db, "dailyTracker", itemId));
            console.log("Deleted item from dailyTracker:", itemId);

            // Attempt to delete from mealsSaved if details found
            if (itemToDelete) {
              const mealsSavedQuery = query(
                collection(db, "mealsSaved"),
                where("userId", "==", user.uid),
                where("foodName", "==", itemToDelete.foodName),
                where("date", "==", itemToDelete.date) // Use date from the item
              );
              const mealsSavedSnapshot = await getDocs(mealsSavedQuery);
              if (!mealsSavedSnapshot.empty) {
                const batch = writeBatch(db);
                mealsSavedSnapshot.forEach((doc) => batch.delete(doc.ref));
                await batch.commit();
                console.log("Deleted corresponding items from mealsSaved");
              }
            }
            // No need to manually update state, listener will handle it
          } catch (err) {
            console.error("Error deleting tracker item:", err);
            Alert.alert("Error", "Could not remove item.");
          }
        },
      },
    ]);
  }, [user, trackedItems] // Depend on user and trackedItems to find the item
  );

  // Delete All Items for Current Date
  const deleteAllItems = useCallback(async () => {
    if (!user?.uid || trackedItems.length === 0) return; // Prevent deletion if no items

    Alert.alert(
      "Delete All Items",
      `Are you sure you want to delete all ${trackedItems.length} items for ${formatDateString(currentDate)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            // Optional: Show visual loading state if needed, though listener should be fast
            // setLoading(true);
            try {
              const batch = writeBatch(db);
              const q = query(
                collection(db, "dailyTracker"),
                where("userId", "==", user.uid),
                where("date", "==", currentDateString)
              );
              const querySnapshot = await getDocs(q);
              querySnapshot.forEach((doc) => batch.delete(doc.ref));
              await batch.commit();
              // Don't manually setTrackedItems([]), let listener handle it
              Alert.alert("Success", "All items deleted.");
            } catch (err) {
              console.error("Error deleting all items:", err);
              Alert.alert("Error", "Could not delete all items.");
            } finally {
              // setLoading(false);
            }
          },
        },
      ]
    );
  }, [user, currentDateString, trackedItems, currentDate]); // Depend on these


  // Update Item Quantity (can be added here if needed)
  const updateItemQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 0) return; // Prevent negative quantities
    try {
      await setDoc(doc(db, "dailyTracker", itemId), {
        servingQty: newQuantity
      }, { merge: true });
    } catch (err) {
      console.error("Error updating quantity", err);
      Alert.alert("Error", "Could not update quantity");
    }
  }, []); // No external dependencies needed for the operation itself


  // --- Context Value ---
  const value = useMemo(() => ({
    currentDate,
    currentDateString,
    trackedItems,
    loading,
    error,
    calorieGoal,
    totalCalories,
    nutritionFacts,
    changeDate,
    deleteItem,
    deleteAllItems,
    updateItemQuantity, // Add this function to context value
    today, // Pass today date for disabling button
    thirtyDaysAgo, // Pass limit date for disabling button
  }), [
    currentDate,
    currentDateString,
    trackedItems,
    loading,
    error,
    calorieGoal,
    totalCalories,
    nutritionFacts,
    changeDate,
    deleteItem,
    deleteAllItems,
    updateItemQuantity,
    today,
    thirtyDaysAgo
  ]);

  return (
    <DailyTrackerContext.Provider value={value}>
      {children}
    </DailyTrackerContext.Provider>
  );
};

// --- Custom Hook to use the Context ---
export const useDailyTracker = () => {
  const context = useContext(DailyTrackerContext);
  if (context === undefined) {
    throw new Error("useDailyTracker must be used within a DailyTrackerProvider");
  }
  return context;
}; 