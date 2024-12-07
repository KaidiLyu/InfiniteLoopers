import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;
const NUMBER = process.env.EXPO_PUBLIC_SPOONACULAR_AUTOCOMPLETE_AMOUNT;

export const autoCompleteIngredients = async (text) => {
  const query = text;
  console.log("query: ", query);

  try {
    const now = performance.now();
    const response = await axios.get(
      `https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=${NUMBER}&metaInformation=true&apiKey=${API_KEY}`
    );
    const then = performance.now();
    const time = then - now;
    let newArray = response.data.map((item) => {
      return { id: item.id, name: item.name, image: item.image };
    });
    console.log("newArray: ", newArray);
    return { data: newArray, time };
  } catch (error) {
    console.error("Error fetching ingredients:", error);
    throw error;
  }
};

// NUtritionIX Autocomplete API implementation

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

// // Create debounced version of search function
// const debouncedSearch = debounce(searchFood, 300);

// // Export for use in HTML
// window.searchFood = debouncedSearch;
