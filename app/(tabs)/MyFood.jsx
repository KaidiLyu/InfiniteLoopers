import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Colors } from "../../constants/Colors";
import AntDesign from "@expo/vector-icons/AntDesign";
import CreateNewFoodCard from "../../components/MyFood/CreateNewFoodCard";
import {
  Link,
  useRouter,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import {
  doc,
  getDoc,
  getDocs,
  query,
  collection,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../../configs/FirebaseConfig";
import MyFoodCards from "../../components/MyFood/MyFoodCards";
import { Feather } from "@expo/vector-icons";
import Animated, { 
  withSpring, 
  useAnimatedStyle, 
  useSharedValue 
} from "react-native-reanimated";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function MyFood() {
  const [recipesList, setRecipesList] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const router = useRouter();
  const [name, setName] = useState("name");
  const [id, setId] = useState("id");
  const [image, setImage] = useState("image");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    Recipes: true,
    Ingredients: true,
    Products: true,
  });
  const { refresh } = useLocalSearchParams();
  const navigation = useNavigation();

  const user = auth.currentUser;

  const animatedHeights = {
    Recipes: useSharedValue(80),
    Ingredients: useSharedValue(80),
  };

  const getAnimatedStyle = useCallback((section) => {
    return useAnimatedStyle(() => {
      return {
        height: withSpring(animatedHeights[section].value, {
          damping: 15,
          stiffness: 100,
        }),
      };
    });
  }, []);

  useEffect(() => {
    user && getAllFood();
  }, [user]);

  useEffect(() => {
    setTimeout(() => {
      getAllFood();
    }, 0);
  }, [refresh, navigation]);

  useEffect(() => {
    if (refresh) {
      getAllFood();
    }
  }, [refresh]);

  const getUserRecipes = async () => {
    try {
      const q = query(
        collection(db, "Recipes"),
        where("userEmail", "==", user?.email)
      );
      const querySnapshot = await getDocs(q);
      const recipes = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.id.localeCompare(a.id));
      setRecipesList(recipes);
    } catch (error) {
      console.error("Error getting recipes:", error);
    }
  };

  const getUserIngredients = async () => {
    try {
      const q = query(
        collection(db, "Ingredients"),
        where("userEmail", "==", user?.email)
      );
      const querySnapshot = await getDocs(q);
      const ingredients = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.id.localeCompare(a.id));
      setIngredientsList(ingredients);
    } catch (error) {
      console.error("Error getting ingredients:", error);
    }
  };

  const getUserProducts = async () => {
    try {
      const q = query(
        collection(db, "Products"),
        where("userEmail", "==", user?.email)
      );
      const querySnapshot = await getDocs(q);
      const products = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.id.localeCompare(a.id));
      setProductsList(products);
    } catch (error) {
      console.error("Error getting products:", error);
    }
  };

  const getAllFood = async () => {
    setIsLoading(true);
    setRecipesList([]);
    setIngredientsList([]);
    setProductsList([]);
    await getUserRecipes("Recipes");
    await getUserIngredients("Ingredients");
    await getUserProducts("Products");
    setIsLoading(false);
  };

  const deleteAllFromSection = async (section) => {
    try {
      const q = query(
        collection(db, section),
        where("userEmail", "==", user?.email)
      );
      const querySnapshot = await getDocs(q);

      Alert.alert(
        "Delete All",
        `Are you sure you want to delete all ${section.toLowerCase()}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Yes, Delete All",
            style: "destructive",
            onPress: async () => {
              const deletePromises = querySnapshot.docs.map((doc) =>
                deleteDoc(doc.ref)
              );
              await Promise.all(deletePromises);

              getAllFood();
            },
          },
        ]
      );
    } catch (error) {
      console.error(`Error deleting ${section}:`, error);
      Alert.alert("Error", `Failed to delete ${section.toLowerCase()}`);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => {
      const newState = {
        ...prev,
        [section]: !prev[section],
      };
      
      // 更新动画高度
      const newHeight = newState[section] ? 
        (Object.values(newState).filter(Boolean).length === 1 ? 500 : 300) : 
        80;
      
      animatedHeights[section].value = newHeight;
      
      return newState;
    });
  };

  // 在Recipes和Ingredients的Animated.View中使用动画样式
  const recipesAnimatedStyle = getAnimatedStyle("Recipes");
  const ingredientsAnimatedStyle = getAnimatedStyle("Ingredients");

  const getContainerHeight = (section) => {
    const expandedCount =
      Object.values(expandedSections).filter(Boolean).length;
    const availableSections = Object.keys(expandedSections).filter((key) => {
      switch (key) {
        case "Recipes":
          return recipesList.length > 0;
        case "Ingredients":
          return ingredientsList.length > 0;
        case "Products":
          return productsList.length > 0;
        default:
          return false;
      }
    }).length;

    if (!expandedSections[section]) return 80;

    const isOnlyExpanded = Object.entries(expandedSections).every(
      ([key, value]) =>
        key === section ? value : !value || !hasDataForSection(key)
    );

    if (isOnlyExpanded) {
      return "75%";
    }

    return "30%";
  };

  const hasDataForSection = (section) => {
    switch (section) {
      case "Recipes":
        return recipesList.length > 0;
      case "Ingredients":
        return ingredientsList.length > 0;
      case "Products":
        return productsList.length > 0;
      default:
        return false;
    }
  };

  const expandedCount = Object.values(expandedSections).filter(Boolean).length;

  const refreshData = async () => {
    await getAllFood();
  };

  return (
    <View
      style={{
        backgroundColor: Colors.WHITE,
        padding: 30,
        height: "100%",
      }}>
      {/* just for testing to go back dw abt this now */}
      {/* <Link
        href="/auth/sign-in"
        style={{
          position: "relative",
          padding: 20,
          marginTop: 20,
        }}>
        <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
      </Link> */}
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "center",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}>
        <TouchableOpacity onPress={getAllFood}>
          <AntDesign name="reload1" size={24} color="black" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 40,
            fontFamily: "myfont-bold",
          }}>
          My Food
        </Text>
        <TouchableOpacity
          onPress={() =>
            alert(
              "Please note, responses aren't always fully accurate\n\n(Powered by spoonacular. spoonacular.com/food-api)"
            )
          }>
          <MaterialCommunityIcons
            name="information"
            size={24}
            color={Colors.BLACK}
          />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", gap: 15 }}>
          <TouchableOpacity onPress={() => router.push("/SearchFood")}>
            <AntDesign name="pluscircle" size={32} color="black" />
          </TouchableOpacity>
        </View>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.BLACK} />
      ) : recipesList.length === 0 &&
        ingredientsList.length === 0 &&
        productsList.length === 0 ? (
        <CreateNewFoodCard />
      ) : (
        <View
          style={{
            marginTop: 30,
            flexDirection: "column",
            justifyContent: "space-between",
            height: "80%",
          }}>
          {/* Recipes */}
          {recipesList.length > 0 && (
            <Animated.View
              style={[
                styles.container,
                recipesAnimatedStyle,
              ]}>
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Recipes</Text>
                  <TouchableOpacity onPress={() => toggleSection("Recipes")}>
                    <AntDesign
                      name={
                        expandedSections.Recipes ? "caretdown" : "caretright"
                      }
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => deleteAllFromSection("Recipes")}>
                  <Feather name="trash-2" size={26} color="red" />
                </TouchableOpacity>
              </View>
              {expandedSections.Recipes && (
                <MyFoodCards
                  title="Recipes"
                  data={recipesList}
                  isExpanded={
                    recipesList.length > 0 &&
                    (Object.keys(expandedSections).filter((key) => {
                      switch (key) {
                        case "Recipes":
                          return recipesList.length > 0;
                        case "Ingredients":
                          return ingredientsList.length > 0;
                        case "Products":
                          return productsList.length > 0;
                        default:
                          return false;
                      }
                    }).length === 1 ||
                      (expandedCount === 1 && expandedSections.Recipes))
                  }
                  onDelete={refreshData}
                />
              )}
            </Animated.View>
          )}

          {/* Ingredients */}
          {ingredientsList.length > 0 && (
            <Animated.View
              style={[
                styles.container,
                ingredientsAnimatedStyle,
              ]}>
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Ingredients</Text>
                  <TouchableOpacity onPress={() => toggleSection("Ingredients")}>
                    <AntDesign
                      name={expandedSections.Ingredients ? "caretdown" : "caretright"}
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => deleteAllFromSection("Ingredients")}>
                  <Feather name="trash-2" size={24} color="red" />
                </TouchableOpacity>
              </View>
              {expandedSections.Ingredients && (
                <MyFoodCards
                  title="Ingredients"
                  data={ingredientsList}
                  isExpanded={
                    ingredientsList.length > 0 &&
                    (Object.keys(expandedSections).filter((key) => {
                      switch (key) {
                        case "Recipes":
                          return recipesList.length > 0;
                        case "Ingredients":
                          return ingredientsList.length > 0;
                        case "Products":
                          return productsList.length > 0;
                        default:
                          return false;
                      }
                    }).length === 1 ||
                      (expandedCount === 1 && expandedSections.Ingredients))
                  }
                  onDelete={refreshData}
                />
              )}
            </Animated.View>
          )}

          {/* Products */}
          {productsList.length > 0 && (
            <Animated.View
              style={[
                styles.container,
                { height: getContainerHeight("Products") },
              ]}>
              <View style={styles.headerContainer}>
                <View style={styles.titleContainer}>
                  <Text style={styles.title}>Products</Text>
                  <TouchableOpacity onPress={() => toggleSection("Products")}>
                    <AntDesign
                      name={
                        expandedSections.Products ? "caretdown" : "caretright"
                      }
                      size={20}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => deleteAllFromSection("Products")}>
                  <Feather name="trash-2" size={24} color="red" />
                </TouchableOpacity>
              </View>
              {expandedSections.Products && (
                <MyFoodCards
                  title="Products"
                  data={productsList}
                  isExpanded={
                    productsList.length > 0 &&
                    (Object.keys(expandedSections).filter((key) => {
                      switch (key) {
                        case "Recipes":
                          return recipesList.length > 0;
                        case "Ingredients":
                          return ingredientsList.length > 0;
                        case "Products":
                          return productsList.length > 0;
                        default:
                          return false;
                      }
                    }).length === 1 ||
                      (expandedCount === 1 && expandedSections.Products))
                  }
                  onDelete={refreshData}
                />
              )}
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: "myfont-bold",
  },
});