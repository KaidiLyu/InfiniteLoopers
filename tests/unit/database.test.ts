// Import Firestore functions and Firestore instance from configuration
import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig"; 

// Mock Firestore functions for unit testing
jest.mock("firebase/firestore", () => ({
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(() => "mockDocRef"), // Mock doc() to always return "mockDocRef"
}));

// Test suite for Firestore database operations
describe("Firebase Firestore Database Tests", () => {
  // Test retrieving user data from Firestore
  test("should get user data from Firestore", async () => {
    // Mock getDoc to resolve with a fake user data
    (getDoc as jest.Mock).mockResolvedValue({
      data: () => ({ name: "John", age: 25 }),
    });

    // Create a document reference
    const docRef = doc(db, "users", "user123");

    // Attempt to get document data
    const userData = await getDoc(docRef);

    // Verify getDoc was called with the mocked document reference
    expect(getDoc).toHaveBeenCalledWith("mockDocRef");

    // Verify that the returned user data matches the mocked data
    expect(userData.data()).toEqual({ name: "John", age: 25 });
  });

  // Test setting user data in Firestore
  test("should set user data in Firestore", async () => {
    // Create a document reference
    const docRef = doc(db, "users", "user123");

    // Define new user data to be set
    const newData = { name: "Alice", age: 30 };

    // Attempt to set document data
    await setDoc(docRef, newData);

    // Verify setDoc was called with the mocked document reference and the new data
    expect(setDoc).toHaveBeenCalledWith("mockDocRef", newData);
  });
});
