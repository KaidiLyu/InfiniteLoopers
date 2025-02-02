import { auth } from '../../configs/FirebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn()
}));

describe('Authentication Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('signInWithEmailAndPassword should be called with correct credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    await signInWithEmailAndPassword(auth, email, password);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
    expect(signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
  });
}); 
