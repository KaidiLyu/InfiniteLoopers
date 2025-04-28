// Import axios for making HTTP requests
import axios from "axios";

// Load Nutritionix API credentials from environment variables
const NUTRITIONIX_APP_ID = process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.EXPO_PUBLIC_NUTRITIONIX_API_KEY;

// Create an axios instance pre-configured for Nutritionix API
const nutritionixApi = axios.create({
  baseURL: "https://trackapi.nutritionix.com/v2",
  headers: {
    "x-app-id": NUTRITIONIX_APP_ID,
    "x-app-key": NUTRITIONIX_API_KEY,
    "Content-Type": "application/json",
  },
});

// Get search results for food items based on user query
export const searchFoodItems = async (query) => {
  try {
    // Send GET request to Nutritionix search endpoint
    const response = await nutritionixApi.get(`/search/instant?query=${query}`);
    return response.data;
  } catch (error) {
    // Log and re-throw error if request fails
    console.error(
      "Nutritionix Search API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Get detailed nutritional information for a specific food item
export const getFoodItemNutrition = async (foodName) => {
  try {
    // Send POST request to Nutritionix nutrients endpoint with the food name
    const response = await nutritionixApi.post("/natural/nutrients", {
      query: foodName,
    });
    return response.data;
  } catch (error) {
    // Log and re-throw error if request fails
    console.error(
      "Nutritionix Nutrients API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Provides enhanced natural language search by combining different Nutritionix endpoints
export const getNaturalLanguageNutrition = async (query) => {
  try {
    // First, fetch initial search results for the query
    const searchResults = await searchFoodItems(query);
    
    // Then, directly fetch natural language nutrition results for the same query
    const directResponse = await nutritionixApi.post("/natural/nutrients", {
      query: query,
    });
    
    // Start building combined results list with foods from direct response
    let combinedFoods = [...(directResponse.data.foods || [])].map(food => ({
      ...food,
      serving_qty: 0  // Initialize serving quantity to 0
    }));
    
    // Create a Set to track food names already added (case insensitive)
    const existingNames = new Set(combinedFoods.map(food => food.food_name.toLowerCase()));
    
    // Process common foods from search results if available
    if (searchResults.common && searchResults.common.length > 0) {
      for (const item of searchResults.common) {
        if (!existingNames.has(item.food_name.toLowerCase())) {
          try {
            // Fetch detailed nutrition information for each common food
            const itemDetails = await getFoodItemNutrition(item.food_name);
            if (itemDetails.foods && itemDetails.foods.length > 0) {
              // Add the first food result, with serving quantity initialized to 0
              const foodWithZeroQty = {
                ...itemDetails.foods[0],
                serving_qty: 0
              };
              combinedFoods.push(foodWithZeroQty);
              existingNames.add(item.food_name.toLowerCase());
            }
          } catch (itemError) {
            // Warn if fetching individual food item fails
            console.warn(`Could not fetch details for ${item.food_name}:`, itemError);
          }
        }
      }
    }
    
    // Limit the combined results to the first 10 items to avoid overloading
    combinedFoods = combinedFoods.slice(0, 10);
    
    return { foods: combinedFoods };
  } catch (error) {
    // Log and re-throw error if any step fails
    console.error(
      "Enhanced Nutritionix API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
