import axios from "axios";

const VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY;

export const identifyFoodImage = async (base64Image) => {
    try{
        const start = performance.now();
        const response = await axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
            {
                requests: [
                    {
                        image: { content: base64Image },
                        features: [{ type: "LABEL_DETECTION", maxResults: 3 }],
                    },
                ],
            }
        );
        const time = performance.now() - start;
        const label = response.data?.responses?.[0]?.labelAnnotations?.[0]?.description;

        console.log("Identified label: ", label);
        return { label, time };
    } catch (error) {
        console.error("Error identifying food: ", label);
        throw error;
    }
};