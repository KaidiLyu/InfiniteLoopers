import { getDoc, setDoc, doc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig"; 

jest.mock("firebase/firestore", () => ({
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(() => "mockDocRef"),
}));

describe("Firebase Firestore Database Tests", () => {
  test("should get user data from Firestore", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      data: () => ({ name: "John", age: 25 }),
    });

    const docRef = doc(db, "users", "user123");
    const userData = await getDoc(docRef);

    expect(getDoc).toHaveBeenCalledWith("mockDocRef");
    expect(userData.data()).toEqual({ name: "John", age: 25 });
  });

  test("should set user data in Firestore", async () => {
    const docRef = doc(db, "users", "user123");
    const newData = { name: "Alice", age: 30 };

    await setDoc(docRef, newData);

    expect(setDoc).toHaveBeenCalledWith("mockDocRef", newData);
  });
});
