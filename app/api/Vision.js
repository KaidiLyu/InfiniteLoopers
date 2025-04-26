import axios from "axios";

const VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;

export const identifyFoodImage = async (base64Image) => {
  try {
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
      {
        requests: [
          {
            image: { content: base64Image },
            features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
          },
        ],
      }
    );

    const labels = response.data?.responses?.[0]?.labelAnnotations?.map(
      (label) => label.description
    );

    console.log("Identified labels: ", labels);

    return { labels };
  } catch (error) {
    console.error("Error identifying food: ", error?.response?.data || error.message);
    throw error;
  }
};