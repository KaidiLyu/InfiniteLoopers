/**
 * Food Products Search API Module
 * 
 * This module provides functionality to search for food products using the Spoonacular API.
 * It enables autocomplete search of product names and returns relevant product data.
 * This complements the ingredients search functionality for a more comprehensive
 * food search experience within the application.
 */
import axios from "axios";

// Spoonacular API configuration
const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;  // API authentication key
const NUMBER = process.env.EXPO_PUBLIC_SPOONACULAR_AUTOCOMPLETE_AMOUNT;  // Maximum number of results to return

/**
 * Performs an autocomplete search for food products based on user input
 * 
 * This function queries the Spoonacular API with partial text input to get matching
 * product suggestions. It also measures and returns the API response time for performance tracking.
 * Unlike the ingredient search, products don't have images in the suggest endpoint.
 * 
 * @param {string} text - The partial product name to search for
 * @returns {Promise<Object>} - Object containing matched products and query time
 * @throws {Error} - If the API request fails
 */
export const autoCompleteProducts = async (text) => {
  const query = text;
  console.log("query: ", query);

  try {
    // Start performance timing
    const now = performance.now();
    
    // Make the API request to Spoonacular's product suggest endpoint
    const response = await axios.get(
      `https://api.spoonacular.com/food/products/suggest?query=${query}&number=${NUMBER}&apiKey=${API_KEY}`
    );
    
    // End performance timing
    const then = performance.now();
    const time = then - now;

    // The API returns { results: [...] }, so we need to map response.data.results
    let newArray = response.data.results.map((item) => {
      return {
        id: item.id,
        name: item.title,
        // Products don't have images in the suggest endpoint
        image: null,
      };
    });

    console.log("newArray: ", newArray);
    
    // Return the formatted data and query time
    return { data: newArray, time };
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching products:", error);
    throw error;
  }
};
