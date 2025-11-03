import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { Feather } from '@expo/vector-icons';
import { MOBILE_API_BASE_URL } from "../config/apiConfigMobile";

const PasswordRequirement = ({ met, text }) => (
  <View style={styles.requirementRow}>
    <Feather name={met ? "check-circle" : "x-circle"} size={16} color={met ? "#10B981" : "#EF4444"} />
    <Text style={[styles.requirementText, { color: met ? "#10B981" : "#6B7281" }]}>{text}</Text>
  </View>
);

const Register = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
        setErrors(prev => ({...prev, [key]: null}));
    }
  }

  // Password strength validation logic
  const passwordValidation = useMemo(() => {
    const pass = formData.password;
    const hasLength = pass.length >= 8;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const allMet = hasLength && hasUppercase && hasNumber && hasSpecialChar;
    return { hasLength, hasUppercase, hasNumber, hasSpecialChar, allMet };
  }, [formData.password]);

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "A valid email is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!passwordValidation.allMet) newErrors.password = "Password does not meet all requirements.";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      // Combine names into a single "fullname"
      const fullname = `${formData.firstName.trim()} ${formData.middleName.trim() ? formData.middleName.trim() + " " : ""}${formData.lastName.trim()}`.trim();

      const payload = {
        fullname,
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: "", // optional
        role: "user", // default role
      };

      const response = await fetch(`${MOBILE_API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Attempt to read the response text first, then try to parse as JSON
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        // If parsing fails, it means the response was not JSON.
        console.error("Non-JSON response from server during registration:", responseText);
        throw new Error(`Server returned an unexpected response. Status: ${response.status}.`);
      }

      if (response.ok && data.success) {
        Toast.show({
          type: "success",
          text1: "Account Created 🎉",
          text2: "You can now log in with your new account.",
        });

        // Navigate to the success screen instead of directly to login
        navigation.navigate("Success");

      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: data.message || "Please try again.",
        });
      }
    } catch (error) {
      console.error("Register fetch/logic error:", error);
      Toast.show({
        type: "error",
        text1: "Network Error",
        text2: error.message || "Cannot connect to the server. Please try again later.",
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create Account</Text>

        {/* User details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Details</Text>

          <TextInput
            placeholder="First Name"
            placeholderTextColor="#9CA3AF"
            value={formData.firstName}
            onChangeText={(v) => handleChange("firstName", v)}
            style={styles.input}
            autoCapitalize="words"
          />
          {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

          <TextInput
            placeholder="Middle Name (optional)"
            placeholderTextColor="#9CA3AF"
            value={formData.middleName}
            onChangeText={(v) => handleChange("middleName", v)}
            style={styles.input}
            autoCapitalize="words"
          />

          <TextInput
            placeholder="Last Name"
            placeholderTextColor="#9CA3AF"
            value={formData.lastName}
            onChangeText={(v) => handleChange("lastName", v)}
            style={styles.input}
            autoCapitalize="words"
          />
          {errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#9CA3AF"
            value={formData.phone}
            onChangeText={(v) => handleChange("phone", v)}
            style={styles.input}
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
        </View>

        {/* Login details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Login Credentials</Text>

          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            value={formData.email}
            onChangeText={(v) => handleChange("email", v)}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
          
          <View style={styles.passwordContainer}>
            <TextInput 
              placeholder="Password" 
              placeholderTextColor="#9CA3AF" 
              value={formData.password} 
              onChangeText={(v) => handleChange("password", v)} 
              style={styles.inputPassword} 
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#6B7281" />
            </TouchableOpacity>
          </View>

          {/* Password Strength Meter */}
          {formData.password.length > 0 && (
            <View style={styles.requirementsContainer}>
              <PasswordRequirement met={passwordValidation.hasLength} text="At least 8 characters" />
              <PasswordRequirement met={passwordValidation.hasUppercase} text="One uppercase letter" />
              <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
              <PasswordRequirement met={passwordValidation.hasSpecialChar} text="One special character" />
            </View>
          )}
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              value={formData.confirmPassword}
              onChangeText={(v) => handleChange("confirmPassword", v)}
              style={styles.inputPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#6B7281" />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
        </View>

        {/* Submit button */}
        <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20, backgroundColor: "#f0fdf4" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center", color: "#E9590F" },
  section: { marginBottom: 20, padding: 15, borderRadius: 10, backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#444" },
  input: { color:"#333",borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 12, backgroundColor: "white", marginBottom: 6, fontSize: 16 },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    backgroundColor: "white",
    marginBottom: 6,
  },
  inputPassword: {
    flex: 1,
    color: "#333",
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    paddingHorizontal: 12,
  },
  button: { backgroundColor: "#E9590F", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 8, height: 56, justifyContent: 'center' },
  buttonDisabled: { backgroundColor: '#F9B490' },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  error: { color: "red", fontSize: 12, marginBottom: 6, marginLeft: 4 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  footerText: { color: 'gray' },
  linkText: { color: 'blue' },
  requirementsContainer: { paddingHorizontal: 10, paddingBottom: 10 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  requirementText: { marginLeft: 8, fontSize: 13 },
});

export default Register;