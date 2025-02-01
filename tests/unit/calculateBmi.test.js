// tests/unit/calculateBmi.test.js
import { calculateBmi } from "../../app/utils/calculateBmi";

describe("calculateBmi function", () => {
  it("correctly calculates BMI for normal data", () => {
    const result = calculateBmi(60, 1.7); // 60kg, 1.7m
    expect(result).toBeCloseTo(20.76, 2);
  });

  it("throws error when height is zero", () => {
    expect(() => calculateBmi(60, 0)).toThrow("Height cannot be zero");
  });

  it("handles numeric rounding properly", () => {
    const result = calculateBmi(72.8, 1.82);
    // e.g. 72.8 / (1.82 * 1.82) = 21.98...
    expect(result).toBeCloseTo(21.98, 2);
  });
});
