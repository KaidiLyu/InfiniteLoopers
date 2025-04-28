import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import * as ImagePicker from "expo-image-picker";
import { auth, db, storage } from "../../configs/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Profile Component
 * 
 * Displays the user's profile information and statistics.
 * Features:
 * - Profile picture management
 * - User achievement statistics
 * - Navigation to settings
 * - Sign out functionality
 */
export default function Profile() {
  // State for user profile and statistics
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    savedFoods: 0,
    recipes: 0,
    products: 0,
  });
  const router = useRouter();

  // Request permissions and set up user on component mount
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera roll permissions are needed to update your profile picture."
        );
      }
    })();

    const currentUser = auth.currentUser;
    setUser(currentUser);
  }, []);

  // Fetch updated user statistics when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        fetchUserStats(currentUser.uid);
      }
      return () => {
        // Clean up function (if needed)
      };
    }, [])
  );

  /**
   * Fetches user statistics from Firestore
   * Includes goal achievements, days logged, and meals saved
   * Also retrieves the user's calorie goal and today's intake
   * 
   * @param {string} userId - The user's Firebase UID
   */
  const fetchUserStats = async (userId) => {
    try {
      const savedFoodsSnapshot = await getDocs(
        query(collection(db, "goalsMet"), where("userId", "==", userId))
      );
      const recipesSnapshot = await getDocs(
        query(collection(db, "daysLogged"), where("userId", "==", userId))
      );
      const productsSnapshot = await getDocs(
        query(collection(db, "mealsSaved"), where("userId", "==", userId))
      );
      
      // Get the latest calorie goal data
      const userGoalDocRef = query(
        collection(db, "userCalorieGoals"), 
        where("userId", "==", userId)
      );
      const userGoalSnapshot = await getDocs(userGoalDocRef);
      
      let calorieGoal = 2000; // default value
      if (!userGoalSnapshot.empty) {
        const goalData = userGoalSnapshot.docs[0].data();
        calorieGoal = goalData.calorieGoal || 2000;
      }
      
      // Get today's date string
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const todayString = `${year}-${month}-${day}`;
      
      // Check your calorie intake today
      const todayTrackerQuery = query(
        collection(db, "dailyTracker"),
        where("userId", "==", userId),
        where("date", "==", todayString)
      );
      
      const todayTrackerSnapshot = await getDocs(todayTrackerQuery);
      
      // Calculate total calories for today
      let todayTotalCalories = 0;
      todayTrackerSnapshot.forEach((doc) => {
        const item = doc.data();
        const servingQty = item.servingQty || 0;
        todayTotalCalories += (item.calories || 0) * servingQty;
      });
      
      setStats({
        savedFoods: savedFoodsSnapshot.size,
        recipes: recipesSnapshot.size,
        products: productsSnapshot.size,
        todayCalories: todayTotalCalories,
        calorieGoal: calorieGoal,
      });
      
      console.log("Stats updated, meals saved count:", productsSnapshot.size);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  /**
   * Opens the image picker to select a profile picture
   * Uploads the selected image to Firebase Storage
   * Updates the user's profile with the new image URL
   */
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;
        
        // Create a unique file path for storage
        const fileRef = ref(storage, `profileImages/${auth.currentUser.uid}/${Date.now()}.jpg`);
        
        // Get image data
        const response = await fetch(selectedImageUri);
        const blob = await response.blob();
        
        // Uploading to Firebase Storage
        await uploadBytes(fileRef, blob);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(fileRef);
        
        // Update User Profile
        await updateProfile(auth.currentUser, { photoURL: downloadURL });
        
        // Update local status
        setUser({ ...user, photoURL: downloadURL });
        
        Alert.alert("success", "Profile picture updated");
      }
    } catch (error) {
      console.error("Error updating profile picture", error);
      Alert.alert("mistake", "Error updating profile picture");
    }
  };

  /**
   * Signs the user out and navigates to the sign-in screen
   */
  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace("auth/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  /**
   * Navigates to the settings screen
   */
  const toSettings = () => {
    router.push("/settings");
  };

  // Display loading state if user data is not available
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage}>
          <View style={styles.avatarContainer}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons
                  name="account"
                  size={60}
                  color={Colors.GRAY}
                />
              </View>
            )}
          </View>
          <View style={styles.editIconContainer}>
            <MaterialCommunityIcons name="pencil" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.displayName || "User"}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.savedFoods}x</Text>
            <Text style={styles.statLabel}>Calorie goal met</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.recipes + 1} day(s)</Text>
            <Text style={styles.statLabel}>Log in streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.products}x</Text>
            <Text style={styles.statLabel}>Meals saved</Text>
          </View>
        </View>
        
        {stats.todayCalories > 0 && (
          <View style={styles.calorieStatus}>
            <Text style={styles.calorieStatusText}>
            Ingested today: {stats.todayCalories.toFixed(0)} Calories
            </Text>
            <Text style={[
              styles.calorieStatusGoal,
              stats.todayCalories <= stats.calorieGoal 
                ? styles.calorieStatusGood 
                : styles.calorieStatusBad
            ]}>
              {stats.todayCalories <= stats.calorieGoal 
                ? `Distance to target ${(stats.calorieGoal - stats.todayCalories).toFixed(0)} Calories` 
                : `Exceeding Target ${(stats.todayCalories - stats.calorieGoal).toFixed(0)} Calories!`}
            </Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.goalButton} onPress={() => router.push("/CalorieGoal")}>
          <MaterialCommunityIcons name="target" size={24} color="#fff" />
          <Text style={styles.goalText}>Set Calorie Goal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsButton} onPress={toSettings}>
          <MaterialCommunityIcons name="cog" size={24} color="#fff" />
          <Text style={styles.settingsText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.noteText}>
        Please note, responses aren't always fully accurate
      </Text>
      <Text style={styles.poweredText}>
        (Powered by Nutritionix @nutritionix.com)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: "myfont-bold",
    textAlign: "center",
    color: Colors.BLACK,
  },
  loadingText: {
    fontSize: 18,
    fontFamily: "myfont",
    textAlign: "center",
    marginTop: 50,
  },
  profileCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  avatarWrapper: {
    alignSelf: "center",
    position: "relative",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  avatarPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  editIconContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: Colors.BLACK,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontFamily: "myfont",
    color: Colors.GRAY,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.GRAY,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "myfont",
    color: Colors.GRAY,
  },
  goalButton: {
    backgroundColor: Colors.BLACK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  goalText: {
    color: "#fff",
    fontFamily: "myfont-bold",
    fontSize: 16,
    marginLeft: 10,
  },
  settingsButton: {
    backgroundColor: Colors.BLACK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  settingsText: {
    color: "#fff",
    fontFamily: "myfont-bold",
    fontSize: 16,
    marginLeft: 10,
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  signOutText: {
    color: "#fff",
    fontFamily: "myfont-bold",
    fontSize: 16,
    marginLeft: 10,
  },
  noteText: {
    textAlign: "center",
    color: Colors.GRAY,
    marginTop: 40,
    fontSize: 12,
  },
  poweredText: {
    textAlign: "center",
    color: Colors.GRAY,
    fontSize: 10,
    marginTop: 5,
  },
  calorieStatus: {
    backgroundColor: Colors.EXTRA_LIGHT_GRAY,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  calorieStatusText: {
    fontFamily: "myfont-medium",
    fontSize: 16,
    marginBottom: 5,
  },
  calorieStatusGoal: {
    fontFamily: "myfont-bold",
    fontSize: 14,
  },
  calorieStatusGood: {
    color: Colors.GREEN,
  },
  calorieStatusBad: {
    color: Colors.RED,
  },
});
