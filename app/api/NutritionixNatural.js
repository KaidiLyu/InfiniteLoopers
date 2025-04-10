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

export const getNaturalLanguageNutrition = async (query) => {
  try {
    const response = await nutritionixApi.post("/natural/nutrients", {
      query: query,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Nutritionix Natural Language API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}; 