// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Image,
// } from "react-native";
// import { Colors } from "../../constants/Colors";
// // Import the correct API function
// import { searchRecipesComplex } from "../api/SearchRecipes";
// import { useRouter } from "expo-router"; // Import useRouter for navigation

// export default function RecipeSearch() {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const router = useRouter(); // Initialize router

//   const handleSearch = async () => {
//     if (!query) return;
//     setLoading(true);
//     setError(null);
//     setResults([]);
//     try {
//       // Use the complex search API function
//       const response = await searchRecipesComplex(query);
//       // Assuming the API returns results in response.results
//       // Check the actual structure from Spoonacular docs / API function
//       setResults(response.results || []);
//     } catch (err) {
//       console.error("Recipe search error:", err);
//       setError("Failed to fetch recipes. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const navigateToRecipeDetails = (recipe) => {
//     // Navigate to a new screen for recipe details/analysis
//     // Pass necessary recipe data (e.g., ID) as params
//     router.push({
//       pathname: "/search-info/RecipeDetails", // Define this route
//       params: {
//         recipeId: recipe.id,
//         recipeTitle: recipe.title,
//         // You might want to pass the whole recipe object if it's not too large
//         // recipeData: JSON.stringify(recipe)
//       },
//     });
//   };

//   const renderRecipeItem = ({ item }) => (
//     <TouchableOpacity
//       style={styles.itemContainer}
//       // onPress={() => navigateToRecipeDetails(item)} // TODO: Implement navigation
//       onPress={() => navigateToRecipeDetails(item)} // Enable navigation
//     >
//       {item.image && (
//         <Image source={{ uri: item.image }} style={styles.itemImage} />
//       )}
//       <Text style={styles.itemTitle}>{item.title}</Text>
//       {/* TODO: Add button/link for nutrition info/analysis */}
//     </TouchableOpacity>
//   );

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}>
//       <View style={styles.innerContainer}>
//         <Text style={styles.header}>Recipe Search</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Search recipes (e.g., vegan pasta)"
//           placeholderTextColor={Colors.GRAY}
//           value={query}
//           onChangeText={setQuery}
//           onSubmitEditing={handleSearch}
//         />
//         <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//           <Text style={styles.searchButtonText}>Search</Text>
//         </TouchableOpacity>

//         {loading && <ActivityIndicator size="large" color={Colors.BLACK} />}
//         {error && <Text style={styles.errorText}>{error}</Text>}

//         <FlatList
//           data={results}
//           renderItem={renderRecipeItem}
//           keyExtractor={(item) => item.id.toString()} // Ensure ID is string
//           style={styles.list}
//           ListEmptyComponent={() =>
//             !loading && <Text style={styles.emptyText}>No recipes found.</Text>
//           }
//         />
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.WHITE,
//   },
//   innerContainer: {
//     flex: 1,
//     padding: 15,
//     paddingTop: 70, // Adjust as needed for status bar/notch
//   },
//   header: {
//     fontSize: 28,
//     fontFamily: "myfont-bold",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   input: {
//     fontFamily: "myfont",
//     fontSize: 18,
//     borderWidth: 1,
//     borderColor: Colors.LIGHT_GRAY,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 15,
//     backgroundColor: Colors.WHITE,
//   },
//   searchButton: {
//     backgroundColor: Colors.BLACK,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   searchButtonText: {
//     color: Colors.WHITE,
//     fontFamily: "myfont-bold",
//     fontSize: 16,
//   },
//   list: {
//     flex: 1,
//   },
//   itemContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.LIGHT_GRAY,
//   },
//   itemImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 15,
//   },
//   itemTitle: {
//     fontFamily: "myfont",
//     fontSize: 16,
//     flex: 1, // Allow text to wrap
//   },
//   errorText: {
//     color: "red",
//     textAlign: "center",
//     marginBottom: 10,
//     fontFamily: "myfont",
//   },
//   emptyText: {
//     textAlign: "center",
//     marginTop: 20,
//     color: Colors.GRAY,
//     fontFamily: "myfont",
//   },
// });
