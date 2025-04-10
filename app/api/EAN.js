import axios from "axios";

const EANDATA_KEYCODE = process.env.EXPO_PUBLIC_EAN_API_KEY;

const eandataApi = axios.create({
  baseURL: "https://eandata.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getProductByUPCFromEandata = async (upc) => {
  try {
    const response = await eandataApi.post("/feed/", {
      v: "3",
      keycode: EANDATA_KEYCODE,
      mode: "json",
      find: upc,
      prettyjson: 1,
    });
    console.log(response);
    return response.data;
  } catch (error) {
    console.error(
      "EAN Data UPC Lookup API Error:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
