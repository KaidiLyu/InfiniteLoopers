import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import {
  FontAwesome6,
  Feather,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../configs/FirebaseConfig";

const NutrientRow = ({ label, value, unit, indent = false }) => {
  if (value === undefined || value === null) return null;
  return (
    <View style={[styles.nutrientRow, indent && styles.indent]}>
      <Text style={styles.nutrientLabel}>{label}:</Text>
      <Text style={styles.nutrientValue}>
        {value} {unit}
      </Text>
    </View>
  );
};

export default function NutritionInfo() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const { source, id, title, name, image, apiResult } = params;

  const [loading, setLoading] = useState(false);
  const [itemData, setItemData] = useState(null);
  const [error, setError] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    if (source === "barcode" && apiResult) {
      try {
        const parsedResult = JSON.parse(apiResult);
        setItemData(parsedResult);
      } catch (e) {
        console.error("Failed to parse barcode API result:", e);
        setError("Error displaying scanned item data.");
      }
    } else if (source === "itemSearch" && apiResult) {
      try {
        console.log("Item Search Data (from params):", apiResult);
        setItemData({
          food_name: name,
          photo: { thumb: image },
          nf_calories: params.calories || "N/A",
          nf_protein: params.protein || "N/A",
          nf_total_fat: params.fat || "N/A",
          nf_total_carbohydrate: params.carbs || "N/A",
        });
      } catch (e) {
        console.error("Failed to process item search data:", e);
        setError("Error displaying item data.");
      }
    } else {
      console.warn(
        "NutritionInfo loaded with unexpected source or missing data:",
        params
      );
      setError("Could not load nutrition information.");
    }
  }, [params]);

  const handleDelete = () => {
    let collectionName = null;
    let docIdToDelete = id;

    if (source === "barcode" || source === "itemSearch") {
      if (title === "Scanned Product") {
        collectionName = "scannedItems";
        Alert.alert(
          "Deletion Not Implemented",
          "Deletion for scanned items needs adjustment."
        );
        return;
      } else if (title === "Ingredients") {
        collectionName = "ingredientsLog";
      } else if (title === "Products") {
        collectionName = "productsLog";
      }
    } else {
      Alert.alert("Error", "Cannot determine item type to delete.");
      return;
    }

    if (!collectionName) {
      Alert.alert("Error", "Cannot determine item type to delete.");
      return;
    }

    Alert.alert("Delete Item", `Are you sure you want to delete ${name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            console.log(`Deleting doc: ${collectionName}/${docIdToDelete}`);
            await deleteDoc(doc(db, collectionName, docIdToDelete));
            setLoading(false);
            Alert.alert("Success", "Item deleted successfully");
            router.replace({
              pathname: "/(tabs)/SearchFood",
              params: { refresh: Date.now() },
            });
          } catch (error) {
            setLoading(false);
            console.error("Error deleting item:", error);
            Alert.alert("Error", "Failed to delete item.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.BLACK} />
      </View>
    );
  }

  if (error || !itemData) {
    return (
      <View style={styles.container}>
        {/* Keep header for back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText} numberOfLines={1}>
            Error
          </Text>
          <View style={{ width: 30 }} /> {/* Spacer */}
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {error || "Item data could not be loaded."}
          </Text>
        </View>
      </View>
    );
  }

  const itemName = itemData.food_name || name || "Unknown Item";
  const itemImageUri = itemData.photo?.thumb || image;
  const calories = itemData.nf_calories;
  const protein = itemData.nf_protein;
  const totalFat = itemData.nf_total_fat;
  const satFat = itemData.nf_saturated_fat;
  const cholesterol = itemData.nf_cholesterol;
  const sodium = itemData.nf_sodium;
  const carbs = itemData.nf_total_carbohydrate;
  const fiber = itemData.nf_dietary_fiber;
  const sugars = itemData.nf_sugars;
  const potassium = itemData.nf_potassium;
  const servingQty = itemData.serving_qty || 1;
  const servingUnit = itemData.serving_unit || "serving";
  const servingWeight = itemData.serving_weight_grams;

  const brandName = itemData.brand_name;
  const sourceLink = itemData.metadata?.source_url;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1}>
          {brandName || title}
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.itemName}>{itemName}</Text>
          {itemImageUri ? (
            <Image source={{ uri: itemImageUri }} style={styles.itemImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons
                name="food-variant"
                size={50}
                color={Colors.GRAY}
              />
            </View>
          )}
        </View>

        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>Nutrition Facts</Text>
          <Text style={styles.servingSize}>
            Serving Size: {servingQty} {servingUnit}
            {servingWeight && ` (${servingWeight.toFixed(0)}g)`}
          </Text>
          <View style={styles.separator} />

          <NutrientRow label="Calories" value={calories?.toFixed(0)} unit="" />
          <View style={styles.separatorThin} />

          <NutrientRow
            label="Total Fat"
            value={totalFat?.toFixed(1)}
            unit="g"
          />
          <NutrientRow
            label="Saturated Fat"
            value={satFat?.toFixed(1)}
            unit="g"
            indent
          />
          {/* Add Trans Fat if available */}
          <NutrientRow
            label="Cholesterol"
            value={cholesterol?.toFixed(0)}
            unit="mg"
          />
          <NutrientRow label="Sodium" value={sodium?.toFixed(0)} unit="mg" />
          <NutrientRow
            label="Total Carbohydrate"
            value={carbs?.toFixed(1)}
            unit="g"
          />
          <NutrientRow
            label="Dietary Fiber"
            value={fiber?.toFixed(1)}
            unit="g"
            indent
          />
          <NutrientRow
            label="Total Sugars"
            value={sugars?.toFixed(1)}
            unit="g"
            indent
          />
          {/* Add Added Sugars if available */}
          <NutrientRow label="Protein" value={protein?.toFixed(1)} unit="g" />
          <View style={styles.separatorThin} />

          {/* Add Vitamins/Minerals if available */}
          <NutrientRow
            label="Potassium"
            value={potassium?.toFixed(0)}
            unit="mg"
          />
          {/* <NutrientRow label="Vitamin D" value={...} unit="mcg" /> */}
          {/* <NutrientRow label="Calcium" value={...} unit="mg" /> */}
          {/* <NutrientRow label="Iron" value={...} unit="mg" /> */}
        </View>

        {sourceLink && (
          <TouchableOpacity
            onPress={() => Linking.openURL(sourceLink)}
            style={styles.sourceLinkButton}>
            <MaterialCommunityIcons
              name="link-variant"
              size={18}
              color={Colors.BLUE}
            />
            <Text style={styles.sourceLinkText}> View Source</Text>
          </TouchableOpacity>
        )}

        {/* Add Nutritionix attribution if data came from them */}
        {(source === "barcode" || source === "natural") && (
          <Text style={styles.attributionText}>
            Nutrition data powered by Nutritionix
          </Text>
        )}
        {/* (less likely here now) */}
        {source === "itemSearch" && (
          <Text style={styles.attributionText}>
            Data possibly from Spoonacular
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  headerText: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "myfont-bold",
    marginHorizontal: 10,
  },
  deleteButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY,
  },
  itemName: {
    fontSize: 22,
    fontFamily: "myfont-bold",
    textAlign: "center",
    marginBottom: 15,
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.EXTRA_LIGHT_GRAY,
    justifyContent: "center",
    alignItems: "center",
  },
  nutritionSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: Colors.LIGHT_GRAY_BACKGROUND,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "myfont-bold",
    marginBottom: 10,
  },
  servingSize: {
    fontSize: 14,
    fontFamily: "myfont",
    color: Colors.DARK_GRAY,
    marginBottom: 8,
  },
  separator: {
    height: 10,
    backgroundColor: Colors.BLACK,
    marginVertical: 5,
  },
  separatorThin: {
    height: 1,
    backgroundColor: Colors.LIGHT_GRAY,
    marginVertical: 5,
  },
  nutrientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    marginVertical: 1,
  },
  indent: {
    marginLeft: 15,
  },
  nutrientLabel: {
    fontFamily: "myfont",
    fontSize: 15,
    flexShrink: 1, // Allow label to shrink if needed
    marginRight: 5,
  },
  nutrientValue: {
    fontFamily: "myfont-medium",
    fontSize: 15,
    textAlign: "right",
  },
  sourceLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    padding: 10,
  },
  sourceLinkText: {
    fontFamily: "myfont",
    fontSize: 14,
    color: Colors.BLUE,
    marginLeft: 5,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontFamily: "myfont",
    fontSize: 16,
  },
  attributionText: {
    fontSize: 12,
    color: Colors.GRAY,
    textAlign: "center",
    marginTop: 20,
    fontFamily: "myfont",
  },
});
