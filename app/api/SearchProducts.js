import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;
const NUMBER = process.env.EXPO_PUBLIC_SPOONACULAR_AUTOCOMPLETE_AMOUNT;

export const autoCompleteProducts = async (text) => {
  const query = text;
  console.log("query: ", query);

  try {
    const now = performance.now();
    const response = await axios.get(
      `https://api.spoonacular.com/food/products/suggest?query=${query}&number=${NUMBER}&apiKey=${API_KEY}`
    );
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
    return { data: newArray, time };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
