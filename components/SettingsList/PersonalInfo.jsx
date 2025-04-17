import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Colors } from "../../constants/Colors";
import { useNavigation } from "expo-router";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  // verifyBeforeUpdateEmail,
  // applyActionCode,
} from "firebase/auth";
import { auth } from "../../configs/FirebaseConfig";

export default function UpdateProfile() {
  const user = auth.currentUser;
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const updateUserProfile = async () => {
    try {
      if (!user) {
        Alert.alert("Error. There is no current user");
        return;
      }
      if (
        name.trim() === user?.displayName &&
        email.trim() === user?.email &&
        password.trim() === ""
      ) {
        Alert.alert("No changes detected", "One or more fields are the same as before.");
        return;
      }
      if (name && name !== user.displayName) {
        await updateProfile(user, { displayName: name });
      }
      if (email && email !== user.email) {
        await updateEmail(user, email);
        // add these later
        // await verifyBeforeUpdateEmail(user, email);
        // await applyActionCode(auth, code);
      }
      if (password) {
        await updatePassword(user, password);
      }
      Alert.alert("Your profile has been successfully updated");
      navigation.goBack();
    } catch (error) {
      console.log(error);
      Alert.alert("Error, could not update your profile");
    }
  };

  const canUpdate = name.trim() !== "" || email.trim() !== "" || password.trim() !== "";

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Update Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Enter New Name"
          style={styles.inputForm}
          value={name}
          onChangeText={setName}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter New Email"
          style={styles.inputForm}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter New Password"
          style={styles.inputForm}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.button, !canUpdate && styles.disabledButton]}
          onPress={updateUserProfile}
          disabled={!canUpdate}>
          <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.note}>
        Please ensure your information is accurate
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  header: {
    fontSize: 32,
    fontFamily: "myfont-bold",
    textAlign: "center",
    marginBottom: 40,
    marginTop: "10%",
    color: Colors.BLACK,
  },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontFamily: "myfont-bold",
    color: Colors.BLACK,
    marginBottom: 5,
  },
  inputForm: {
    borderWidth: 1,
    borderColor: Colors.GRAY,
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: Colors.WHITE,
  },
  button: {
    backgroundColor: Colors.BLACK,
    borderRadius: 15,
    paddingVertical: 15,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: Colors.WHITE,
    fontFamily: "myfont-bold",
    fontSize: 18,
  },
  disabledButton: {
    backgroundColor: Colors.GRAY
  },
  note: {
    textAlign: "center",
    color: Colors.GRAY,
    fontSize: 12,
    marginTop: 10,
  },
});