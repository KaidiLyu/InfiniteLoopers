import axios from "axios";
import Constants from "expo-constants"; // Use expo-constants for environment variables

const API_KEY = Constants.expoConfig.extra.SPOONACULAR_API_KEY;
const NUMBER = Constants.expoConfig.extra.SPOONACULAR_AUTOCOMPLETE_AMOUNT || 5; // Default to 5 if not set
const RESULTS_PER_PAGE = 10; // Number of results for complex search

// Renamed original function for clarity
export const autoCompleteRecipeTitles = async (text) => {
  const query = text;
  try {
    // Use autocomplete endpoint
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/autocomplete`,
      {
        params: {
          query: query,
          number: NUMBER,
          apiKey: API_KEY,
        },
      }
    );
    let formattedData = response.data.map((item) => ({
      id: item.id,
      title: item.title,
    }));
    return { data: formattedData };
  } catch (error) {
    console.error("Error fetching recipe autocomplete:", error);
    throw error;
  }
};


export const searchRecipesComplex = async (query, options = {}) => {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch`,
      {
        params: {
          query: query,
          apiKey: API_KEY,
          number: RESULTS_PER_PAGE,
          addRecipeInformation: true,
          addRecipeNutrition: true,
          fillIngredients: true,
          ...options,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching complex recipes:", error);
    throw error;
  }
};
