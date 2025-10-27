import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";

const API_URL = "http://192.168.100.12:5000/api/mobile/login";

const Login = ({ navigation, setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    // ... submit logic is unchanged
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        if (typeof setUser === "function") {
          setUser(result.user);
        }
      } else {
        Alert.alert("Login Failed", result.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Unable to connect to server. Please check your connection and try again.");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{flex: 1}} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.headerTitle}>
            <Image
              source={require("../assets/PawLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>VetApp</Text>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email address"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />

          <View style={styles.passwordOptions}>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.linkText}>
                {showPassword ? "Hide Password" : "Show Password"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
               <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don’t have an account? </Text>
            <Pressable onPress={() => navigation.navigate("Register")}>
              <Text style={[styles.footerText, styles.linkText]}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0fdf4", padding: 16 },
    card: { width: "100%", maxWidth: 350, backgroundColor: "white", borderRadius: 16, padding: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 5 },
    headerTitle: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 24 },
    title: { fontSize: 28, fontWeight: 'bold', color: "#E9590F" },
    logo: { width: 50, height: 50, marginRight: 12 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: "#374151" },
    input: { borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16, fontSize: 16, color: '#333' },
    passwordOptions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    linkText: {
      color: "#3B82F6",
      fontWeight: '500',
    },
    button: { backgroundColor: "#E9590F", padding: 16, borderRadius: 10, alignItems: "center" },
    buttonText: { color: "white", fontWeight: 'bold', fontSize: 16 },
    footer: { marginTop: 24, flexDirection: 'row', justifyContent: 'center' },
    footerText: {
      color: "#6B7281",
    }
});

export default Login;
