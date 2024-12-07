import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;
const NUMBER = process.env.EXPO_PUBLIC_SPOONACULAR_AUTOCOMPLETE_AMOUNT;

export const getRecipe = async (id) => {
  try {
    const now = performance.now();
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/card?apiKey=${API_KEY}`
    );
    const then = performance.now();
    const time = then - now;
    return response.data.url;
  } catch (error) {
    console.error("Error fetching recipe:", error);
    throw error;
  }
};
