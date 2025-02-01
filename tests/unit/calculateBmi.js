// app/utils/calculateBmi.js
export function calculateBmi(weightKg, heightM) {
    if (heightM === 0) {
      throw new Error("Height cannot be zero");
    }
    const bmi = weightKg / (heightM * heightM);
    return Number(bmi.toFixed(2));
  }
  