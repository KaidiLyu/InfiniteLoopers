/**
 * Root App Component
 * 
 * This component serves as the entry point for the application.
 * It handles authentication state and redirects users appropriately:
 * - Authenticated users are redirected to the SearchFood screen
 * - Unauthenticated users are shown the Login component
 */
import { Text, View } from "react-native";
import Login from "./../components/Login";
import { auth } from "../configs/FirebaseConfig";
import { Redirect } from "expo-router";

export default function Index() {
  // Check if a user is currently authenticated
  const user = auth.currentUser;

  return (
    <View
      style={{
        flex: 1,
      }}>
      {/* Conditional rendering based on authentication state */}
      {user ? <Redirect href={"/SearchFood"} /> : <Login />}
    </View>
  );
}
