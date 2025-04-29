import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  Modal,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { identifyFoodImage } from "../api/Vision";
import { autoCompleteIngredients } from "../api/SearchIngredients";
import { autoCompleteProducts } from "../api/SearchProducts";
import { autoCompleteRecipes } from "../api/SearchRecipes";
import { getNaturalLanguageNutrition } from "../api/NutritionixNatural";
import { getProductByUPC } from "../api/NutritionixUPC";
import { getProductByUPCFromEandata } from "../api/EAN";
import { auth, db } from "../../configs/FirebaseConfig";
import * as ImagePicker from "expo-image-picker";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  writeBatch,
} from "firebase/firestore";

/**
 * SearchFood Component
 *
 * Main component for the food search functionality.
 * Provides multiple methods to search for food:
 * - Text-based search for ingredients/products
 * - Natural language search
 * - Barcode scanning
 * - Image-based food identification
 */
export default function SearchFood() {
  // Get current user information and navigation tools
  const user = auth.currentUser;
  const navigation = useNavigation();
  const router = useRouter();

  // State for controlling search mode and UI status
  const [searchMode, setSearchMode] = useState("Item"); // Controls which search method is active
  const [loading, setLoading] = useState(false); // Tracks loading state for API calls
  const [error, setError] = useState(null); // Stores error messages

  // State for item search functionality
  const [itemType, setItemType] = useState(""); // "Ingredients" or "Products"
  const [itemQuery, setItemQuery] = useState(""); // Search text
  const [itemSuggestions, setItemSuggestions] = useState([]); // Autocomplete results
  const [selectedItem, setSelectedItem] = useState(null); // Currently selected item
  const textInputRef = useRef(); // Reference to search input field

  // State for natural language search functionality
  const [naturalQuery, setNaturalQuery] = useState(""); // Natural language query text
  const [naturalFoodItems, setNaturalFoodItems] = useState([]); // Results from natural language search

  // State for barcode scanner functionality
  const [permission, requestPermission] = useCameraPermissions(); // Camera permissions
  const [isScannerVisible, setIsScannerVisible] = useState(false); // Controls scanner visibility
  const [scannedData, setScannedData] = useState(null); // Stores scanned barcode data
  const [productName, setProductName] = useState(""); // Name from EANdata/other source
  const [productImage, setProductImage] = useState(""); // Image from EANdata/other source
  const [scannedFoodItem, setScannedFoodItem] = useState(null); // Nutritionix data for scanned item

  // State for camera-based food identification
  const [cameraLabel, setCameraLabel] = useState(""); // Stores identified food label

  // Hide header on component mount
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  /**
   * Handles selection of item type (Ingredients or Products)
   * Resets search state and focuses the input field
   */
  const handleSelectItemType = (type) => {
    setItemType(type);
    setItemQuery("");
    setItemSuggestions([]);
    setSelectedItem(null);
    setScannedFoodItem(null);
    textInputRef.current?.clear();
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 0);
  };

  /**
   * Fetches autocomplete suggestions based on search text
   * Uses different APIs based on the selected item type
   */
  const fetchItemSuggestions = async (text) => {
    setItemQuery(text);
    if (text.length < 3) {
      setItemSuggestions([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let result;
      if (itemType === "Ingredients") {
        result = await autoCompleteIngredients(text);
      } else if (itemType === "Products") {
        result = await autoCompleteProducts(text);
      }
      setItemSuggestions(result?.data || []);
    } catch (err) {
      console.error("Error fetching item suggestions:", err);
      setError("Failed to fetch suggestions.");
      setItemSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles selection of an item from the suggestions list
   * Navigates to the nutrition info page for the selected item
   */
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setItemQuery(item.name || item.title);
    setItemSuggestions([]);
    navigateToNutritionInfo(item, itemType);
  };

  /**
   * Performs a natural language search for food items
   * Uses the Nutritionix Natural Language API
   */
  const handleNaturalSearch = async () => {
    if (!naturalQuery.trim()) return;
    setLoading(true);
    setError(null);
    setNaturalFoodItems([]);
    try {
      const result = await getNaturalLanguageNutrition(naturalQuery);
      console.log("Natural language search response:", result);

      if (result?.foods && result.foods.length > 0) {
        const foodsWithZeroQty = result.foods.map((food) => ({
          ...food,
          serving_qty: 0,
        }));
        setNaturalFoodItems(foodsWithZeroQty);
        console.log(
          `Found ${result.foods.length} food items matching your query.`
        );
      } else {
        console.warn("No food items found in natural language response.");
        setError("没有找到符合您查询的食物项。");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error fetching natural language nutrition:", err);
      setError("处理自然语言查询失败。");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Returns current date in YYYY-MM-DD format
   * Used for tracking food entries by date
   */
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /**
   * Adds a food item to the daily tracker
   * Saves the item details to Firestore database
   */
  const addItemToTracker = async (item) => {
    if (!user?.uid || !item) return;
    setLoading(true);
    try {
      const todayDate = getTodayDateString();
      const trackerEntry = {
        userId: user.uid,
        userEmail: user.email,
        date: todayDate,
        foodName: item.food_name,
        servingQty: item.serving_qty || item.servingQty || 1, // Adjust field names if needed
        servingUnit: item.serving_unit || item.servingUnit,
        calories: item.nf_calories || 0,
        nf_total_fat: item.nf_total_fat || 0,
        nf_saturated_fat: item.nf_saturated_fat || 0,
        nf_cholesterol: item.nf_cholesterol || 0,
        nf_sodium: item.nf_sodium || 0,
        nf_total_carbohydrate: item.nf_total_carbohydrate || 0,
        nf_dietary_fiber: item.nf_dietary_fiber || 0,
        nf_sugars: item.nf_sugars || 0,
        nf_protein: item.nf_protein || 0,
        full_nutrients: item.full_nutrients || null,
        source: "barcode",
        photo: item.photo?.thumb || productImage || null,
        addedAt: new Date(),
        upc: scannedData?.data,
      };

      const docRef = await addDoc(collection(db, "dailyTracker"), trackerEntry);
      console.log("Added to tracker: ", item.food_name, " Doc ID: ", docRef.id);
      Alert.alert("Success", `${item.food_name} added to today's tracker.`);
      setProductImage("");
      setProductName("");
      setScannedFoodItem(null);
    } catch (error) {
      console.error("Error adding item to tracker:", error);
      Alert.alert("Error", "Could not add item to tracker.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the camera to take a picture of food
   * Uses image recognition to identify the food item
   */
  const takePicture = async () => {
    setError(null);
    setLoading(true);
    setNaturalFoodItems([]);
    setCameraLabel("");

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        base64: true,
      });

      if (result.cancelled || !result.assets?.[0]?.base64) {
        setError("Picture cancelled.");
        return;
      }

      const base64Image = result.assets[0].base64;

      const { labels } = await identifyFoodImage(base64Image);
      console.log("Vision labels:", labels);

      if (!labels || labels.length === 0) {
        setError("Could not identifty the food in the image");
        return;
      }

      const vagueLabels = ["food", "dish", "meal", "product", "cuisine"];
      let nutritionResult = null;
      let finalLabel = null;

      for (const label of labels) {
        if (vagueLabels.includes(label.toLowerCase())) continue;

        try {
          console.log(`Searching for label "${label}"`);
          const result = await getNaturalLanguageNutrition(label);
          if (result?.foods?.length > 0) {
            nutritionResult = result;
            finalLabel = label;
            break;
          }
        } catch (err) {
          console.warn(`No label found for: "${label}"`);
        }
      }

      if (!nutritionResult) {
        setError("Could not find a nutrtion label for the food");
        return;
      }

      setCameraLabel(finalLabel);

      const foodsWithZeroQty = nutritionResult.foods.map((food) => ({
        ...food,
        serving_qty: food.servingQty || 1,
      }));
      setNaturalFoodItems(foodsWithZeroQty);
    } catch (err) {
      console.error("Camera error: ", err?.response?.data || err.message);
      setError("Could not identify the food or find it's nutrition label");
    } finally {
      setLoading(false);
    }
  };

  const addAllItemsToTracker = async () => {
    if (!user?.uid || naturalFoodItems.length === 0) return;
    setLoading(true);
    try {
      const todayDate = getTodayDateString();
      const batch = writeBatch(db);
      let count = 0;

      naturalFoodItems.forEach((item) => {
        const trackerEntry = {
          userId: user.uid,
          userEmail: user.email,
          date: todayDate,
          foodName: item.food_name,
          servingQty: 1,
          servingUnit: item.serving_unit,
          calories: item.nf_calories || 0,
          nf_total_fat: item.nf_total_fat || 0,
          nf_saturated_fat: item.nf_saturated_fat || 0,
          nf_cholesterol: item.nf_cholesterol || 0,
          nf_sodium: item.nf_sodium || 0,
          nf_total_carbohydrate: item.nf_total_carbohydrate || 0,
          nf_dietary_fiber: item.nf_dietary_fiber || 0,
          nf_sugars: item.nf_sugars || 0,
          nf_protein: item.nf_protein || 0,
          full_nutrients: item.full_nutrients || null,
          source: "natural",
          photo: item.photo?.thumb || null,
          addedAt: new Date(),
        };
        const docRef = doc(collection(db, "dailyTracker"));
        batch.set(docRef, trackerEntry);
        count++;
      });

      await batch.commit();
      console.log(`Added ${count} items to tracker.`);
      Alert.alert("Success", `${count} item(s) added to today's tracker.`);
      setNaturalFoodItems([]);
    } catch (error) {
      console.error("Error adding all items to tracker:", error);
      Alert.alert("Error", "Could not add all items to tracker.");
    } finally {
      setNaturalQuery("");
      setLoading(false);
    }
  };

  const startScanner = async () => {
    if (!permission) {
      // Camera permissions are still loading
      return;
    }
    if (!permission.granted) {
      const { status } = await requestPermission();
      if (status !== "granted") {
        alert("Camera permission is required to scan barcodes.");
        return;
      }
    }
    setScannedData(null);
    setError(null);
    setProductName(""); // Reset product info on new scan
    setProductImage("");
    setScannedFoodItem(null); // Reset nutrition info on new scan
    setIsScannerVisible(true);
  };

  const lastScanTimeRef = useRef(0);
  const handleBarCodeScanned = async ({ type, data }) => {
    // debounce
    const now = Date.now();
    if (now - lastScanTimeRef.current < 1000) return;
    lastScanTimeRef.current = now;

    setIsScannerVisible(false);
    setScannedData({ type, data });
    setProductName(""); // Reset previous results
    setProductImage("");
    setScannedFoodItem(null); // Reset previous nutrition data
    console.log("--------------------------------------");
    console.log(`Barcode scanned: Type: ${type}, Data: ${data}`);

    setLoading(true);
    setError(null);

    // Attempt 1: Get basic product info (name/image) - using EANdata here
    try {
      const eanResult = await getProductByUPCFromEandata(data);
      console.log("UPC Lookup Result Eandata:", eanResult);
      if (eanResult?.product) {
        const name =
          eanResult.product.attributes?.product || "Product Name Unavailable";
        const image = eanResult.product.image;
        setProductName(name);
        setProductImage(image);
      } else {
        console.log("No product info found via EANdata for this UPC.");
        // Optionally set a default name or leave blank
        setProductName("Product Name Unavailable");
      }
    } catch (err) {
      console.error("Error fetching from EANdata:", err);
      // Don't set global error yet, maybe Nutritionix will work
      setProductName("Product Name Lookup Failed");
    }

    // Attempt 2: Get detailed nutrition info from Nutritionix
    try {
      console.log("trying1");
      const nutritionixResult = await getProductByUPC(data);
      console.log("UPC Lookup Result Nutritionix:", nutritionixResult); // Raw response
      console.log("trying2");

      if (nutritionixResult?.foods?.length > 0) {
        const foodItem = nutritionixResult.foods[0];
        // Set state to enable the "Add to Tracker" button
        setScannedFoodItem(foodItem);

        // Update product name/image if Nutritionix has better ones (optional)
        if (
          !productName ||
          productName === "Product Name Unavailable" ||
          productName === "Product Name Lookup Failed"
        ) {
          setProductName(foodItem.food_name || "Product Name Unavailable");
        }
        if (!productImage && foodItem.photo?.thumb) {
          setProductImage(foodItem.photo.thumb);
        }
        // Now proceed to save raw scan & navigate (or maybe just navigate?)
        saveAndNavigateScannedItem(foodItem, scannedData); // Keep or remove based on desired flow
      } else {
        setError("Nutritional info not found for this barcode.");
        // Do not call saveAndNavigate if no nutrition info
        setScannedFoodItem(null);
      }
    } catch (err) {
      console.error("Error fetching product by UPC from Nutritionix:", err);
      setError("Failed to fetch nutritional information.");
      setScannedFoodItem(null);
      // Don't navigate if Nutritionix failed
    } finally {
      setLoading(false);
      // Consider removing the timeout or making it longer
      // setTimeout(() => setError(null), 5000);
    }
  };

  // This function now accepts the scan data directly.
  const saveAndNavigateScannedItem = async (foodItem, currentScanData) => {
    // Safeguard against invalid data
    if (!currentScanData || typeof currentScanData.data === "undefined") {
      // console.error(
      //   "Attempted to save/navigate without valid scan data:",
      //   currentScanData
      // );
      //setError("Cannot proceed: scan data is missing or invalid.");
      return; // Stop execution if data is bad
    }

    try {
      // Save the raw scan details to Firestore
      const docRef = await addDoc(collection(db, "scannedItems"), {
        userEmail: user?.email,
        upc: currentScanData.data, // Use passed data
        scanType: currentScanData.type, // Use passed data
        apiResult: foodItem, // Store the raw Nutritionix result
        createdAt: new Date(),
      });
      console.log("Raw scanned item saved with ID: ", docRef.id);

      // Navigate to the details screen
      router.push({
        pathname: "/search-info/NutritionInfo",
        params: {
          title: "Scanned Product",
          id: currentScanData.data, // Use UPC as ID for consistency or docRef.id? Using UPC for now.
          name: foodItem.food_name,
          image: foodItem.photo?.thumb || productImage, // Pass image URL
          apiResult: JSON.stringify(foodItem), // Pass full data
          source: "barcode",
        },
      });
    } catch (error) {
      console.error("Error saving raw scanned item or navigating: ", error);
      setError("Failed to save or display scanned item info.");
      // Keep the error message visible until the next action
    }
  };

  const navigateToNutritionInfo = async (itemData, type) => {
    try {
      setLoading(true);
      const docId = Date.now().toString();
      const collectionName =
        type === "Ingredients" ? "ingredientsLog" : "productsLog";

      const dataToSave = {
        userEmail: user?.email,
        apiResult: itemData,
        searchType: type,
        apiId: itemData.id,
        name: itemData.name || itemData.title,
        image: itemData.image,
        createdAt: new Date(),
      };

      await setDoc(doc(db, collectionName, docId), dataToSave);
      console.log(`Saved ${type} to ${collectionName}`);

      router.push({
        pathname: "/search-info/NutritionInfo",
        params: {
          title: type,
          id: itemData.id,
          name: itemData.name || itemData.title,
          image: itemData.image,
          source: "itemSearch",
        },
      });
    } catch (error) {
      console.error("Error saving item or navigating: ", error);
      setError(`Failed to save or display ${type} info.`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalNutrition = () => {
    if (!naturalFoodItems || naturalFoodItems.length === 0) return null;

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

    naturalFoodItems.forEach((item) => {
      // 确保serving_qty有效，如果不存在则默认为0
      const servingQty = item.serving_qty || 0;

      // 计算每个营养素时乘以servingQty
      totalNutrition.calories += (item.nf_calories || 0) * servingQty;
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

  const nutritionFacts = useMemo(() => {
    return calculateTotalNutrition();
  }, [naturalFoodItems]);

  const renderNutritionLabel = () => {
    if (!nutritionFacts) return null;

    const dailyValue = {
      total_fat: 78, // g
      saturated_fat: 20, // g
      trans_fat: 0, // g - no established dv
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
        <Text style={styles.nutritionTitle}>Nutrition Facts</Text>
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
              {nutritionFacts.sodium.toFixed(0)}mg
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

  const renderItemSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectItem(item)}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.suggestionImage} />
      )}
      <Text style={styles.suggestionText}>{item.name || item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0} // Adjust if needed
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled" // Keep keyboard open if needed
      >
        <View style={styles.innerContainer}>
          <View style={styles.modeSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                searchMode === "Natural" && styles.modeButtonActive,
              ]}
              onPress={() => setSearchMode("Natural")}>
              <MaterialCommunityIcons
                name="comment-text-outline"
                size={20}
                color={searchMode === "Natural" ? Colors.WHITE : Colors.BLACK}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  searchMode === "Natural" && styles.modeButtonTextActive,
                ]}>
                {" "}
                Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                searchMode === "Camera" && styles.modeButtonActive,
              ]}
              onPress={() => setSearchMode("Camera")}>
              <MaterialCommunityIcons
                name="camera"
                size={20}
                color={searchMode === "Camera" ? Colors.WHITE : Colors.BLACK}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  searchMode === "Camera" && styles.modeButtonTextActive,
                ]}>
                {" "}
                AI Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,
                searchMode === "Barcode" && styles.modeButtonActive,
              ]}
              onPress={() => setSearchMode("Barcode")}>
              <MaterialCommunityIcons
                name="barcode-scan"
                size={20}
                color={searchMode === "Barcode" ? Colors.WHITE : Colors.BLACK}
              />
              <Text
                style={[
                  styles.modeButtonText,
                  searchMode === "Barcode" && styles.modeButtonTextActive,
                ]}>
                {" "}
                Scan
              </Text>
            </TouchableOpacity>
          </View>
          {/* Loading and Error Indicators */}
          {loading &&
            !isScannerVisible && ( // Don't show main loader when scanner is visible
              <ActivityIndicator
                size="large"
                color={Colors.BLACK}
                style={styles.loader}
              />
            )}
          {error && <Text style={styles.errorText}>{error}</Text>}
          {/* == Item Search UI == */}
          {/* == Natural Language UI == */}
          {searchMode === "Natural" && (
            <>
              <Text style={styles.header}>Enter your meal</Text>
              <TextInput
                placeholder='type any foods e.g., "1 apple and 2 slices of toast"'
                placeholderTextColor={Colors.GRAY}
                style={[styles.input, styles.naturalInput]} // Larger input area
                value={naturalQuery}
                onChangeText={setNaturalQuery}
                multiline
              />
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleNaturalSearch}
                disabled={loading}>
                <Text style={styles.actionButtonText}>Find food</Text>
              </TouchableOpacity>

              {/* --- Display Natural Language Results --- */}
              {naturalFoodItems.length > 0 && (
                <View style={styles.resultsContainer}>
                  <View style={styles.foodItemsContainer}>
                    <View style={styles.naturalResultsHeaderRow}>
                      <View style={{ width: 50 }} />
                      <Text
                        style={[
                          styles.naturalColumnHeader,
                          styles.naturalQtyCol,
                        ]}>
                        Qty
                      </Text>
                      <Text
                        style={[
                          styles.naturalColumnHeader,
                          styles.naturalUnitCol,
                        ]}>
                        Unit
                      </Text>
                      <Text
                        style={[
                          styles.naturalColumnHeader,
                          styles.naturalFoodCol,
                        ]}>
                        Food
                      </Text>
                      <Text
                        style={[
                          styles.naturalColumnHeader,
                          styles.naturalCalCol,
                        ]}>
                        Cal
                      </Text>
                      <View style={{ width: 50 }} />
                    </View>
                    <FlatList
                      data={naturalFoodItems}
                      keyExtractor={(item, index) => item.food_name + index}
                      renderItem={({ item }) => (
                        <View style={styles.naturalItemRow}>
                          <Image
                            source={{ uri: item.photo?.thumb || undefined }}
                            style={styles.naturalItemImage}
                            defaultSource={require("../../assets/picture/food-placeholder.png")}
                          />
                          <View
                            style={[styles.naturalQtyCol, styles.qtyContainer]}>
                            <TouchableOpacity
                              style={[
                                styles.qtyButton,
                                item.serving_qty <= 0
                                  ? styles.qtyButtonDisabled
                                  : null,
                              ]}
                              disabled={item.serving_qty <= 0}
                              onPress={() => {
                                const newItems = [...naturalFoodItems];
                                const index = newItems.findIndex(
                                  (i) => i === item
                                );
                                if (
                                  index !== -1 &&
                                  newItems[index].serving_qty > 0
                                ) {
                                  newItems[index] = {
                                    ...newItems[index],
                                    serving_qty:
                                      newItems[index].serving_qty - 1,
                                  };
                                  setNaturalFoodItems(newItems);
                                }
                              }}>
                              <Text
                                style={[
                                  styles.qtyButtonText,
                                  item.serving_qty <= 0
                                    ? styles.qtyButtonTextDisabled
                                    : null,
                                ]}>
                                -
                              </Text>
                            </TouchableOpacity>
                            <Text style={styles.naturalItemText}>
                              {item.serving_qty || 0}
                            </Text>
                            <TouchableOpacity
                              style={[styles.qtyButton, styles.qtyButtonAdd]}
                              onPress={() => {
                                const newItems = [...naturalFoodItems];
                                const index = newItems.findIndex(
                                  (i) => i === item
                                );
                                if (index !== -1) {
                                  newItems[index] = {
                                    ...newItems[index],
                                    serving_qty:
                                      (newItems[index].serving_qty || 0) + 1,
                                  };
                                  setNaturalFoodItems(newItems);
                                }
                              }}>
                              <Text
                                style={[
                                  styles.qtyButtonText,
                                  styles.qtyButtonTextAdd,
                                ]}>
                                +
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <Text
                            style={[
                              styles.naturalItemText,
                              styles.naturalUnitCol,
                            ]}>
                            {item.serving_unit}
                          </Text>
                          <Text
                            style={[
                              styles.naturalItemText,
                              styles.naturalFoodCol,
                            ]}>
                            {item.food_name}
                          </Text>
                          <Text
                            style={[
                              styles.naturalItemText,
                              styles.naturalCalCol,
                            ]}>
                            {item.nf_calories?.toFixed(0) ?? "N/A"}
                          </Text>
                          <TouchableOpacity
                            style={styles.addTrackerButton}
                            onPress={() => addItemToTracker(item)}
                            disabled={loading}>
                            <MaterialCommunityIcons
                              name="plus-circle-outline"
                              size={22}
                              color={Colors.BLACK}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      nestedScrollEnabled={true}
                      scrollEnabled={true}
                      style={styles.foodItemsList}
                    />
                    <TouchableOpacity
                      style={[styles.actionButton, styles.addAllButton]}
                      onPress={addAllItemsToTracker}
                      disabled={loading}>
                      <MaterialCommunityIcons
                        name="plus-box-multiple-outline"
                        size={20}
                        color={Colors.WHITE}
                      />
                      <Text style={styles.actionButtonText}>
                        Add All to Tracker
                      </Text>
                    </TouchableOpacity>
                    <Text style={styles.naturalTotalCalories}>
                      Total Calories:{" "}
                      {naturalFoodItems
                        .reduce((sum, item) => {
                          const servingQty = item.serving_qty || 0;
                          return sum + (item.nf_calories || 0) * servingQty;
                        }, 0)
                        .toFixed(0)}
                    </Text>
                  </View>

                  {renderNutritionLabel()}
                </View>
              )}
            </>
          )}
          {/* == Barcode Scanner UI == */}
          {searchMode === "Barcode" && (
            <>
              <Text style={styles.header}>Scan Barcode</Text>
              {!isScannerVisible && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={startScanner}
                  disabled={loading} // Disable if already loading/processing
                >
                  <MaterialCommunityIcons
                    name="barcode-scan"
                    size={20}
                    color={Colors.WHITE}
                  />
                  <Text style={styles.actionButtonText}> Start Scanner</Text>
                </TouchableOpacity>
              )}
              {scannedData &&
                !isScannerVisible && ( // Only show details if scanner closed
                  <Text style={styles.scannedText}>
                    Scanned: {scannedData.data} (Type: {scannedData.type})
                  </Text>
                )}

              {/* Product Display Area */}
              {!isScannerVisible &&
                (productName || productImage || scannedFoodItem) && ( // Show container if we have any info
                  <View style={styles.productContainer}>
                    {productImage ? (
                      <Image
                        source={{ uri: productImage }}
                        style={styles.productImage}
                        resizeMode="contain" // Use contain to avoid stretching
                      />
                    ) : (
                      // Placeholder if no image found
                      <View
                        style={[styles.productImage, styles.imagePlaceholder]}>
                        <MaterialCommunityIcons
                          name="food-variant-off"
                          size={50}
                          color={Colors.GRAY}
                        />
                      </View>
                    )}
                    {productName && (
                      <Text style={styles.productName}>{productName}</Text>
                    )}

                    {/* Add to Tracker Button */}
                    {scannedFoodItem && !loading && (
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.addTrackerButtonScanner,
                        ]}
                        onPress={() => addItemToTracker(scannedFoodItem)}
                        disabled={loading}>
                        <MaterialCommunityIcons
                          name="plus-circle-outline"
                          size={20}
                          color={Colors.WHITE}
                        />
                        <Text style={styles.actionButtonText}>
                          {" "}
                          Add to Daily Tracker
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* View Details Button - Pass scannedData here */}
                    {scannedFoodItem && !loading && (
                      <TouchableOpacity
                        style={[
                          styles.secondaryButton,
                          styles.viewDetailsButton,
                        ]}
                        onPress={() =>
                          saveAndNavigateScannedItem(
                            scannedFoodItem,
                            scannedData
                          )
                        } // Pass scannedData
                        disabled={loading}>
                        <MaterialCommunityIcons
                          name="information-outline"
                          size={20}
                          color={Colors.BLACK}
                        />
                        <Text style={styles.secondaryButtonText}>
                          {" "}
                          View Details
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Placeholder or status text */}
                    {!scannedFoodItem && !loading && scannedData && (
                      <Text style={styles.barcodeDisclaimer}>
                        {error
                          ? error
                          : "Looking up nutritional information..."}
                      </Text>
                    )}
                    {!scannedFoodItem && loading && (
                      <ActivityIndicator
                        size="small"
                        color={Colors.BLACK}
                        style={{ marginTop: 15 }}
                      />
                    )}
                  </View>
                )}
              {/* Initial placeholder text */}
              {!scannedData && !loading && (
                <Text style={styles.placeholderText}>
                  Scan a barcode to view product details
                </Text>
              )}
            </>
          )}
          {searchMode === "Camera" && (
            <>
              <Text style={styles.header}>AI Camera</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={takePicture}
                disabled={loading}>
                <MaterialCommunityIcons
                  name="camera"
                  size={20}
                  color={Colors.WHITE}
                />
                <Text style={styles.actionButtonText}> Take a Picture</Text>
              </TouchableOpacity>

              {cameraLabel && (
                <Text style={{ textAlign: "center", marginTop: 10 }}>
                  Detected: {cameraLabel}
                </Text>
              )}
              {naturalFoodItems.length > 0 && (
                <>
                  {renderNutritionLabel()}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.addAllButton]}
                    onPress={() => addItemToTracker(naturalFoodItems[0])}
                    disabled={loading}>
                    <MaterialCommunityIcons
                      name="plus-box-multiple-outline"
                      size={20}
                      color={Colors.WHITE}
                    />
                    <Text style={styles.actionButtonText}>Add to Tracker</Text>
                  </TouchableOpacity>
                </>
              )}
              <Text style={styles.placeholderText}>
                Take a picture of a food item and retrieve its nutritional
                information
              </Text>
            </>
          )}
        </View>
      </ScrollView>

      {/* Barcode Scanner Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isScannerVisible}
        onRequestClose={() => setIsScannerVisible(false)}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={loading ? undefined : handleBarCodeScanned} // Prevent scanning while processing previous one
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"], // Focused relevant types
          }}
        />
        <TouchableOpacity
          style={styles.cancelScanButton}
          onPress={() => setIsScannerVisible(false)}>
          <Text style={styles.cancelScanButtonText}>Cancel</Text>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20, // Ensure space at bottom
    paddingHorizontal: 15,
    flexGrow: 1, // Make sure content can grow
  },
  innerContainer: {
    paddingTop: Platform.OS === "ios" ? 60 : 40, // Adjust top padding for status bar etc.
  },
  modeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.WHITE, // Ensure background
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  modeButtonActive: {
    backgroundColor: Colors.BLACK,
  },
  modeButtonText: {
    fontFamily: "myfont-medium",
    fontSize: 14, // Slightly smaller maybe
    color: Colors.BLACK,
    marginLeft: 5,
  },
  modeButtonTextActive: {
    color: Colors.WHITE,
  },
  header: {
    fontSize: 24,
    fontFamily: "myfont-bold",
    textAlign: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  itemTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  itemTypeButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    minWidth: 100,
  },
  itemTypeButtonActive: {
    backgroundColor: Colors.LIGHT_GRAY,
    borderColor: Colors.GRAY,
  },
  itemTypeImage: {
    width: 40,
    height: 40,
    marginBottom: 5,
  },
  itemTypeButtonText: {
    fontFamily: "myfont",
    fontSize: 14,
    color: Colors.BLACK,
  },
  itemTypeButtonTextActive: {
    fontFamily: "myfont-bold",
  },
  input: {
    fontFamily: "myfont",
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: Colors.WHITE,
  },
  naturalInput: {
    height: 100,
    textAlignVertical: "top",
  },
  suggestionsList: {
    maxHeight: 200,
    borderColor: Colors.LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.EXTRA_LIGHT_GRAY,
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 10,
  },
  suggestionText: {
    fontFamily: "myfont",
    fontSize: 15,
    flex: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.BLACK,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    minHeight: 45, // Ensure minimum height
  },
  actionButtonText: {
    color: Colors.WHITE,
    fontFamily: "myfont-bold",
    fontSize: 16,
    marginLeft: 5,
  },
  secondaryButton: {
    // Style for secondary actions like "View Details"
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.WHITE,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.BLACK,
    minHeight: 40,
  },
  secondaryButtonText: {
    color: Colors.BLACK,
    fontFamily: "myfont-medium",
    fontSize: 15,
    marginLeft: 5,
  },
  scannedText: {
    textAlign: "center",
    marginTop: 15,
    marginBottom: 10, // Add margin below
    fontFamily: "myfont",
    color: Colors.GRAY,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: Colors.RED, // Use a distinct error color
    textAlign: "center",
    marginVertical: 15,
    fontFamily: "myfont-medium",
    paddingHorizontal: 10, // Add padding
  },
  productContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    backgroundColor: Colors.EXTRA_LIGHT_GRAY, // Light background for emphasis
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: Colors.LIGHT_GRAY, // Background for placeholder/loading
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.LIGHT_GRAY,
  },
  productName: {
    fontFamily: "myfont-bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 15,
  },
  addTrackerButtonScanner: {
    // Specific style for this button if needed
    marginTop: 15,
    backgroundColor: Colors.PRIMARY, // Use primary color for tracker actions
  },
  viewDetailsButton: {
    marginTop: 8, // Less margin than primary button
    borderColor: Colors.GRAY, // Subtler border
  },
  barcodeDisclaimer: {
    fontFamily: "myfont",
    fontSize: 13,
    color: Colors.GRAY,
    textAlign: "center",
    marginTop: 15,
  },
  placeholderText: {
    fontFamily: "myfont",
    fontSize: 15,
    color: Colors.GRAY,
    textAlign: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  cancelScanButton: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 15,
    borderRadius: 10,
  },
  cancelScanButtonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "myfont-bold",
    fontSize: 16,
  },
});
