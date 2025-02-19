import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View} from "react-native";
import React, { useState } from "react";
import { Colors } from "../constants/Colors";
import { useNavigation } from "expo-router";
import { updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { auth } from "../configs/FirebaseConfig";

export default function UpdateProfile() {
    const [ name, setName ] = useState(user?.displayName || "");
    const [ email, setEmail ] = useState(user?.email || "");
    const [ password, setPassword ] = useState("");
    const navigation = useNavigation();
    const user = auth.currentUser;

    const updateUserProfile = async () => {
        try {
            if(!user) {
                Alert.alert("Error. There is no current user");
                return;
            }
            if(name && name !== user.displayName) {
                await updateProfile(user, { displayName: name });
            }
            if (email && email !== user.email) {
                await updateEmail(user, email);
            }
            if (password) {
                await updatePassword(user, password);
            }
            Alert.alert("Your profile has been successfully updated")
            navigation.goBack();
        } catch (error) {
            Alert.alert("Error, could not update your profile");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                Name
            </Text>
            <TextInput
            placeholder="Enter New Name"
            style={styles.inputForm}
            value={name}
            onChangeText={setName}
            />

            <Text style={styles.label}>
                Email
            </Text>
            <TextInput
                placeholder="Enter New Email"
                style={styles.inputForm}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
            />

            <Text style={styles.label}>
                Password
            </Text>
            <TextInput
                placeholder="Enter New Password"
                style={styles.inputForm}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.buttons} onPress={updateUserProfile}>
                <Text style={styles.buttonText}>
                    Update Profile
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttons} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>
                    Back
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.WHITE,
        flex: 1,
        padding: 20,
    },
    label: {
        fontFamily: "myfont-bold",
        marginLeft: 10,
    },
    inputForm: {
        borderColor: Colors.GRAY,
        borderRadius: 5,
        borderWidth: 1,
        marginBottom: 15,
        padding: 10,
    },
    buttons: {
        alignItems: "Center",
        backgroundColor: Colors.BLACK,
        borderRadius: 10,
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
        padding: 15,
    },
    buttonText: {
        color: Colors.WHITE,
        fontFamily: "myfont-bold",
        fontSize: 16,
        marginLeft: 10,
    },
});