import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Input from "../Components/Input";
import api from "../api/api";

export default function ChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMessage("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.put("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      setMessage(data.message);

      if (data.success) {
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (err) {
      setMessage("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#2563eb" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Ionicons name="lock-open-outline" size={70} color="#2563eb" />
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>
            Enter your current and new password
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Input
            secure
            icon={<Ionicons name="lock-closed" size={22} color="#2563eb" />}
            placeholder="Old Password"
            onChangeText={setOldPassword}
          />

          <Input
            secure
            icon={<Ionicons name="key-outline" size={22} color="#2563eb" />}
            placeholder="New Password"
            onChangeText={setNewPassword}
          />

          {message ? <Text style={styles.messageText}>{message}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 6,
  },
  formContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  messageText: {
    textAlign: "center",
    color: "#2563eb",
    marginVertical: 8,
    fontSize: 14,
  },
});
