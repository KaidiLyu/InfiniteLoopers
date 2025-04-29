/**
 * Nutritionix UPC Scanner API Module
 * 
 * This module provides functionality to query the Nutritionix API for product information
 * using Universal Product Codes (UPC/barcodes). It allows users to retrieve detailed
 * nutritional information by scanning product barcodes.
 */
import axios from "axios";

// Nutritionix API credentials required for authentication
const NUTRITIONIX_APP_ID = process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.EXPO_PUBLIC_NUTRITIONIX_API_KEY;

/**
 * Configured axios instance for Nutritionix API requests
 * Pre-configured with base URL and authentication headers
 * for simplified API calls throughout the application
 */
const nutritionixApi = axios.create({
  baseURL: "https://trackapi.nutritionix.com/v2",
  headers: {
    "x-app-id": NUTRITIONIX_APP_ID,
    "x-app-key": NUTRITIONIX_API_KEY,
  },
});

/**
 * Retrieves product information from Nutritionix API using a UPC barcode
 * 
 * This function queries the Nutritionix database to find nutritional information
 * for products identified by their barcode. This is used in the barcode scanning
 * feature of the application.
 * 
 * @param {string} upc - The Universal Product Code (barcode number)
 * @returns {Promise<Object>} - The product data including nutritional information
 * @throws {Error} - If the product is not found or API request fails
 */
export const getProductByUPC = async (upc) => {
  try {
    // Query the Nutritionix API with the provided UPC
    console.log("-.-.-.-.-.-.-.-.-.-.-.-.-.-." + upc + "-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-")
    const response = await nutritionixApi.get("/search/item", {
      params: {
        upc: upc,
      },
    });
    console.log(response);
    return response.data;
  } catch (error) {
    // Log detailed error information for debugging purposes
    console.error(
      "Nutritionix UPC Lookup API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

