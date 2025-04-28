/**
 * Ingredient Search API Module
 * 
 * This module provides functionality to search for food ingredients using the Spoonacular API.
 * It allows for autocomplete search of ingredient names and returns relevant ingredient data
 * including IDs and images. The module also contains commented-out alternative implementation
 * using the Nutritionix API which could be used in the future.
 */
import axios from "axios";

// Spoonacular API configuration
const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;  // API authentication key
const NUMBER = process.env.EXPO_PUBLIC_SPOONACULAR_AUTOCOMPLETE_AMOUNT;  // Maximum number of results to return

/**
 * Performs an autocomplete search for ingredients based on user input
 * 
 * This function queries the Spoonacular API with partial text input to get matching
 * ingredient suggestions. It also measures and returns the API response time for performance tracking.
 * 
 * @param {string} text - The partial ingredient name to search for
 * @returns {Promise<Object>} - Object containing matched ingredients and query time
 * @throws {Error} - If the API request fails
 */
export const autoCompleteIngredients = async (text) => {
  const query = text;
  console.log("query: ", query);

  try {
    // Start performance timing
    const now = performance.now();
    
    // Make the API request to Spoonacular's ingredient autocomplete endpoint
    const response = await axios.get(
      `https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=${NUMBER}&metaInformation=true&apiKey=${API_KEY}`
    );
    
    // End performance timing
    const then = performance.now();
    const time = then - now;
    
    // Extract and format only the needed fields from the response
    let newArray = response.data.map((item) => {
      return { id: item.id, name: item.name, image: item.image };
    });
    console.log("newArray: ", newArray);
    
    // Return the formatted data and query time
    return { data: newArray, time };
  } catch (error) {
    // Log error for debugging
    console.error("Error fetching ingredients:", error);
    throw error;
  }
};

/**
 * ALTERNATIVE IMPLEMENTATION (Currently Disabled)
 * 
 * Below is an alternative implementation using the Nutritionix API instead of Spoonacular.
 * This code is currently commented out but maintained as a potential fallback or future option.
 * It includes debouncing for efficient real-time search and duplicate filtering.
 */

// Debounce function to limit API calls during rapid user input
// function debounce(func, wait) {
//   let timeout;
//   return function executedFunction(...args) {
//     const later = () => {
//       clearTimeout(timeout);
//       func(...args);
//     };
//     clearTimeout(timeout);
//     timeout = setTimeout(later, wait);
//   };
// }

// Search function using Nutritionix API
// function searchFood(query) {
//   if (query.length < 3) return;

//   const options = {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       "x-app-id": "2918f543",
//       "x-app-key": "771da5f70d73ffd3d9c82d172d7f8fb3",
//     },
//   };

//   fetch(
//     `https://trackapi.nutritionix.com/v2/search/instant/?query=${query}`,
//     options
//   )
//     .then((response) => response.json())
//     .then((data) => {
//       console.log("Searching for food...");
//       console.log(data);
//       const uniqueCommonFoods = filterDuplicates(data.common);
//       const event = new CustomEvent("searchResults", {
//         detail: { common: uniqueCommonFoods, branded: data.branded },
//       });
//       window.dispatchEvent(event);
//     })
//     .catch((error) => console.error("Error:", error));
// }

// Helper function to remove duplicate food items
// function filterDuplicates(foods) {
//   const seen = new Set();
//   return foods.filter((food) => {
//     if (food.tag_id && !seen.has(food.tag_id)) {
//       seen.add(food.tag_id);
//       return true;
//     }
//     return false;
//   });
// }

// Create debounced version of search function to improve performance
// const debouncedSearch = debounce(searchFood, 300);

// Export for use in HTML/web context
// window.searchFood = debouncedSearch;
