import React from "react";
import { StyleSheet } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { View, Text, Button } from "@/components/Themed";

function GoalTrackerScreen() {
  const completed = 50;
  const total = 100;
  const percentage = (completed / total) * 100;

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={200}
        width={2}
        fill={percentage}
        tintColor="#5A6978"
        backgroundColor="#b4cbcf"
        arcSweepAngle={260}
        rotation={230}
      >
        {(fill) => (
          <View style={{ alignItems: "center" }}>
            <Text style={styles.points}>
              {completed}/{total}
            </Text>
            <Text>pages</Text>
          </View>
        )}
      </AnimatedCircularProgress>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>

      <Button style={{ marginTop: 30 }}>
        <Text style={{ color: "white" }}>Update progress</Text>
      </Button>
      <View style={{ flexDirection: "row" }}>
        <Button style={{ marginTop: 30, marginRight: 10 }}>
          <Text style={{ color: "white" }}>View history</Text>
        </Button>
        <Button style={{ marginTop: 30 }}>
          <Text style={{ color: "white" }}>Edit goals</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  points: {
    textAlign: "center",
    color: "#507C82",
    fontSize: 24,
    fontWeight: "bold",
  },
  progressBarContainer: {
    width: "80%",
    height: 20,
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: -40,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#5A6978",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#5A6978",
    borderRadius: 10,
  },
});

export default GoalTrackerScreen;
