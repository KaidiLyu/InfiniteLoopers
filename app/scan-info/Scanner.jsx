import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Linking, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';

export default function Scanner({ onScan }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  // Check and request camera permission
  const requestCameraPermission = async () => {
    try {
      const { status: currentStatus } = await Camera.getCameraPermissionsAsync();
      
      // If no permission or permission is "only this time", request again
      if (currentStatus !== 'granted') {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        
        if (status !== 'granted') {
          // If user denies permission, show prompt
          Alert.alert(
            'Camera Permission Required',
            'To scan barcodes, we need access to your camera. Please enable camera access in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  if (Platform.OS === 'ios') {
                    Linking.openURL('app-settings:');
                  } else {
                    Linking.openSettings();
                  }
                }
              }
            ]
          );
        }
      } else {
        setHasPermission(true);
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setHasPermission(false);
    }
  };

  // Check permission when component loads
  useEffect(() => {
    requestCameraPermission();
    
    // Recheck permission every time component gains focus
    const checkPermissionOnFocus = () => {
      requestCameraPermission();
    };
    
    // Add focus listener
    const unsubscribe = navigation.addListener('focus', checkPermissionOnFocus);
    
    return () => {
      unsubscribe();
    };
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    onScan(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={requestCameraPermission}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={Camera.Constants.Type.back}
        barCodeScannerSettings={{
          barCodeTypes: [BarCodeScanner.Constants.BarCodeType.upc_a],
        }}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}>
        <View style={styles.overlay}>
          <Text style={styles.scanText}>
            Scan a barcode to view product details
          </Text>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BLACK,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: Colors.WHITE,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  text: {
    color: Colors.WHITE,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 40,
  },
  retryButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'myfont-medium',
  },
}); 