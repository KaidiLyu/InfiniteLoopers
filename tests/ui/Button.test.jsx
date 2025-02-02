import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TouchableOpacity, Text } from 'react-native';

const CustomButton = ({ onPress, title }) => (
  <TouchableOpacity onPress={onPress}>
    <Text>{title}</Text>
  </TouchableOpacity>
);

describe('CustomButton', () => {
  it('renders correctly and handles press', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <CustomButton onPress={mockOnPress} title="Test Button" />
    );

    const button = getByText('Test Button');
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
}); 
