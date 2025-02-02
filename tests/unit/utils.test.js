// A simple test tool function
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

describe('Utils', () => {
  describe('validateEmail', () => {
    test('validates correct email format', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid.email')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
    });
  });
}); 
