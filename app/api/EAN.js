/**
 * EAN/UPC Product Lookup API Module
 * 
 * This module provides functionality to look up product information using EAN or UPC barcodes
 * via the EANdata.com API service. This serves as an alternative to the Nutritionix API
 * for barcode scanning, potentially offering broader product coverage.
 */
import axios from "axios";

// API key for authentication with the EANdata.com service
const EANDATA_KEYCODE = process.env.EXPO_PUBLIC_EAN_API_KEY;

/**
 * Create an axios instance configured for EANdata API requests
 * with the appropriate base URL and default headers
 */
const eandataApi = axios.create({
  baseURL: "https://eandata.com",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch product information using a UPC/EAN barcode from the EANdata API
 * 
 * This function sends a POST request to the EANdata feed endpoint with the 
 * provided barcode and returns the product information if found.
 * 
 * @param {string} upc - The Universal Product Code or European Article Number (barcode)
 * @returns {Promise<Object>} - The product data from EANdata API
 * @throws {Error} - If the API request fails or the product is not found
 */
export const getProductByUPCFromEandata = async (upc) => {
  try {
    // Send API request with required parameters
    const response = await eandataApi.post("/feed/", {
      v: "3",                // API version
      keycode: EANDATA_KEYCODE, // Authentication key
      mode: "json",          // Response format
      find: upc,             // Barcode to look up
      prettyjson: 1,         // Format JSON for readability
    });
    console.log(response);
    return response.data;
  } catch (error) {
    // Log detailed error information for debugging
    console.error(
      "EAN Data UPC Lookup API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
