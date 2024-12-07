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
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigation, useRouter } from "expo-router";
import { Colors } from "../../constants/Colors";
import { FontAwesome6 } from "@expo/vector-icons";
import { autoCompleteIngredients } from "../api/SearchIngredients";
import { autoCompleteProducts } from "../api/SearchProducts";
import { autoCompleteRecipes } from "../api/SearchRecipes";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { auth, db } from "../../configs/FirebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function SearchFood() {
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [title, setTitle] = useState("");
  const [finalTitle, setFinalTitle] = useState("");
  const [selected, setSelected] = useState(false);
  const [formattedResults, setFormattedResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState("");
  const [selectedResultName, setSelectedResultName] = useState("");
  const [selectedResultImage, setSelectedResultImage] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [apiResults, setApiResults] = useState([]);
  const textInputRef = useRef();
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("");

  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    textInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (apiResults) {
      console.log("apiResults updated: ", apiResults);
      console.log("Current title: ", title);
    }
  }, [apiResults, title]);

  const showSearchAndTitle = (title) => {
    if (!selected) {
      setSelected(true);
    }
    setTitle(title);
    setFormattedResults([]);

    setTimeout(() => {
      textInputRef.current?.focus();
    }, 0);
  };

  const checkInfo = async (text) => {
    if (text.length < 3) {
      setFormattedResults([]);
      return;
    }
    console.log("text: ", text);
    if (text.length >= 3) {
      try {
        if (title === "Ingredients") {
          const result = await autoCompleteIngredients(text);
          setFormattedResults(result.data);
        } else if (title === "Products") {
          const result = await autoCompleteProducts(text);
          setFormattedResults(result.data);
          console.log("result: ", result);
        } else if (title === "Recipes") {
          const result = await autoCompleteRecipes(text);
          setFormattedResults(result.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const handleSelect = (itemId, itemName, itemImage, item, title) => {
    setSelectedResult(itemId);
    setSelectedResultName(itemName);
    setSelectedResultImage(itemImage);
    setApiResults(item);
    setSelectedTitle(title);
    setSelectedItemType(title);
  };

  const findNutritionInfo = async () => {
    try {
      console.log("Selected Title:", selectedTitle);
      console.log("Exact JSON object:", apiResults);
      const finalResults = JSON.parse(JSON.stringify(apiResults));
      console.log("finalResults: ", finalResults);

      const docId = Date.now().toString();
      await setDoc(doc(db, selectedTitle, docId), {
        userEmail: user.email,
        results: finalResults,
        title: selectedTitle,
      });

      console.log("Document successfully written!-----------------------");

      router.push({
        pathname: "/search-info/NutritionInfo",
        params: {
          title: selectedTitle,
          id: selectedResult,
          name: selectedResultName,
          image: selectedResultImage,
        },
      });
      // router.push("/"); // REMOVE THIS AFTER *******
    } catch (error) {
      console.error("Error writing document: ", error);
      console.log("Document failed to write--------------------------");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.WHITE }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View
        style={{
          flex: 1,
          padding: 15,
          paddingTop: 70,
        }}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/MyFood",
              params: { refresh: Date.now() },
            })
          }
          style={{
            position: "absolute",
            padding: 20,
            marginTop: 20,
          }}>
          <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "myfont-bold",
                textAlign: "center",
              }}>
              Search nutrition info for...
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={() => showSearchAndTitle("Ingredients")}
                style={styles.button}>
                <Image
                  source={require("../../assets/picture/ingredients.png")}
                  style={styles.buttonImage}
                />
                <Text style={styles.buttonText}>Ingredients</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => showSearchAndTitle("Products")}
                style={styles.button}>
                <Image
                  source={require("../../assets/picture/food.png")}
                  style={styles.buttonImage}
                />
                <Text style={styles.buttonText}>Products</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => showSearchAndTitle("Recipes")}
                style={styles.button}>
                <Image
                  source={require("../../assets/picture/recipe.png")}
                  style={styles.buttonImage}
                />
                <Text style={styles.buttonText}>Recipes</Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontFamily: "myfont-bold",
                textAlign: "center",
                marginTop: "5%",
              }}>
              {title}
            </Text>
            {title === "Products" ? (
              <Text
                style={{
                  color: Colors.GRAY,
                  fontSize: 12,
                  fontFamily: "myfont",
                  textAlign: "center",
                }}>
                {"(Products don't have images)"}
              </Text>
            ) : null}
          </View>
          {selected && (
            <>
              <TextInput
                placeholder={`Enter your ${title.toLowerCase()}`}
                placeholderTextColor={Colors.GRAY}
                style={{
                  fontFamily: "myfont",
                  fontSize: 20,
                  borderWidth: 2,
                  borderColor: Colors.BLACK,
                  borderRadius: 12,
                  padding: 12,
                  marginTop: "5%",
                  backgroundColor: Colors.WHITE,
                  shadowColor: Colors.BLACK,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
                ref={textInputRef}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChangeText={(text) => checkInfo(text)}
              />
              {/* Dropdown list */}
              {formattedResults.length > 0 && (
                <FlatList
                  data={formattedResults}
                  keyExtractor={(item) => item.id.toString()}
                  style={[
                    styles.dropdown,
                    {
                      shadowColor: Colors.BLACK,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    },
                  ]}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        selectedResult === item.name && styles.selectedItem,
                      ]}
                      onPress={() =>
                        handleSelect(
                          item.id,
                          item.name,
                          item.image,
                          item,
                          title
                        )
                      }>
                      {item.image ? (
                        <Image
                          source={{
                            uri:
                              title === "Ingredients"
                                ? `https://spoonacular.com/cdn/ingredients_100x100/${item.image}`
                                : item.image,
                          }}
                          style={styles.foodImage}
                        />
                      ) : (
                        <Image
                          source={require("../../assets/picture/noPhoto.png")}
                          style={styles.foodImage}
                        />
                      )}
                      <Text
                        style={styles.dropdownText}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </>
          )}
        </View>
        {selectedResult && (
          <View
            style={{
              padding: isInputFocused ? 10 : 25,
              backgroundColor: Colors.WHITE,
              borderRadius: 10,
              shadowColor: Colors.BLACK,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              marginTop: "auto",
              marginBottom: 10,
              borderWidth: 1,
              borderColor: Colors.BLACK,
              minHeight: isInputFocused ? "auto" : 200,
            }}>
            <View
              style={{
                flexDirection: isInputFocused ? "row" : "column",
                alignItems: "center",
                gap: isInputFocused ? 8 : 15,
              }}>
              <Text
                style={[
                  styles.selectedText,
                  !isInputFocused && { fontSize: 20 },
                  isInputFocused ? { fontSize: 14 } : { textAlign: "center" },
                ]}>
                See Nutrition Info for:
              </Text>
              <Text
                style={[
                  styles.selectedText,
                  isInputFocused ? { fontSize: 14, flex: 1 } : { fontSize: 18 },
                ]}
                numberOfLines={isInputFocused ? 1 : 2}
                ellipsizeMode="tail">
                {selectedResultName}
              </Text>

              {selectedResultImage ? (
                <Image
                  source={{
                    uri:
                      selectedItemType === "Ingredients"
                        ? `https://spoonacular.com/cdn/ingredients_100x100/${selectedResultImage}`
                        : selectedResultImage,
                  }}
                  style={{
                    width: isInputFocused ? 30 : 90,
                    height: isInputFocused ? 30 : 90,
                    borderRadius: isInputFocused ? 15 : 45,
                    marginRight: isInputFocused ? "5%" : 0,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require("../../assets/picture/noPhoto.png")}
                  style={{
                    width: isInputFocused ? 30 : 90,
                    height: isInputFocused ? 30 : 90,
                    borderRadius: isInputFocused ? 15 : 45,
                  }}
                />
              )}

              <TouchableOpacity
                style={{
                  backgroundColor: "#2E7D32",
                  paddingHorizontal: isInputFocused ? 8 : 16,
                  paddingVertical: isInputFocused ? 4 : 10,
                  borderRadius: 8,
                  marginTop: isInputFocused ? 0 : "auto",
                  marginRight: isInputFocused ? 0 : 5,
                }}
                onPress={() => {
                  console.log("Confirmed:", selectedResultName);
                  findNutritionInfo();
                }}>
                <Text
                  style={{
                    color: Colors.WHITE,
                    fontFamily: "myfont-bold",
                    fontSize: isInputFocused ? 12 : 16,
                  }}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.BLACK,
    justifyContent: "center",
    marginTop: "4%",
    paddingHorizontal: "1%",
    paddingVertical: "5%",
    minWidth: "30%",
    alignItems: "center",
  },
  buttonImage: {
    width: 50,
    height: 50,
    alignSelf: "center",
    marginBottom: "10%",
  },
  buttonText: {
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    textAlign: "center",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 10,
    backgroundColor: Colors.WHITE,
    maxHeight: 275,
    marginVertical: 5,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY,
    minHeight: 70,
    backgroundColor: Colors.WHITE,
  },
  selectedItem: {
    backgroundColor: "#d3f8d6",
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: "myfont",
    marginLeft: 10,
    flex: 1,
    color: Colors.BLACK,
  },
  foodImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 5,
  },
  selectedText: {
    fontFamily: "myfont-bold",
    fontSize: 14,
    color: Colors.BLACK,
  },
});
