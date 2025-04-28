/**
 * Recipe Nutrition Label API Module
 * 
 * This module provides functionality to fetch nutrition label images for recipes
 * from the Spoonacular API and save them to the device's local storage.
 * The nutrition labels display detailed nutritional information for recipes in a
 * standardized format similar to packaged food labels.
 */
import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

// Spoonacular API authentication key
const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;

/**
 * Fetches a nutrition label image for a recipe and saves it locally
 * 
 * This function retrieves a PNG nutrition label from the Spoonacular API for a given
 * recipe ID, converts it to base64, and saves it to the device's file system for
 * display within the application.
 * 
 * @param {string|number} id - The Spoonacular recipe ID
 * @returns {Promise<string>} - Local file path to the saved nutrition label image
 * @throws {Error} - If the API request fails or the file cannot be saved
 */
export const getNutritionLabel = async (id) => {
  console.log("Getting nutrition label for recipe id:", id);

  try {
    // Make API call to fetch the PNG as binary data
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/nutritionLabel.png?`,
      {
        params: {
          apiKey: API_KEY,
        },
        responseType: "arraybuffer", // Specify that we expect binary data
      }
    );

    // Convert binary response to base64
    const base64Data = Buffer.from(response.data, "binary").toString("base64");

    // Use FileSystem.documentDirectory to get a writable location
    const filePath = `${FileSystem.documentDirectory}nutrition_label_${id}.png`;

    // Save the base64 data as a file
    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("File saved at:", filePath);
    return filePath;
  } catch (error) {
    // Log error details for debugging
    console.error("Error fetching nutrition label:", error);
    throw error;
  }
};
