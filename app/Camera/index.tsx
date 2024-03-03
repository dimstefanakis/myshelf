// CameraComponent.js
import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, CameraType } from 'expo-camera';

const CameraComponent = () => {
  const [type, setType] = useState(CameraType.back);
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  if (hasPermission === null) {
    return <View><Text>Requesting for camera permission...</Text></View>;
  }
  if (hasPermission === false) {
    return <View><Text>No access to camera</Text></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera style={{ flex: 1 }} type={type}>
        <View style={{ flex: 1, backgroundColor: "transparent", flexDirection: "row", justifyContent: "center" }}>
          <TouchableOpacity
            style={{
              alignSelf: "flex-end",
              alignItems: "center",
              backgroundColor: "white",
              margin: 20,
              padding: 10,
              borderRadius: 5,
            }}
            onPress={toggleCameraType}>
            <Text style={{ fontSize: 18, color: "black" }}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
};

export default CameraComponent;
