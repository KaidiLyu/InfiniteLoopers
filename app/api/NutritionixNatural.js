import axios from "axios";

const NUTRITIONIX_APP_ID = process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.EXPO_PUBLIC_NUTRITIONIX_API_KEY;

const nutritionixApi = axios.create({
  baseURL: "https://trackapi.nutritionix.com/v2",
  headers: {
    "x-app-id": NUTRITIONIX_APP_ID,
    "x-app-key": NUTRITIONIX_API_KEY,
    "Content-Type": "application/json",
  },
});

// Get search results
export const searchFoodItems = async (query) => {
  try {
    const response = await nutritionixApi.get(`/search/instant?query=${query}`);
    return response.data;
  } catch (error) {
    console.error(
      "Nutritionix Search API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Get nutritional information for specific foods
export const getFoodItemNutrition = async (foodName) => {
  try {
    const response = await nutritionixApi.post("/natural/nutrients", {
      query: foodName,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Nutritionix Nutrients API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

// Provides enhanced natural language search
export const getNaturalLanguageNutrition = async (query) => {
  try {
    // First get a list of matching food items
    const searchResults = await searchFoodItems(query);
    
    // Prioritize direct natural language query results
    const directResponse = await nutritionixApi.post("/natural/nutrients", {
      query: query,
    });
    
    let combinedFoods = [...(directResponse.data.foods || [])];
    
    // Add common food items to avoid duplication
    const existingNames = new Set(combinedFoods.map(food => food.food_name.toLowerCase()));
    
    // Processing General Food
    if (searchResults.common && searchResults.common.length > 0) {
      for (const item of searchResults.common) {
        if (!existingNames.has(item.food_name.toLowerCase())) {
          try {
            // Get detailed nutritional information for each food item
            const itemDetails = await getFoodItemNutrition(item.food_name);
            if (itemDetails.foods && itemDetails.foods.length > 0) {
              combinedFoods.push(itemDetails.foods[0]);
              existingNames.add(item.food_name.toLowerCase());
            }
          } catch (itemError) {
            console.warn(`Could not fetch details for ${item.food_name}:`, itemError);
          }
        }
      }
    }
    
    // Limit the number of food items returned to avoid excessive requests
    combinedFoods = combinedFoods.slice(0, 10);
    
    return { foods: combinedFoods };
  } catch (error) {
    console.error(
      "Enhanced Nutritionix API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};