import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import { Colors } from '../constants/Colors';
import { useRouter } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Settings() {
  const router = useRouter();
}

const SettingsList = [
  { name: 'Personal Information', screen: 'PersonalInfo' },
  { name: 'Notifications', screen: 'Notifs'},
  { name: 'Privacy Policy', screen: 'PrivacyPolicy'},
  { name: 'FAQs', screen: 'Questions'},
  { name: 'Delete Account', screen: 'DeleteAccount'},
];

return(
  <View style={styles.container}>
    {SettingsList.map((option, index) => (
      <TouchableOpacity
      key = {index}
      style={styles.button}
      onPress={() => router.push(option.screen)}
      >
      <Text style={styles.buttonText}>
        {option.name}
      </Text>
      <AntDesign name="right" size={20} color={Colors.WHITE} style={styles.icon} />
      </TouchableOpacity>
    
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor = Colors.BLACK,
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'myfont-medium',
    color: Colors.WHITE,
  },
  icon:{
    alignSelf: 'center',
  },
});