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

export default function ItemsTransactionScreen({ navigation }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);

  const [materialType, setMaterialType] = useState(""); 
  const [showDropdown, setShowDropdown] = useState(false); 

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
    navigation.navigate("VendorSignatureScreen");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Photo</Text>
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

        <TouchableOpacity
          style={styles.dropdownBox}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.dropdownText}>
            {materialType || "Choose material"}
          </Text>
          <MaterialIcons
            name={showDropdown ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#374151"
          />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownList}>
            {[
              "Defective Products",
              "Hazardous Waste",
              "Recycling Cardboard",
              "Recycling E Waste",
              "Recycling Glass",
              "Recycling Hangers",
              "Recycling Metal",
              "Recycling Mixed Packaging",
              "Recycling Organic",
              "Recycling Paper",
              "Recycling Rubber",
              "Recycling Soft Plastics",
              "Recycling Textile",
              "Waste Incineration",
              "Waste incineration energy recovery",
              "Waste Landfill",
            ].map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.dropdownItem}
                onPress={() => {
                  setMaterialType(item);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {/* ---- END DROPDOWN ---- */}

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
          <Text style={styles.calibrateText}>Export Bill</Text>
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

  capturePhotoHeading: {
    marginTop: 20,
    marginLeft: 10,
    fontWeight: "600",
    fontSize: 20,
    color: "#374151",
  },

  cameraBox: {
    width: "100%",
    height: 280,
    backgroundColor: "#e5e7eb",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 18,
  },

  camera: { flex: 1 },

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

  // --- DROPDOWN ---
  dropdownLabel: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 4,
    color: "#374151",
  },

  dropdownBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  dropdownText: {
    fontSize: 16,
    color: "#374151",
  },

  dropdownList: {
    backgroundColor: "#fff",
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    overflow: "hidden",
  },

  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 15,
  },

  dropdownItemText: {
    fontSize: 16,
    color: "#111827",
  },

  // --- INPUTS ---
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

// import React, { useEffect, useRef, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Image,
// } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import { MaterialIcons } from "@expo/vector-icons";

// export default function BillingTransactionScreen({ navigation }) {
//   const cameraRef = useRef(null);
//   const [permission, requestPermission] = useCameraPermissions();
//   const [photo, setPhoto] = useState(null);

//   const [weight1, setWeight1] = useState("");
//   const [weight2, setWeight2] = useState("");

//   useEffect(() => {
//     if (!permission?.granted) {
//       requestPermission();
//     }
//   }, []);

//   const handleCapture = async () => {
//     if (cameraRef.current) {
//       const picture = await cameraRef.current.takePictureAsync();
//       setPhoto(picture.uri);
//     }
//   };

//   const handleCalibrate = () => {
//     // Later send image + weight1 + weight2 to server
//     // For now, simply navigate
//     navigation.navigate("BillingExportTransactionScreen");
//   };

//   return (
//     <View style={styles.container}>

//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <MaterialIcons name="arrow-back" size={26} color="#2563eb" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Billing Phase</Text>
//         <View style={{ width: 26 }} />
//       </View>

//           <ScrollView
//               contentContainerStyle={{ paddingBottom: 40 }}
//               keyboardShouldPersistTaps="handled"
//             >
//       <Text style={styles.capturePhotoHeading}>
//         Material Photo
//       </Text>

//       {/* CAMERA BOX */}
//       <View style={styles.cameraBox}>
//         {photo ? (
//           <Image source={{ uri: photo }} style={styles.capturedImage} />
//         ) : (
//           <CameraView style={styles.camera} facing="back" ref={cameraRef} />
//         )}
//       </View>

//       {/* CAPTURE BUTTON */}
//       <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
//         <MaterialIcons name="photo-camera" size={22} color="#fff" />
//         <Text style={styles.captureText}>Capture</Text>
//       </TouchableOpacity>

//       {/* Fetch Weight */}
//       <View style={styles.inputBox}>
//         <TextInput
//           placeholder="Fetch Weight"
//           style={styles.input}
//           keyboardType="numeric"
//           value={weight1}
//           onChangeText={setWeight1}
//         />
//         <Text style={styles.gmText}>gm</Text>
//       </View>

//       {/* WEIGHT INPUT */}
//       <View style={styles.inputBox}>
//         <TextInput
//           placeholder="Enter Weight"
//           style={styles.input}
//           keyboardType="numeric"
//           value={weight2}
//           onChangeText={setWeight2}
//         />
//         <Text style={styles.gmText}>gm</Text>
//       </View>

//       {/* CALIBRATE BUTTON */}
//       <TouchableOpacity style={styles.calibrateBtn} onPress={handleCalibrate}>
//         <Text style={styles.calibrateText}>Export Bill</Text>
//       </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// }

// // ----------------- STYLES -----------------
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f9fafb",
//     paddingHorizontal: 20,
//   },

//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingTop: 60,
//     paddingBottom: 15,
//     backgroundColor: "#fff",
//     marginHorizontal: -20,
//     paddingHorizontal: 20,
//     elevation: 3,
//   },

//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#2563eb",
//   },

//     capturePhotoHeading: {
//     marginTop: 20,
//     marginLeft: 10,
//     fontWeight: "600",
//     fontSize: 20,
//     color: "#374151",
//   },

//   cameraBox: {
//     width: "100%",
//     height: 280,
//     backgroundColor: "#e5e7eb",
//     borderRadius: 16,
//     overflow: "hidden",
//     marginTop: 18,
//   },

//   camera: {
//     flex: 1,
//   },

//   capturedImage: {
//     width: "100%",
//     height: "100%",
//   },

//   captureBtn: {
//     backgroundColor: "#2563eb",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 12,
//     borderRadius: 12,
//     marginTop: 15,
//   },

//   captureText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//     marginLeft: 8,
//   },

//   inputBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     borderWidth: 1,
//     borderColor: "#d1d5db",
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     marginTop: 15,
//   },

//   input: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 16,
//   },

//   gmText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#374151",
//   },

//   calibrateBtn: {
//     backgroundColor: "#2563eb",
//     paddingVertical: 14,
//     borderRadius: 14,
//     alignItems: "center",
//     marginTop: 25,
//   },

//   calibrateText: {
//     color: "#fff",
//     fontSize: 17,
//     fontWeight: "700",
//   },
// });
