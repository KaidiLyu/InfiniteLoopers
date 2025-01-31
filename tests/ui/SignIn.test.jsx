import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignIn from '../../app/auth/sign-in';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Mock necessary dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

jest.mock('../../contexts/PlatformContext', () => ({
  usePlatform: () => ({
    isAndroid: true,
    isIOS: false,
    isWeb: false,
  }),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn()
}));

describe('SignIn Component User Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows user to enter credentials and submit', async () => {
    const { getByPlaceholderText, getByText } = render(<SignIn />);
    
    // Find input fields
    const emailInput = getByPlaceholderText('Enter Your Email');
    const passwordInput = getByPlaceholderText('Enter Password');
    
    // Simulate user typing
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    // Find and press submit button
    const submitButton = getByText('Submit');
    fireEvent.press(submitButton);
    
    // Verify that sign in was attempted
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });
  });

  it('shows error message when fields are empty', async () => {
    const { getByText } = render(<SignIn />);
    
    // Try to submit without entering credentials
    const submitButton = getByText('Submit');
    fireEvent.press(submitButton);
    
    // Verify error message appears
    await waitFor(() => {
      expect(getByText('Please fill all fields.')).toBeTruthy();
    });
  });
}); 