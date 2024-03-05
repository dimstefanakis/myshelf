import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef } from "react";
import { useNavigation } from "expo-router";

const CameraComponent = () => {
  const [type, setType] = useState(CameraType.back);
  const [hasPermission, setHasPermission] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
    const cameraRef = useRef(null);
    const navigation = useNavigation();

const handleCapture = async () => {
  if (cameraRef.current) {
    const options = { quality: 0.5, base64: true, skipProcessing: true };
    const data = await cameraRef?.current?.takePictureAsync(options);
    setCapturedImage(data.uri);
    navigation.navigate("modalContent/index", { imageUri: data.uri });
    console.log(data.uri);
  }
};

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const toggleCameraType = () => {
    setType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (hasPermission === null) {
    return (
      <View>
        <Text>Requesting for camera permission...</Text>
      </View>
    );
  }
  if (hasPermission === false) {
    return (
      <View>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type} ref={
        cameraRef
      }>
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          {/* Flip Camera Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 40, // Adjust top as needed
              right: 20, // Adjust right as needed
              backgroundColor: "white",
              padding: 10,
              borderRadius: 5,
            }}
            onPress={toggleCameraType}
          >
              
              <MaterialIcons
                name="flip-camera-ios"
                size={24}
                color="black"
              />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 40, // Adjust bottom as needed
              alignSelf: "center",
              backgroundColor: "white",
              padding: 20,
              borderRadius: 50, // Makes it circular
            }}
            onPress={() => {
                handleCapture();
            }}
          >
            <Text style={{ fontSize: 18, color: "black" }}>Capture</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

export default CameraComponent;
