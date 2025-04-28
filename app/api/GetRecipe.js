/**
 * Recipe Card Retrieval API Module
 * 
 * This module provides functionality to retrieve recipe cards from the Spoonacular API.
 * It fetches visual recipe cards that contain cooking instructions and ingredients
 * for a specified recipe ID.
 */
import axios from "axios";

// Spoonacular API credentials and configuration
const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;
const NUMBER = process.env.EXPO_PUBLIC_SPOONACULAR_AUTOCOMPLETE_AMOUNT;

/**
 * Fetches a recipe card image URL from Spoonacular by recipe ID
 * 
 * This function makes a GET request to the Spoonacular API to retrieve
 * a visual recipe card containing cooking instructions and ingredients.
 * It also measures the performance time of the API request.
 * 
 * @param {string|number} id - The Spoonacular recipe ID to fetch
 * @returns {Promise<string>} - URL to the recipe card image
 * @throws {Error} - If the request fails or the recipe isn't found
 */
export const getRecipe = async (id) => {
  try {
    // Start timing the API request
    const now = performance.now();
    
    // Make the API request to Spoonacular for the recipe card
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/card?apiKey=${API_KEY}`
    );
    
    // End timing and calculate duration
    const then = performance.now();
    const time = then - now;
    
    // Return only the URL to the recipe card image
    return response.data.url;
  } catch (error) {
    // Log detailed error information for debugging
    console.error("Error fetching recipe:", error);
    throw error;
  }
};
