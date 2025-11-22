import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialIcons } from "@expo/vector-icons";

export default function CalibrationPhaseScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);

  const [weight1, setWeight1] = useState("");
  const [weight2, setWeight2] = useState("");

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      const picture = await cameraRef.current.takePictureAsync();
      setPhoto(picture.uri);
    }
  };

  const handleCalibrate = () => {
    // Later send image + weight1 + weight2 to server
    // For now, simply navigate
    navigation.navigate("ProcessTransactionScreen");
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calibration Phase</Text>
        <View style={{ width: 26 }} />
      </View>

          <ScrollView
              contentContainerStyle={{ paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >

      {/* CAMERA BOX */}
      <View style={styles.cameraBox}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.capturedImage} />
        ) : (
          <CameraView style={styles.camera} facing="back" ref={cameraRef} />
        )}
      </View>

      {/* CAPTURE BUTTON */}
      <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
        <MaterialIcons name="photo-camera" size={22} color="#fff" />
        <Text style={styles.captureText}>Capture</Text>
      </TouchableOpacity>

      {/* Fetch Weight */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Fetch Weight"
          style={styles.input}
          keyboardType="numeric"
          value={weight1}
          onChangeText={setWeight1}
        />
        <Text style={styles.gmText}>kg</Text>
      </View>

      {/* WEIGHT INPUT */}
      <View style={styles.inputBox}>
        <TextInput
          placeholder="Enter Weight"
          style={styles.input}
          keyboardType="numeric"
          value={weight2}
          onChangeText={setWeight2}
        />
        <Text style={styles.gmText}>kg</Text>
      </View>

      {/* CALIBRATE BUTTON */}
      <TouchableOpacity style={styles.calibrateBtn} onPress={handleCalibrate}>
        <Text style={styles.calibrateText}>Calibrate</Text>
      </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ----------------- STYLES -----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: "#fff",
    marginHorizontal: -20,
    paddingHorizontal: 20,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2563eb",
  },

  cameraBox: {
    width: "100%",
    height: 280,
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 18,
  },

  camera: {
    flex: 1,
  },

  capturedImage: {
    width: "100%",
    height: "100%",
  },

  captureBtn: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 15,
  },

  captureText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 15,
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },

  gmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },

  calibrateBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 25,
  },

  calibrateText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
