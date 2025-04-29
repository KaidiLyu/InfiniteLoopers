// Import axios and the getRecipe API function
import axios from "axios";
import { getRecipe } from "../../app/api/GetRecipe";

// Mock axios for testing
jest.mock("axios");

// Suppress console.error output during tests
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

// Restore original console.error after tests
afterAll(() => {
  console.error.mockRestore();
});

// Test successful API call for getRecipe
test("getRecipe should call Spoonacular API and return the recipe URL", async () => {
  const mockResponse = { data: { url: "https://mock-recipe.com/recipe123" } };

  // Mock axios.get to resolve with a mock response
  axios.get.mockResolvedValue(mockResponse);

  // Call getRecipe with a mock ID
  const recipeUrl = await getRecipe(123); 

  // Verify axios.get was called with correct URL
  expect(axios.get).toHaveBeenCalledWith(
    "https://api.spoonacular.com/recipes/123/card?apiKey=undefined" 
  );

  // Verify the returned URL matches the mock response
  expect(recipeUrl).toBe("https://mock-recipe.com/recipe123");
});

// Test API call failure handling in getRecipe
test("getRecipe should throw an error on API failure", async () => {
  // Mock axios.get to reject with an error
  axios.get.mockRejectedValue(new Error("API error")); 

  // Expect getRecipe to throw the same error
  await expect(getRecipe(999)).rejects.toThrow("API error");
});
