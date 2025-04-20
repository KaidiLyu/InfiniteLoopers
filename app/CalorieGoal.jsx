import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    Switch,
    Platform,
    Modal,
    FlatList,
  } from "react-native";
  import React, { useState, useEffect } from "react";
  import { useNavigation, useRouter } from "expo-router";
  import { Colors } from "../constants/Colors";
  import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons";
  import { auth, db } from "../configs/FirebaseConfig";
  import { doc, getDoc, setDoc } from "firebase/firestore";
  
  // Gender Options
  const genderOptions = [
    { label: "male", value: "male" },
    { label: "female", value: "female" },
  ];
  
  // Activity Level Options
  const activityOptions = [
    { label: "Sedentary (little to no exercise)", value: "sedentary" },
    { label: "Light activity (exercise 1-3 days a week)", value: "light" },
    { label: "Moderate activity (exercise 3-5 days a week)", value: "moderate" },
    { label: "Active (exercise 6-7 days a week)", value: "active" },
    { label: "Highly active (daily vigorous exercise or physical work)", value: "veryActive" },
  ];
  
  export default function CalorieGoal() {
    const navigation = useNavigation();
    const router = useRouter();
    const user = auth.currentUser;
  
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("male");
    const [genderLabel, setGenderLabel] = useState("male");
    const [activityLevel, setActivityLevel] = useState("moderate");
    const [activityLabel, setActivityLabel] = useState("Moderate activity (exercise 3-5 days a week)");
    const [customGoal, setCustomGoal] = useState("");
    const [useCustomGoal, setUseCustomGoal] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Drop-down menu status
    const [genderModalVisible, setGenderModalVisible] = useState(false);
    const [activityModalVisible, setActivityModalVisible] = useState(false);
  
    // Loading saved data
    useEffect(() => {
      navigation.setOptions({
        headerShown: false,
      });
      
      if (user) {
        loadUserData();
      }
    }, [user]);
  
    const loadUserData = async () => {
      try {
        const userDocRef = doc(db, "userCalorieGoals", user.uid);
        const userSnapshot = await getDoc(userDocRef);
        
        if (userSnapshot.exists()) {
          const data = userSnapshot.data();
          setHeight(data.height?.toString() || "");
          setWeight(data.weight?.toString() || "");
          setAge(data.age?.toString() || "");
          setGender(data.gender || "male");
          setActivityLevel(data.activityLevel || "moderate");
          setCustomGoal(data.customGoal?.toString() || "");
          setUseCustomGoal(data.useCustomGoal || false);
          
          // Setting the label
          const genderOpt = genderOptions.find(opt => opt.value === data.gender);
          if (genderOpt) setGenderLabel(genderOpt.label);
          
          const activityOpt = activityOptions.find(opt => opt.value === data.activityLevel);
          if (activityOpt) setActivityLabel(activityOpt.label);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    // Select Gender
    const selectGender = (option) => {
      setGender(option.value);
      setGenderLabel(option.label);
      setGenderModalVisible(false);
    };
    
    // Select Activity Level
    const selectActivity = (option) => {
      setActivityLevel(option.value);
      setActivityLabel(option.label);
      setActivityModalVisible(false);
    };
  
    // Calculate Basal Metabolic Rate (BMR) - Using the Modified Harris-Benedict Formula
    const calculateBMR = () => {
      if (!height || !weight || !age) return 0;
      
      const h = parseFloat(height);
      const w = parseFloat(weight);
      const a = parseInt(age);
      
      if (isNaN(h) || isNaN(w) || isNaN(a)) return 0;
      
      // Basal metabolic rate calculation
      let bmr = 0;
      if (gender === "male") {
        bmr = 13.397 * w + 4.799 * h - 5.677 * a + 88.362;
      } else {
        bmr = 9.247 * w + 3.098 * h - 4.330 * a + 447.593;
      }
      
      // Adjusts to activity level
      let calorieGoal = 0;
      switch (activityLevel) {
        case "sedentary":
          calorieGoal = bmr * 1.2;
          break;
        case "light":
          calorieGoal = bmr * 1.375;
          break;
        case "moderate":
          calorieGoal = bmr * 1.55;
          break;
        case "active":
          calorieGoal = bmr * 1.725;
          break;
        case "veryActive":
          calorieGoal = bmr * 1.9;
          break;
        default:
          calorieGoal = bmr * 1.55;
      }
      
      return Math.round(calorieGoal);
    };
  
    const saveGoal = async () => {
      if (!user) {
        Alert.alert("Error", "You must be logged in to save your calorie goal");
        return;
      }
      
      if (!useCustomGoal && (!height || !weight || !age)) {
        Alert.alert("Missing Information", "Please fill in all required fields");
        return;
      }
      
      if (useCustomGoal && (!customGoal || isNaN(parseFloat(customGoal)))) {
        Alert.alert("Invalid Goal", "Please enter a valid calorie goal");
        return;
      }
      
      try {
        setLoading(true);
        const userDocRef = doc(db, "userCalorieGoals", user.uid);
        
        // Calculate or use a custom target
        const calorieGoal = useCustomGoal 
          ? parseInt(customGoal) 
          : calculateBMR();
        
        if (calorieGoal <= 0) {
          Alert.alert("Invalid Goal", "Calorie goal must be greater than 0");
          return;
        }
        
        await setDoc(userDocRef, {
          userId: user.uid,
          userEmail: user.email,
          height: parseFloat(height),
          weight: parseFloat(weight),
          age: parseInt(age),
          gender,
          activityLevel,
          calorieGoal,
          customGoal: useCustomGoal ? parseInt(customGoal) : null,
          useCustomGoal,
          updatedAt: new Date()
        });
        
        Alert.alert(
          "Success", 
          `Your daily calorie goal has been set to ${calorieGoal} calories`,
          [{ text: "OK", onPress: () => router.back() }]
        );
      } catch (error) {
        console.error("Error saving calorie goal:", error);
        Alert.alert("Error", "Failed to save your calorie goal");
      } finally {
        setLoading(false);
      }
    };
  
    // Custom drop-down selector
    const renderDropdownSelector = (
      label, 
      value, 
      onPress, 
      backgroundColor = Colors.WHITE
    ) => (
      <TouchableOpacity 
        style={[styles.dropdownSelector, { backgroundColor }]} 
        onPress={onPress}
      >
        <Text style={styles.dropdownText}>{value}</Text>
        <MaterialCommunityIcons name="chevron-down" size={24} color={Colors.GRAY} />
      </TouchableOpacity>
    );
  
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}>
            <FontAwesome6 name="arrow-left" size={24} color={Colors.BLACK} />
          </TouchableOpacity>
          <Text style={styles.title}>Set a calorie goal</Text>
        </View>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>
            {useCustomGoal ? "Custom Targets" : "Calculated based on body data"}
          </Text>
          <Switch
            value={useCustomGoal}
            onValueChange={setUseCustomGoal}
            trackColor={{ false: Colors.LIGHT_GRAY, true: Colors.PRIMARY }}
            thumbColor={Colors.WHITE}
          />
        </View>
        
        {!useCustomGoal ? (
          // Physical data entry form
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Physical information</Text>
            
            <Text style={styles.inputLabel}>height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              placeholder="For example: 170"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="For example: 65"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              placeholder="For example: 25"
              keyboardType="numeric"
            />
            
            <Text style={styles.inputLabel}>gender</Text>
            {renderDropdownSelector("gender", genderLabel, () => setGenderModalVisible(true))}
            
            <Text style={styles.inputLabel}>Activity Level</Text>
            {renderDropdownSelector("Activity Level", activityLabel, () => setActivityModalVisible(true))}
            
            {height && weight && age && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Calculation results:</Text>
                <Text style={styles.resultValue}>{calculateBMR()} Calories/day</Text>
              </View>
            )}
          </View>
        ) : (
          // Custom calorie goal input
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Custom calorie goals</Text>
            <Text style={styles.inputLabel}>Daily calorie goal</Text>
            <TextInput
              style={styles.input}
              value={customGoal}
              onChangeText={setCustomGoal}
              placeholder="For example: 2000"
              keyboardType="numeric"
            />
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveGoal}
          disabled={loading}>
          <Text style={styles.saveButtonText}>Save Target</Text>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About Calorie Goals</Text>
          <Text style={styles.infoText}>
          Your daily calorie goal is calculated based on your height, weight, age, gender, and activity level. This goal represents the number of calories you need to consume each day to maintain your current weight.
          </Text>
          <Text style={styles.infoText}>
          If your actual intake is below your target, you'll be considered on target. You can also set custom goals to meet specific health needs.
          </Text>
        </View>
        
        {/* Gender selection modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={genderModalVisible}
          onRequestClose={() => setGenderModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Gender</Text>
              
              {genderOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    gender === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => selectGender(option)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    gender === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {gender === option.value && (
                    <MaterialCommunityIcons name="check" size={24} color={Colors.WHITE} />
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setGenderModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        
        {/* Active level selection modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={activityModalVisible}
          onRequestClose={() => setActivityModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Activity Level</Text>
              
              {activityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    activityLevel === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => selectActivity(option)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    activityLevel === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {activityLevel === option.value && (
                    <MaterialCommunityIcons name="check" size={24} color={Colors.WHITE} />
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setActivityModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.WHITE,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 40,
      marginBottom: 20,
    },
    backButton: {
      padding: 10,
    },
    title: {
      fontSize: 24,
      fontFamily: "myfont-bold",
      marginLeft: 10,
      flex: 1,
      textAlign: "center",
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
      paddingHorizontal: 10,
      paddingVertical: 15,
      backgroundColor: Colors.EXTRA_LIGHT_GRAY,
      borderRadius: 10,
    },
    switchLabel: {
      fontFamily: "myfont-medium",
      fontSize: 16,
      color: Colors.BLACK,
    },
    formContainer: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: "myfont-bold",
      marginBottom: 15,
      color: Colors.BLACK,
    },
    inputLabel: {
      fontFamily: "myfont-medium",
      fontSize: 15,
      marginBottom: 5,
      color: Colors.GRAY,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors.LIGHT_GRAY,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 16,
      fontFamily: "myfont",
      marginBottom: 15,
    },
    // Dropdown selector style
    dropdownSelector: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors.LIGHT_GRAY,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 15,
    },
    dropdownText: {
      fontSize: 16,
      fontFamily: "myfont",
      color: Colors.BLACK,
    },
    saveButton: {
      backgroundColor: Colors.BLACK,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 10,
      marginBottom: 20,
    },
    saveButtonText: {
      color: Colors.WHITE,
      fontFamily: "myfont-bold",
      fontSize: 18,
    },
    resultContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: Colors.EXTRA_LIGHT_GRAY,
      padding: 15,
      borderRadius: 8,
      marginTop: 10,
    },
    resultLabel: {
      fontFamily: "myfont-medium",
      fontSize: 16,
      color: Colors.BLACK,
    },
    resultValue: {
      fontFamily: "myfont-bold",
      fontSize: 18,
      color: Colors.PRIMARY,
    },
    infoContainer: {
      backgroundColor: Colors.EXTRA_LIGHT_GRAY,
      padding: 15,
      borderRadius: 8,
      marginBottom: 30,
    },
    infoTitle: {
      fontFamily: "myfont-bold",
      fontSize: 16,
      marginBottom: 10,
      color: Colors.BLACK,
    },
    infoText: {
      fontFamily: "myfont",
      fontSize: 14,
      color: Colors.GRAY,
      marginBottom: 8,
      lineHeight: 20,
    },
    // Modal box style
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: '90%',
      backgroundColor: Colors.WHITE,
      borderRadius: 10,
      padding: 20,
      maxHeight: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: "myfont-bold",
      marginBottom: 15,
      textAlign: 'center',
      color: Colors.BLACK,
    },
    modalOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 8,
      marginBottom: 10,
      backgroundColor: Colors.EXTRA_LIGHT_GRAY,
    },
    modalOptionSelected: {
      backgroundColor: Colors.PRIMARY,
    },
    modalOptionText: {
      fontFamily: "myfont",
      fontSize: 16,
      color: Colors.BLACK,
    },
    modalOptionTextSelected: {
      color: Colors.WHITE,
      fontFamily: "myfont-bold",
    },
    modalCancelButton: {
      marginTop: 10,
      padding: 15,
      borderRadius: 8,
      backgroundColor: Colors.LIGHT_GRAY,
      alignItems: 'center',
    },
    modalCancelText: {
      fontFamily: "myfont-bold",
      fontSize: 16,
      color: Colors.BLACK,
    },
  }); 