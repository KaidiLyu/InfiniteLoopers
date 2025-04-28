import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, Text } from 'react-native';

// Define a simple custom button component with onPress and title props
const CustomButton = ({ onPress, title }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{title}</Text>
  </TouchableOpacity>
);

// Test suite for CustomButton component
describe('CustomButton', () => {
  it('renders correctly and handles press', () => {
    // Create a mock function to test if onPress is called
    const mockOnPress = jest.fn();

    // Render the CustomButton with test props
    const { getByText } = render(
      <CustomButton onPress={mockOnPress} title="Test Button" />
    );

    // Find the button by its text content
    const button = getByText('Test Button');

    // Assert that the button is rendered
    expect(button).toBeTruthy();

    // Simulate a press event on the button
    fireEvent.press(button);

    // Assert that the mockOnPress function was called exactly once
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
