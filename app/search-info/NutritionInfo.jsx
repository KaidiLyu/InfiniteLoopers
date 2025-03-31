import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  Link,
  useNavigation,
  useRouter,
  useLocalSearchParams,
} from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { getNutritionLabel } from "../api/NutritionLabelRecipe";
import { Feather } from "@expo/vector-icons";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../configs/FirebaseConfig";

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function NutritionInfo() {
  const router = useRouter();
  const navigation = useNavigation();
  const { title, id, name, image } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [savedImagePath, setSavedImagePath] = useState(null);
  
  // Zoom and pan states
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  // Create a PanResponder to handle the gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        lastScale.current = scale._value;
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
      },
      onPanResponderMove: (event, gestureState) => {
        // Handling dragging
        translateX.setValue(lastTranslateX.current + gestureState.dx);
        translateY.setValue(lastTranslateY.current + gestureState.dy);
        
        // Handling pinch-to-zoom
        if (event.nativeEvent.changedTouches.length === 2) {
          const touch1 = event.nativeEvent.changedTouches[0];
          const touch2 = event.nativeEvent.changedTouches[1];
          
          // Calculate the distance between two fingers
          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
            Math.pow(touch2.pageY - touch1.pageY, 2)
          );
          
          // Calculate the scale based on the distance
          const newScale = Math.max(0.5, Math.min(3, distance / 150));
          scale.setValue(newScale);
        }
      },
      onPanResponderRelease: () => {
        // If the scale is less than 1, bounce back to 1
        if (scale._value < 1) {
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
          lastScale.current = 1;
        } else {
          lastScale.current = scale._value;
        }
        
        // Update the last position value
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
      }
    })
  ).current;

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
    nutritionLabel();
  }, []);

  const nutritionLabel = async () => {
    try {
      setLoading(true);
      console.log("Getting nutrition label for recipe id:", id);
      const filePath = await getNutritionLabel(id);
      console.log("filePath", filePath);
      setSavedImagePath(filePath);
    } catch (error) {
      console.error("Error getting nutrition label:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Item", `Are you sure you want to delete ${name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, title, id));
            router.back();
            Alert.alert("Success", "Item deleted successfully");
            router.push({
              pathname: "/(tabs)/MyFood",
              params: { refresh: Date.now() },
            });
          } catch (error) {
            console.error("Error deleting item:", error);
            Alert.alert("Error", "Failed to delete item");
          }
        },
      },
    ]);
  };

  // Reset zoom and pan
  const resetZoomPan = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome6 name="circle-arrow-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText} numberOfLines={1}>
          Nutrition label
        </Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Feather name="trash-2" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
      >
        <View style={styles.titleSection}>
          <Text style={styles.itemName}>{name}</Text>
          <Image
            source={{
              uri:
                title === "Recipes"
                  ? image
                  : `https://spoonacular.com/cdn/ingredients_100x100/${image}`,
            }}
            style={styles.itemImage}
          />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Image
              source={require("../../assets/picture/loading-gif.gif")}
              style={styles.loadingImage}
            />
          </View>
        ) : savedImagePath ? (
          <View style={styles.imageViewerContainer}>
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={resetZoomPan}
            >
              <Feather name="refresh-cw" size={22} color="white" />
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            
            <Text style={styles.interactHint}>
              Drag and zoom to view the complete nutrition table
            </Text>
            
            <View style={styles.nutritionImageWrapper} {...panResponder.panHandlers}>
              <Animated.Image
                source={{ uri: savedImagePath }}
                style={[
                  styles.nutritionImage,
                  {
                    transform: [
                      { translateX },
                      { translateY },
                      { scale }
                    ]
                  }
                ]}
                resizeMode="contain"
              />
            </View>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Unable to load nutritional information</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/search-info/Recipe",
              params: { title, id, name, image },
            });
          }}
          style={styles.recipeButton}>
          <Text style={styles.recipeButtonText}>Get This Recipe!</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY,
  },
  headerText: {
    flex: 1,
    fontSize: 20,
    fontFamily: "myfont-bold",
    textAlign: "center",
    marginHorizontal: 10,
  },
  deleteButton: {
    padding: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  itemName: {
    fontSize: 24,
    fontFamily: "myfont-bold",
    textAlign: "center",
    textDecorationLine: "underline",
    marginVertical: 10,
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    marginTop: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  loadingImage: {
    width: 100,
    height: 100,
  },
  imageViewerContainer: {
    width: "100%",
    height: 800,
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  nutritionImageWrapper: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  nutritionImage: {
    width: '100%',
    height: '100%',
  },
  resetButton: {
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetText: {
    color: 'white',
    marginLeft: 5,
    fontFamily: 'myfont',
    fontSize: 14,
  },
  interactHint: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    padding: 8,
    borderRadius: 20,
    zIndex: 10,
    fontFamily: 'myfont',
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    fontFamily: "myfont",
  },
  recipeButton: {
    backgroundColor: "#2E7D32",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 20,
  },
  recipeButtonText: {
    color: Colors.WHITE,
    fontFamily: "myfont-bold",
    textAlign: "center",
    fontSize: 28,
  },
});