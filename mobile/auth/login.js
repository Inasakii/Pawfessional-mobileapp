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
  ScrollView,
  ActivityIndicator
} from "react-native";
import { MOBILE_API_BASE_URL } from "../config/apiConfigMobile";

const Login = ({ navigation, setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20-second timeout

    try {
      const response = await fetch(`${MOBILE_API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal, // Add AbortSignal
      });

      clearTimeout(timeoutId); // Clear timeout if response is received

      const data = await response.json();

      if (response.ok && data.success) {
        // Backend confirms user is valid and active by sending success: true.
        // A separate client-side check for is_active is no longer needed.
        if (typeof setUser === "function") {
          console.log("Login successful! User object:", data.user);
          setUser(data.user);
        }
      } else {
        // This single block handles all failure cases from the server,
        // including wrong credentials, inactive user, or other server-side validations.
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      clearTimeout(timeoutId); // Also clear timeout on error
      if (error.name === 'AbortError') {
        Alert.alert("Request Timed Out", "The server is taking too long to respond. This might be because it's waking up. Please try again in a moment.");
      } else {
        // This catches network errors or if response.json() fails to parse.
        console.error("Login fetch/logic error:", error);
        Alert.alert("Error", "Unable to connect to the server. Please check your connection and try again.");
      }
    } finally {
        setIsLoading(false);
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
          </View>

          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
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
      justifyContent: 'flex-end',
      marginBottom: 24,
    },
    linkText: {
      color: "#3B82F6",
      fontWeight: '500',
    },
    button: { backgroundColor: "#E9590F", padding: 16, borderRadius: 10, alignItems: "center", height: 58, justifyContent: 'center' },
    buttonDisabled: { backgroundColor: '#F9B490' },
    buttonText: { color: "white", fontWeight: 'bold', fontSize: 16 },
    footer: { marginTop: 24, flexDirection: 'row', justifyContent: 'center' },
    footerText: {
      color: "#6B7280",
    }
});

export default Login;
