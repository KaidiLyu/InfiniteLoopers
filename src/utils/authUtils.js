export const getFriendlyAuthErrorMessage = (error) => {
  if (!error || !error.code) {
    return "An unexpected error occurred. Please try again.";
  }

  console.log("Firebase Auth Error Code:", error.code); // Keep console log for debugging

  switch (error.code) {
    // Sign In Errors
    case "auth/invalid-credential":
    case "auth/invalid-email": // Can happen on sign-in too if format is wrong
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "No account found with this email.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Access temporarily disabled due to too many attempts. Please try again later.";

    // Sign Up Errors
    case "auth/email-already-in-use":
      return "An account already exists with this email address.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    // case 'auth/invalid-email': // Handled above

    // General Errors
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled."; // Should not happen with standard setup

    default:
      return "An unexpected error occurred. Please try again.";
  }
}; 