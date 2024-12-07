import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;
const NUMBER = process.env.EXPO_PUBLIC_SPOONACULAR_AUTOCOMPLETE_AMOUNT;

export const autoCompleteRecipes = async (text) => {
  const query = text;
  console.log("query: ", query);

  try {
    const now = performance.now();
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/autocomplete?query=${query}&number=${NUMBER}&apiKey=${API_KEY}`
    );
    const then = performance.now();
    const time = then - now;
    let newArray = response.data.map((item) => {
      return {
        id: item.id,
        name: item.title,
        image: `https://spoonacular.com/recipeImages/${item.id}-312x231.${item.imageType}`,
      };
    });
    console.log("newArray: ", newArray);
    return { data: newArray, time };
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};
