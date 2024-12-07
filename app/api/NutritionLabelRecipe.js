import axios from "axios";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY;

export const getNutritionLabel = async (id) => {
  console.log("Getting nutrition label for recipe id:", id);

  try {
    // Make API call to fetch the PNG as binary data
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/nutritionLabel.png?`,
      {
        params: {
          apiKey: API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    // Convert binary response to base64
    const base64Data = Buffer.from(response.data, "binary").toString("base64");

    // Use FileSystem.documentDirectory to get a writable location
    const filePath = `${FileSystem.documentDirectory}nutrition_label_${id}.png`;

    // Save the base64 data as a file
    await FileSystem.writeAsStringAsync(filePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    console.log("File saved at:", filePath);
    return filePath;
  } catch (error) {
    console.error("Error fetching nutrition label:", error);
    throw error;
  }
};
