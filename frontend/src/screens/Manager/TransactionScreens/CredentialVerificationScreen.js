import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

export default function CredentialVerificationScreen({ navigation }) {
  const signatureRef = useRef(null);
  const [signature, setSignature] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Handle Signature OK
  const handleSignature = async (sig) => {
    setSignature(sig);
    setSubmitted(true);

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem("managerSignature", sig);
      console.log("Manager signature saved!");
    } catch (e) {
      console.log("Error saving signature: ", e);
    }
  };

  const handleClear = () => {
    signatureRef.current.clearSignature();
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

      <Text style={styles.heading}>Signature</Text>

      {/* SIGNATURE PAD OR PREVIEW */}
      {!submitted ? (
        <View style={styles.signatureBox}>
          <SignatureScreen
            ref={signatureRef}
            onOK={handleSignature}
            onEmpty={() => alert("Please sign first")}
            descriptionText="Sign here"
            clearText="Clear"
            confirmText="Save"
            webStyle={style}
          />
        </View>
      ) : (
        <View style={styles.previewBox}>
          <Image source={{ uri: signature }} style={styles.signatureImage} />
        </View>
      )}

      {/* SUBMIT BUTTON */}
      {!submitted && (
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => signatureRef.current.readSignature()}
        >
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      )}

      {/* CLEAR BUTTON */}
      {!submitted && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearText}>Clear Signature</Text>
        </TouchableOpacity>
      )}

      {/* GO BACK BUTTON */}
      <TouchableOpacity
        style={[styles.submitBtn, { marginTop: 20, backgroundColor: "black" }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.submitText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------- STYLES ----------------------

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

  heading: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 20,
  },

  signatureBox: {
    height: 300,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },

  previewBox: {
    height: 300,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    marginBottom: 20,
  },

  signatureImage: {
    width: "100%",
    height: "100%",
  },

  submitBtn: {
    backgroundColor: "#2C6BED",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },

  submitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  clearBtn: {
    backgroundColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  clearText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

const style = `
  .m-signature-pad { border: none; box-shadow: none; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; }
`;