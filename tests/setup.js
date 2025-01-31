import 'react-native-gesture-handler/jestSetup';

// Mock the Firebase modules
jest.mock('../../configs/FirebaseConfig', () => ({
  auth: {
    currentUser: {
      email: 'test@test.com'
    }
  },
  db: {}
}));

// Mock other dependencies
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn()
  }),
  useNavigation: () => ({
    setOptions: jest.fn()
  })
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
); 