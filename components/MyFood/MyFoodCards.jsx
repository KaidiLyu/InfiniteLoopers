import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useEffect, useState } from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Feather } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";

export default function MyFoodCards({ title, data, isExpanded, onDelete }) {
  const router = useRouter();

  const handleDelete = async (item) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete ${item.results.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, title, item.id));
              onDelete && onDelete();
              Alert.alert("Success", "Item deleted successfully");
            } catch (error) {
              console.error("Error deleting item:", error);
              Alert.alert("Error", "Failed to delete item");
            }
          },
        },
      ]
    );
  };

  const getImageUrl = (item) => {
    if (title === "Ingredients") {
      return `https://spoonacular.com/cdn/ingredients_100x100/${item.results.image}`;
    }
    return item.results.image;
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}>
        <Feather name="trash-2" size={16} color="black" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/search-info/NutritionInfo",
            params: {
              id: item.results.id,
              title: title,
              name: item.results.name,
              image: getImageUrl(item),
            },
          })
        }>
        <View style={styles.card}>
          {title === "Products" ? (
            <MaterialCommunityIcons
              name="image-off-outline"
              size={75}
              color="black"
              style={styles.image}
            />
          ) : (
            <Image
              source={{ uri: getImageUrl(item) }}
              style={styles.image}
              resizeMode="cover"
            />
          )}
          <Text style={styles.text} numberOfLines={1}>
            {item.results.name}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      scrollEnabled={true}
      initialNumToRender={isExpanded ? data.length : 2}
      maxToRenderPerBatch={isExpanded ? data.length : 2}
      windowSize={isExpanded ? data.length : 2}
      style={{ height: "100%" }}
      contentContainerStyle={{ paddingHorizontal: 10 }}
    />
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    position: "relative",
    flex: 1,
    margin: 8,
    maxWidth: "50%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    alignItems: "center",
    padding: 5,
  },
  deleteButton: {
    position: "absolute",
    right: 0,
    top: 2,
    zIndex: 1,
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 5,
    borderWidth: 1,
    borderColor: Colors.BLACK,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 30,
    borderWidth: 1,
    marginBottom: 5,
  },
  text: {
    fontFamily: "myfont",
    fontSize: 14,
    textAlign: "center",
    width: "100%",
    marginTop: 5,
  },
});