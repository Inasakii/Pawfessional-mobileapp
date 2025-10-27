// mobile/auth/ForgotPassword.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const API_URL = "http://192.168.100.38:5000/mobile/forgot-password";

const ForgotPassword = ({ navigation }) => {
  const [phase, setPhase] = useState('enter_email'); // 'enter_email', 'enter_otp', 'reset_password'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const otpInputs = useRef([]);

  const handleRequestOtp = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      
      Alert.alert('PIN Sent', result.message);
      if (response.ok) {
        setPhase('enter_otp');
      }
    } catch (e) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
        setError('Please enter the complete 6-digit PIN.');
        return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: enteredOtp }),
      });
      const result = await response.json();

      if (response.ok) {
          setPhase('reset_password');
      } else {
          setError(result.message || 'Invalid PIN. Please try again.');
      }
    } catch (e) {
      setError('An error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }
    if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }
    setIsLoading(true);
    setError('');

    try {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: newPassword }),
        });
        const result = await response.json();

        if (response.ok) {
            Alert.alert(
                'Success', 
                'Your password has been reset successfully.',
                [{ text: 'OK', onPress: () => navigation.navigate('Login')}]
            );
        } else {
            setError(result.message || 'Failed to reset password.');
        }
    } catch (e) {
        setError('An error occurred. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };
  
  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const renderContent = () => {
    switch (phase) {
      case 'enter_otp':
        return (
          <>
            <Text style={styles.instructions}>
              Please enter the 6-digit PIN sent to <Text style={{fontWeight: 'bold'}}>{email}</Text>.
            </Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => otpInputs.current[index] = ref}
                  style={styles.otpBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  onChangeText={(text) => handleOtpChange(text, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                  value={digit}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify PIN</Text>}
            </TouchableOpacity>
          </>
        );
      case 'reset_password':
        return (
          <>
            <Text style={styles.instructions}>Create a new password for your account.</Text>
            <Text style={styles.label}>New Password</Text>
            <TextInput placeholder="Enter new password" placeholderTextColor="#9CA3AF" value={newPassword} onChangeText={(text) => { setNewPassword(text); setError(''); }} secureTextEntry style={styles.input}/>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput placeholder="Confirm new password" placeholderTextColor="#9CA3AF" value={confirmPassword} onChangeText={(text) => { setConfirmPassword(text); setError(''); }} secureTextEntry style={styles.input}/>
            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Reset Password</Text>}
            </TouchableOpacity>
          </>
        );
      case 'enter_email':
      default:
        return (
          <>
            <Text style={styles.instructions}>
              Enter the email associated with your account to receive a verification PIN.
            </Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={(text) => { setEmail(text); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TouchableOpacity style={styles.button} onPress={handleRequestOtp} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send PIN</Text>}
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="chevron-left" size={28} color="#333" />
        </Pressable>
        <View style={styles.card}>
          <View style={styles.headerTitle}>
            <Image
              source={require("../assets/PawLogo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Forgot Password</Text>
          </View>
          {renderContent()}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f0fdf4", padding: 16 },
    card: { width: "100%", maxWidth: 380, backgroundColor: "white", borderRadius: 16, padding: 24, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3, alignItems: 'center' },
    backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
    headerTitle: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 16 },
    title: { fontSize: 24, fontWeight: "bold", color: "#E9590F" },
    logo: { width: 40, height: 40, marginRight: 10 },
    instructions: { textAlign: 'center', color: '#6B7281', marginBottom: 24, fontSize: 15, lineHeight: 22 },
    label: { width: '100%', fontSize: 14, fontWeight: "600", marginBottom: 6, color: "#333" },
    input: { width: '100%', borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, marginBottom: 24, fontSize: 16, color: '#333' },
    button: { backgroundColor: "#E9590F", padding: 15, borderRadius: 10, alignItems: "center", width: '100%' },
    buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
    errorText: { color: 'red', marginTop: 16, textAlign: 'center' },
    otpContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    otpBox: { width: 48, height: 58, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#333' },
});

export default ForgotPassword;