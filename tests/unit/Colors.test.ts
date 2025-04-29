// Import the Colors constants from the project
import { Colors } from '../../constants/Colors';

// Test suite for the Colors constants
describe('Colors constants', () => {
  // Test basic individual color constants
  test('should have correct basic colors', () => {
    expect(Colors.WHITE).toBe('#fff');
    expect(Colors.BLACK).toBe('#000');
    expect(Colors.GRAY).toBe('#78866B');
    expect(Colors.DARK_GRAY).toBe('#11181C');
    expect(Colors.BUTTON_GREEN).toBe('#73C913');
  });

  // Test colors for the light theme
  test('should have light theme colors', () => {
    expect(Colors.light.text).toBe('#11181C');
    expect(Colors.light.background).toBe('#fff');
    expect(Colors.light.icon).toBe('#687076');
  });

  // Test colors for the dark theme
  test('should have dark theme colors', () => {
    expect(Colors.dark.text).toBe('#ECEDEE');
    expect(Colors.dark.background).toBe('#151718');
    expect(Colors.dark.icon).toBe('#9BA1A6');
  });
});
