import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../configs/FirebaseConfig";
import { Colors } from "../../constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    savedFoods: 0,
    recipes: 0,
    products: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const currentUser = auth.currentUser;
    setUser(currentUser);
    if (currentUser) {
      fetchUserStats(currentUser.uid);
    }
  }, []);

  const fetchUserStats = async (userId) => {
    try {
      const savedFoodsQuery = query(
        collection(db, "savedFoods"),
        where("userId", "==", userId)
      );
      const savedFoodsSnapshot = await getDocs(savedFoodsQuery);

      const recipesQuery = query(
        collection(db, "recipes"),
        where("userId", "==", userId)
      );
      const recipesSnapshot = await getDocs(recipesQuery);

      const productsQuery = query(
        collection(db, "products"),
        where("userId", "==", userId)
      );
      const productsSnapshot = await getDocs(productsQuery);

      setStats({
        savedFoods: savedFoodsSnapshot.size,
        recipes: recipesSnapshot.size,
        products: productsSnapshot.size,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace("auth/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toSettings = () => {
    router.push("components/Settings");
  }

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

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{user.displayName || "User"}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.savedFoods}</Text>
            <Text style={styles.statLabel}>Saved Foods</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.recipes + 2}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.products}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.settingsButton} onPress={toSettings}>
          <MaterialCommunityIcons
          name="cog"
          size={24}
          color = {Colors.WHITE}
          />
          <Text style={styles.settingsText}>
            Settings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialCommunityIcons
            name="logout"
            size={24}
            color={Colors.WHITE}
          />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <Text
        style={{
          textAlign: "center",
          color: Colors.GRAY,
          marginTop: "60%",
          fontSize: 12,
        }}>
        Please note, responses aren't always fully accurate
      </Text>
      <Text
        style={{
          textAlign: "center",
          color: Colors.GRAY,
          fontSize: 10,
        }}>
        (Powered by spoonacular. spoonacular.com/food-api)
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
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: "myfont-bold",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 18,
    fontFamily: "myfont",
    textAlign: "center",
    marginTop: 50,
  },
  profileCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 20,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 2,
    borderColor: Colors.BLACK,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.GRAY,
  },
  infoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontFamily: "myfont-bold",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    fontFamily: "myfont",
    color: Colors.GRAY,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.GRAY,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "myfont-bold",
  },
  statLabel: {
    fontSize: 14,
    fontFamily: "myfont",
    color: Colors.GRAY,
  },
  settingsButton: {
    backgroundColor: Colors.BLACK,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  signOutText: {
    color: Colors.WHITE,
    fontFamily: "myfont-bold",
    fontSize: 16,
    marginLeft: 10,
  },
  settingsText:{
    color: Colors.WHITE,
    fontFamily: "myfont-bold",
    fontSize: 16,
    marginLeft: 10,
  }
});
