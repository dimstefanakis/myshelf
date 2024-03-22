import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, TextInput, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import  MapEvent  from 'react-native-maps';
// Define an interface for your markers
interface MarkerType {
  latitude: number;
  longitude: number;
  key: string;
  title?: string;
}

export default function MapViewScreen() {
  const [markers, setMarkers] = useState<MarkerType[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  // Use MarkerType | null to allow the state to be null when no marker is selected
  const [currentMarker, setCurrentMarker] = useState<MarkerType | null>(null);
  const [markerTitle, setMarkerTitle] = useState<string>('');

  const handleMapPress = (e: MapEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setModalVisible(true);
    setCurrentMarker({
      latitude,
      longitude,
      key: Math.random().toString(),
    });
    setMarkerTitle('');
  };

  const handleMarkerPress = (key: string) => {
    const marker = markers.find(marker => marker.key === key);
    if (marker) {
      setCurrentMarker(marker);
      setMarkerTitle(marker.title || '');
      setModalVisible(true);
      console.log(marker);
    }
  };

  const handleDeleteMarker = () => {
    if (currentMarker) {
      setMarkers(markers => markers.filter(marker => marker.key !== currentMarker.key));
      setCurrentMarker(null); // Clear the current marker
      setModalVisible(false); // Hide the modal

    }
    console.log(currentMarker); // Log to check the current marker
};

  const handleSaveMarker = () => {
    if (currentMarker) {
      setMarkers(prevMarkers => {
        const existingMarkerIndex = prevMarkers.findIndex(marker => marker.key === currentMarker.key);
        if (existingMarkerIndex !== -1) {
          // Edit existing marker
          const updatedMarkers = [...prevMarkers];
          updatedMarkers[existingMarkerIndex] = { ...currentMarker, title: markerTitle };
          return updatedMarkers;
        } else {
          // Add new marker
          return [...prevMarkers, { ...currentMarker, title: markerTitle }];
        }
      });
    }
    setModalVisible(false);
    setCurrentMarker(null);
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} onPress={handleMapPress}>
        {markers.map((marker) => (
          <Marker
            key={marker.key}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.title || "New Marker"}
            onPress={() => handleMarkerPress(marker.key)}
          />
        ))}
      </MapView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              onChangeText={setMarkerTitle}
              value={markerTitle}
              placeholder="Enter marker title"
            />
            <Button onPress={handleSaveMarker} title="Save" />
            <Button onPress={handleDeleteMarker} title="Delete" color="red" />
            <Button onPress={() => setModalVisible(false)} title="Cancel" color="grey" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
});
