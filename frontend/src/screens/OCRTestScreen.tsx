import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { runOcrOnImage, terminateOcrWorker } from "../ocr/ocrService";
import { parseWeight, formatWeight } from "../ocr/parseWeight";
import { ocrApiService } from "../api/ocrApi";

export default function OCRTestScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>("");
  const [parsedWeight, setParsedWeight] = useState<number | null>(null);
  const [manualWeight, setManualWeight] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [ocrFailed, setOcrFailed] = useState<boolean>(false);

  /**
   * Request permissions and capture image from camera
   */
  const captureImage = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera permissions to take photos.");
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        setOcrText("");
        setParsedWeight(null);
        setManualWeight("");
        setOcrFailed(false);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      Alert.alert("Error", "Failed to capture image");
    }
  };

  /**
   * Request permissions and pick an image from gallery
   */
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera roll permissions to select images.");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        setOcrText("");
        setParsedWeight(null);
        setManualWeight("");
        setOcrFailed(false);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  /**
   * Run OCR on the selected image
   */
  const runOcr = async () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select an image first");
      return;
    }

    setLoading(true);
    setOcrText("");
    setParsedWeight(null);
    setOcrFailed(false);

    try {
      // Run OCR
      const text = await runOcrOnImage(selectedImage);
      
      // Check if OCR failed
      if (text.includes('OCR_UNAVAILABLE')) {
        setOcrFailed(true);
        setOcrText("OCR service unavailable");
        Alert.alert(
          "📝 Manual Entry Required", 
          "Automatic text detection is unavailable. Please enter the weight manually below.",
          [{ text: "OK" }]
        );
        return;
      }
      
      setOcrText(text);
      console.log('🎯 OCR Text set to:', text);

      // Parse weight using enhanced parser
      const weight = parseWeight(text);
      console.log('🎯 Parsed weight result:', weight);
      setParsedWeight(weight);

      if (!weight || weight <= 0) {
        setOcrFailed(true);
        Alert.alert(
          "🔍 Weight Not Found", 
          "Could not detect a valid weight in the text. You can:\n• Try a clearer image with better lighting\n• Enter the weight manually below",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "✅ Weight Detected!", 
          `Found weight: ${weight} kg\n\nOriginal text: "${text.substring(0, 50)}..."\n\nReview and submit, or enter manually if incorrect.`,
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("OCR Error:", error);
      setOcrFailed(true);
      Alert.alert(
        "OCR Failed", 
        "Failed to process image. Please enter the weight manually.",
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Submit the parsed weight to the backend
   */
  const submitWeight = async () => {
    // Use manual weight if OCR failed or user entered one
    const finalWeight = manualWeight ? parseFloat(manualWeight) : parsedWeight;
    
    if (!finalWeight || !selectedImage) {
      Alert.alert("Missing Data", "Please enter a valid weight");
      return;
    }

    setSubmitting(true);

    try {
      const result = await ocrApiService.submitWeight({
        weight: finalWeight,
        imageUri: selectedImage,
        timestamp: new Date().toISOString(),
        rawOcrText: ocrText || "Manual entry",
      });

      if (result.success) {
        Alert.alert("Success", "Weight data submitted successfully!");
        // Reset form
        setSelectedImage(null);
        setOcrText("");
        setParsedWeight(null);
        setManualWeight("");
        setOcrFailed(false);
      } else {
        Alert.alert("Submission Failed", result.message || "Failed to submit data");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      Alert.alert("Error", "An error occurred while submitting data");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Cleanup when component unmounts
   */
  React.useEffect(() => {
    return () => {
      terminateOcrWorker();
    };
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>OCR Weight Detection</Text>
        <Text style={styles.subtitle}>Capture or select an image to extract weight data</Text>

        {/* Instructions */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionTitle}>📸 Photo Tips for Better OCR:</Text>
          <Text style={styles.instructionText}>
            • Good lighting (avoid shadows)
            • Clear, focused image
            • Weight display centered
            • No glare or reflections
          </Text>
        </View>

        {/* Button Container */}
        <View style={styles.buttonRow}>
          {/* Camera Button */}
          <TouchableOpacity style={[styles.button, styles.cameraButton]} onPress={captureImage}>
            <Text style={styles.buttonText}>📷 Capture Photo</Text>
          </TouchableOpacity>

          {/* Gallery Button */}
          <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={pickImage}>
            <Text style={styles.buttonText}>🖼️ Select Image</Text>
          </TouchableOpacity>
        </View>

        {/* Selected Image Preview */}
        {selectedImage && (
          <View style={styles.imageContainer}>
            <Text style={styles.sectionTitle}>Selected Image:</Text>
            <Image source={{ uri: selectedImage }} style={styles.image} />
          </View>
        )}

        {/* Run OCR Button */}
        {selectedImage && !loading && (
          <TouchableOpacity style={styles.button} onPress={runOcr}>
            <Text style={styles.buttonText}>Run OCR</Text>
          </TouchableOpacity>
        )}

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing image...</Text>
            <Text style={styles.loadingSubText}>
              Trying multiple OCR methods for best results
            </Text>
          </View>
        )}

        {/* OCR Results or Manual Entry */}
        {(ocrText || ocrFailed) && !loading && (
          <View style={styles.resultsContainer}>
            {ocrText && (
              <>
                <Text style={styles.sectionTitle}>Raw OCR Text:</Text>
                <View style={styles.textBox}>
                  <Text style={styles.ocrText}>{ocrText || "No text detected"}</Text>
                </View>

                <Text style={styles.sectionTitle}>Parsed Weight:</Text>
                <View style={styles.weightBox}>
                  <Text style={styles.weightText}>
                    {formatWeight(parsedWeight)}
                  </Text>
                </View>
              </>
            )}

            {/* Manual Weight Entry - Always show as option */}
            <View style={styles.manualEntryContainer}>
              <Text style={styles.sectionTitle}>
                {ocrFailed ? "⚠️ Manual Entry Required:" : "📝 Enter Weight Manually:"}
              </Text>
              <TextInput
                style={[
                  styles.input, 
                  ocrFailed && styles.inputRequired
                ]}
                placeholder="Enter weight in kg (e.g., 123.45)"
                keyboardType="decimal-pad"
                value={manualWeight}
                onChangeText={setManualWeight}
              />
              {ocrFailed && (
                <Text style={styles.helpText}>
                  💡 Tip: Take a clearer photo with good lighting for better OCR results
                </Text>
              )}
            </View>

            {/* Submit Button */}
            {(parsedWeight || manualWeight) && (
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={submitWeight}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Submit to Backend</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  cameraButton: {
    backgroundColor: "#8b5cf6",
  },
  galleryButton: {
    backgroundColor: "#007AFF",
  },
  submitButton: {
    backgroundColor: "#34C759",
    marginTop: 16,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 8,
    resizeMode: "contain",
    backgroundColor: "#e0e0e0",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  resultsContainer: {
    marginTop: 16,
  },
  textBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  ocrText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  weightBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  weightText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
  },
  manualEntryContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    fontSize: 18,
    borderWidth: 2,
    borderColor: "#f59e0b",
    color: "#333",
  },
  inputRequired: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  helpText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },
  instructionBox: {
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#0284c7",
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0c4a6e",
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: "#0c4a6e",
    lineHeight: 20,
  },
  loadingSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
});