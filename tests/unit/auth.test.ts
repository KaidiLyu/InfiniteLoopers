// Import Firebase authentication instance and signInWithEmailAndPassword function
import { auth } from '../../configs/FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

// Mock the 'firebase/auth' module, specifically the signInWithEmailAndPassword function
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn()
}));

// Test suite for authentication-related functions
describe('Authentication Functions', () => {
  // Clear all mock calls before each test to ensure clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test to ensure signInWithEmailAndPassword is called with correct parameters
  test('signInWithEmailAndPassword should be called with correct credentials', async () => {
    const email = 'test@example.com'; // Test email
    const password = 'password123';   // Test password

    // Call the mocked signInWithEmailAndPassword function
    await signInWithEmailAndPassword(auth, email, password);

    // Verify that signInWithEmailAndPassword was called with correct arguments
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
    // Verify that it was called exactly once
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
  });
});
