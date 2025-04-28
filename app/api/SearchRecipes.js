/**
 * Recipe Search API Module
 * 
 * This module provides functionality to search for recipes using the Spoonacular API.
 * It offers two different search approaches:
 * 1. Autocomplete for quick recipe title suggestions
 * 2. Complex search with filtering options for detailed recipe information
 * 
 * This is part of the application's comprehensive food search system.
 */
import axios from "axios";
import Constants from "expo-constants"; // Use expo-constants for environment variables

// Spoonacular API configuration retrieved from Expo constants
const API_KEY = Constants.expoConfig.extra.SPOONACULAR_API_KEY;
const NUMBER = Constants.expoConfig.extra.SPOONACULAR_AUTOCOMPLETE_AMOUNT || 5; // Default to 5 if not set
const RESULTS_PER_PAGE = 10; // Number of results for complex search

/**
 * Performs an autocomplete search for recipe titles based on user input
 * 
 * This function is designed for quick suggestion/typeahead functionality,
 * providing instant recipe title matches as the user types.
 * 
 * @param {string} text - The partial recipe title to search for
 * @returns {Promise<Object>} - Object containing matched recipe titles and IDs
 * @throws {Error} - If the API request fails
 */
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
    // Format the response data to include only necessary fields
    let formattedData = response.data.map((item) => ({
      id: item.id,
      title: item.title,
    }));
    return { data: formattedData };
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching recipe autocomplete:", error);
    throw error;
  }
};

/**
 * Performs a detailed recipe search with extensive filtering options
 * 
 * This function uses Spoonacular's complex search endpoint to find recipes
 * with detailed information including ingredients, nutritional data, and 
 * cooking instructions. It supports various filtering options through the options parameter.
 * 
 * @param {string} query - The recipe search query
 * @param {Object} options - Additional search parameters (diet, intolerances, cuisine, etc.)
 * @returns {Promise<Object>} - Detailed recipe search results
 * @throws {Error} - If the API request fails
 */
export const searchRecipesComplex = async (query, options = {}) => {
  try {
    // Make request to the complex search endpoint with comprehensive parameters
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/complexSearch`,
      {
        params: {
          query: query,
          apiKey: API_KEY,
          number: RESULTS_PER_PAGE,
          addRecipeInformation: true, // Include detailed recipe information
          addRecipeNutrition: true,   // Include nutritional information
          fillIngredients: true,      // Include complete ingredient data
          ...options,                 // Include any additional filtering options
        },
      }
    );
    return response.data;
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching complex recipes:", error);
    throw error;
  }
};
