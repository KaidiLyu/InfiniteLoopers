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
import { autoCompleteIngredients } from "../api/SearchIngredients";
import { autoCompleteProducts } from "../api/SearchProducts";
import { autoCompleteRecipes } from "../api/SearchRecipes";
import { getNaturalLanguageNutrition } from "../api/NutritionixNatural";
import { getProductByUPC } from "../api/NutritionixUPC";
import { getProductByUPCFromEandata } from "../api/EAN";
import { auth, db } from "../../configs/FirebaseConfig";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  writeBatch,
} from "firebase/firestore";

export default function SearchFood() {
  const user = auth.currentUser;
  const navigation = useNavigation();
  const router = useRouter();

  const [searchMode, setSearchMode] = useState("Item");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [itemType, setItemType] = useState("");
  const [itemQuery, setItemQuery] = useState("");
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const textInputRef = useRef();

  const [naturalQuery, setNaturalQuery] = useState("");
  const [naturalFoodItems, setNaturalFoodItems] = useState([]);

  const [permission, requestPermission] = useCameraPermissions();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [scannedData, setScannedData] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const handleSelectItemType = (type) => {
    setItemType(type);
    setItemQuery("");
    setItemSuggestions([]);
    setSelectedItem(null);
    textInputRef.current?.clear();
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 0);
  };

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

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setItemQuery(item.name || item.title);
    setItemSuggestions([]);
    navigateToNutritionInfo(item, itemType);
  };

  const handleNaturalSearch = async () => {
    if (!naturalQuery.trim()) return;
    setLoading(true);
    setError(null);
    setNaturalFoodItems([]);
    try {
      const result = await getNaturalLanguageNutrition(naturalQuery);
      console.log("Natural language search response:", result);

      if (result?.foods && result.foods.length > 0) {
        setNaturalFoodItems(result.foods);
        console.log(`Found ${result.foods.length} food items matching your query.`);
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

  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
        servingQty: item.serving_qty,
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

      const docRef = await addDoc(collection(db, "dailyTracker"), trackerEntry);
      console.log("Added to tracker: ", item.food_name, " Doc ID: ", docRef.id);
      Alert.alert("Success", `${item.food_name} added to today's tracker.`);
    } catch (error) {
      console.error("Error adding item to tracker:", error);
      Alert.alert("Error", "Could not add item to tracker.");
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
          servingQty: item.serving_qty,
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
      Alert.alert("Success", `${count} items added to today's tracker.`);
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
    setIsScannerVisible(true);
  };

  const [productName, setProductName] = useState("");
  const [productImage, setProductImage] = useState("");
  const lastScanTimeRef = useRef(0);
  const handleBarCodeScanned = async ({ type, data }) => {
    // debounce
    const now = Date.now();
    if (now - lastScanTimeRef.current < 1000) return;
    lastScanTimeRef.current = now;

    setIsScannerVisible(false);
    setScannedData({ type, data });
    console.log(`Barcode scanned: Type: ${type}, Data: ${data}`);

    setLoading(true);
    setError(null);

    try {
      const result = await getProductByUPCFromEandata(data);
      console.log("UPC Lookup Result:", result);

      const name = result.product.attributes.product;
      const image = result.product.image;
      setProductName(name);
      setProductImage(image);
    } catch (err) {
      console.error("Error processing barcode:", err);
      setError("Error fetching product details.");
    } finally {
      setLoading(false);
      setTimeout(() => setError(null), 3000);
    }
    // try {
    //   const result = await getProductByUPC(data);
    //   console.log("UPC Lookup Result:", result.data);
    //   if (result.data?.foods?.length > 0) {
    //     const foodItem = result.data.foods[0];
    //     saveAndNavigateScannedItem(foodItem);
    //   } else {
    //     setError("Product not found for this barcode.");
    //   }
    // } catch (err) {
    //   console.error("Error fetching product by UPC:", err);
    //   setError("Failed to fetch product information from barcode.");
    //   setTimeout(() => setError(null), 3000);
    // } finally {
    //   setLoading(false);
    // }
  };

  const saveAndNavigateScannedItem = async (foodItem) => {
    try {
      const docRef = await addDoc(collection(db, "scannedItems"), {
        userEmail: user?.email,
        upc: scannedData?.data,
        scanType: scannedData?.type,
        apiResult: foodItem,
        createdAt: new Date(),
      });
      console.log("Scanned item saved with ID: ", docRef.id);
      router.push({
        pathname: "/search-info/NutritionInfo",
        params: {
          title: "Scanned Product",
          id: scannedData?.data,
          name: foodItem.food_name,
          image: foodItem.photo?.thumb,
          apiResult: JSON.stringify(foodItem),
          source: "barcode",
        },
      });
    } catch (error) {
      console.error("Error saving scanned item or navigating: ", error);
      setError("Failed to save or display scanned item info.");
      setTimeout(() => setError(null), 3000);
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
      // Ensure serving_qty is valid, if not present it defaults to 1
      const servingQty = item.serving_qty || 1;
      
      // When calculating each nutrient, multiply servingQty by
      totalNutrition.calories += (item.nf_calories || 0) * servingQty;
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled" // Good practice
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
            {/* <TouchableOpacity
            style={[
              styles.modeButton,
              searchMode === "Item" && styles.modeButtonActive,
            ]}
            onPress={() => setSearchMode("Item")}>
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={20}
              color={searchMode === "Item" ? Colors.WHITE : Colors.BLACK}
            />
            <Text
              style={[
                styles.modeButtonText,
                searchMode === "Item" && styles.modeButtonTextActive,
              ]}>
              {" "}
              Item Search
            </Text>
          </TouchableOpacity> */}
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
          {loading && (
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
                          <Text
                            style={[
                              styles.naturalItemText,
                              styles.naturalQtyCol,
                            ]}>
                            {item.serving_qty}
                          </Text>
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
                          const servingQty = item.serving_qty || 1;
                          return sum + ((item.nf_calories || 0) * servingQty);
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
                  onPress={startScanner}>
                  <MaterialCommunityIcons
                    name="barcode-scan"
                    size={20}
                    color={Colors.WHITE}
                  />
                  <Text style={styles.actionButtonText}> Start Scanner</Text>
                </TouchableOpacity>
              )}
              {scannedData && (
                <Text style={styles.scannedText}>
                  Scanned: {scannedData.data} (Type: {scannedData.type})
                </Text>
              )}
              <View style={styles.container}>
                {loading && <ActivityIndicator size="large" color="#000" />}
                {error && <Text style={styles.errorText}>{error}</Text>}
                {productName && productImage ? (
                  <View style={styles.productContainer}>
                    <Image
                      source={{ uri: productImage }}
                      style={styles.productImage}
                    />
                    <Text style={styles.productName}>{productName}</Text>
                    <Text style={styles.barcodeDisclaimer}>
                      Saving products from barcode, nutrition value, and more
                      coming soon.
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>
                    Scan a barcode to view product details
                  </Text>
                )}
              </View>
            </>
          )}
          {searchMode === "Camera" && (
            <>
              <Text style={styles.header}>Coming Soon... 👀</Text>
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
          onBarcodeScanned={handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr", "pdf417"], // relevant types
          }}
        />
        <Button title="Cancel" onPress={() => setIsScannerVisible(false)} />
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
    paddingBottom: 20,
    paddingHorizontal: 15,
    paddingTop: 10,
    flexGrow: 1,
  },
  container: {
    backgroundColor: Colors.WHITE,
  },
  innerContainer: {
    paddingTop: 80,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    zIndex: 10,
  },
  modeSelectorContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 20,
    overflow: "hidden",
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: Colors.WHITE,
  },
  modeButtonActive: {
    backgroundColor: Colors.BLACK,
  },
  modeButtonText: {
    fontFamily: "myfont-medium",
    fontSize: 14,
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
  },
  actionButtonText: {
    color: Colors.WHITE,
    fontFamily: "myfont-bold",
    fontSize: 16,
    marginLeft: 5,
  },
  scannedText: {
    textAlign: "center",
    marginTop: 15,
    fontFamily: "myfont",
    color: Colors.GRAY,
  },
  loader: {
    marginVertical: 20,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
    fontFamily: "myfont",
  },

  resultsContainer: {
    marginTop: 20,
  },
  foodItemsContainer: {
    borderColor: Colors.LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  foodItemsList: {
    maxHeight: 200,
  },
  naturalResultsContainer: {
    marginTop: 20,
    borderColor: Colors.LIGHT_GRAY,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    maxHeight: 600,
  },
  naturalResultsHeaderRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  naturalColumnHeader: {
    fontFamily: "myfont-bold",
    fontSize: 13,
    color: Colors.DARK_GRAY,
    textAlign: "left",
  },
  naturalItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.EXTRA_LIGHT_GRAY,
  },
  naturalItemImage: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: Colors.EXTRA_LIGHT_GRAY,
  },
  naturalItemText: {
    fontFamily: "myfont",
    fontSize: 14,
    textAlign: "left",
    color: Colors.BLACK,
  },
  naturalQtyCol: {
    flex: 1.5,
    textAlign: "left",
    marginRight: 20,
  },
  naturalUnitCol: {
    flex: 3,
    marginRight: 8,
    textAlign: "left",
  },
  naturalFoodCol: {
    flex: 4,
    marginRight: 8,
    textAlign: "left",
  },
  naturalCalCol: {
    flex: 1.5,
    textAlign: "right",
  },
  addTrackerButton: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 5,
  },
  addAllButton: {
    marginTop: 15,
    backgroundColor: "#2E7D32",
  },
  naturalTotalCalories: {
    marginTop: 15,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: Colors.LIGHT_GRAY,
    fontFamily: "myfont-bold",
    fontSize: 15,
    textAlign: "right",
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
    fontSize: 13,
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  errorText: {
    color: "red",
    marginVertical: 8,
    textAlign: "center",
  },
  productContainer: {
    alignItems: "center",
    marginVertical: 16,
    padding: 12,
    backgroundColor: "#F2F2F2",
    borderRadius: 8,
  },
  productImage: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    marginBottom: 12,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  placeholderText: {
    textAlign: "center",
    color: "#666",
    marginTop: 12,
  },
  barcodeDisclaimer: {
    fontSize: 8,
    color: Colors.GRAY,
    fontStyle: "italic",
  },
});
