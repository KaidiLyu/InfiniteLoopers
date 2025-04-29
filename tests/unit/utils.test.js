// A simple test tool function to validate email format
const validateEmail = (email) => {
  // Regular expression to check basic email structure
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Test suite for utility functions
describe('Utils', () => {
  // Test suite specifically for validateEmail function
  describe('validateEmail', () => {
    // Test valid and invalid email formats
    test('validates correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);  // Valid email
      expect(validateEmail('invalid.email')).toBe(false);    // Missing @ and domain
      expect(validateEmail('')).toBe(false);                 // Empty string
      expect(validateEmail('test@.com')).toBe(false);         // Missing domain name
    });
  });
});
