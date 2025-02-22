import axios from "axios";
import { getRecipe } from "../../app/api/GetRecipe";

jest.mock("axios");

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

test("getRecipe should call Spoonacular API and return the recipe URL", async () => {
  const mockResponse = { data: { url: "https://mock-recipe.com/recipe123" } };

  axios.get.mockResolvedValue(mockResponse);

  const recipeUrl = await getRecipe(123); 
  expect(axios.get).toHaveBeenCalledWith(
    "https://api.spoonacular.com/recipes/123/card?apiKey=undefined" 
  );
  expect(recipeUrl).toBe("https://mock-recipe.com/recipe123");
});

test("getRecipe should throw an error on API failure", async () => {
  axios.get.mockRejectedValue(new Error("API error")); 

  await expect(getRecipe(999)).rejects.toThrow("API error");
});
