import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchFood from '../../app/(tabs)/SearchFood';

// Mock the necessary dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

jest.mock('../../configs/FirebaseConfig', () => ({
  auth: {
    currentUser: {
      email: 'test@test.com',
    },
  },
  db: {},
}));

describe('SearchFood Component', () => {
  it('renders search options correctly', () => {
    const { getByText } = render(<SearchFood />);
    
    expect(getByText('Search nutrition info for...')).toBeTruthy();
    expect(getByText('Ingredients')).toBeTruthy();
    expect(getByText('Products')).toBeTruthy();
    expect(getByText('Recipes')).toBeTruthy();
  });

  it('shows search input when a category is selected', () => {
    const { getByText, getByPlaceholderText } = render(<SearchFood />);
    
    // Click on Ingredients button
    fireEvent.press(getByText('Ingredients'));
    
    // Check if search input appears
    expect(getByPlaceholderText('Enter your ingredients')).toBeTruthy();
  });
}); 