/**
 * Food Image Recognition API Module
 * 
 * This module provides functionality to identify food items in images 
 * using Google Cloud Vision API's label detection feature.
 * It allows users to take photos of food and receive AI-generated labels
 * describing what's in the image, which can be used for food tracking.
 */
import axios from "axios";

// Google Cloud Vision API authentication key
const VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;

/**
 * Identifies potential food items in an image using Google Cloud Vision API
 * 
 * This function sends a base64-encoded image to the Google Cloud Vision API
 * for label detection, which attempts to identify objects, scenes, and activities
 * in the image. For food tracking purposes, this helps identify what food items
 * are present in a user's photo.
 * 
 * @param {string} base64Image - Base64-encoded image data to analyze
 * @returns {Promise<Object>} - Object containing array of identified labels
 * @throws {Error} - If the API request fails or image cannot be processed
 */
export const identifyFoodImage = async (base64Image) => {
  try {
    // Make API request to Google Cloud Vision with the image data
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "LABEL_DETECTION", maxResults: 5 }], // Request label detection with 5 top results
          },
        ],
      }
    );

    // Extract the label descriptions from the API response
    const labels = response.data?.responses?.[0]?.labelAnnotations?.map(
      (label) => label.description
    );

    // Log identified labels for debugging purposes
    console.log("Identified labels: ", labels);

    // Return the array of labels
    return { labels };
  } catch (error) {
    // Log detailed error information for debugging
    console.error("Error identifying food: ", error?.response?.data || error.message);
    throw error;
  }
};