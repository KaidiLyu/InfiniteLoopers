// tests/behavior/CounterScreen.test.js
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CounterScreen from "../../app/screens/CounterScreen";

describe("CounterScreen behavior test", () => {
it("increments counter when button is pressed", () => {
// Render component
const { getByText, getByTestId } = render(<CounterScreen />);

// Initial state assertion
const counterText = getByTestId("counterText");
expect(counterText.props.children).toEqual(["Count: ", 0]);

// Find the button and simulate a click
const incrementButton = getByText("Increment");
fireEvent.press(incrementButton);

// Assert again
expect(counterText.props.children).toEqual(["Count: ", 1]);
});
});