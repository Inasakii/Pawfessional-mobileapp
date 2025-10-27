
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Utility function to format the full name
const formatFullName = (fullname) => {
  if (!fullname) return "";
  const parts = fullname.trim().split(" ");
  if (parts.length > 2) {
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    const middleInitial = parts.slice(1, -1).map(name => `${name.charAt(0).toUpperCase()}.`).join(' ');
    return `${firstName} ${middleInitial} ${lastName}`;
  }
  return fullname;
};

export default function Profile({ navigation, route, user: propUser, setUser }) {
  const user = propUser || route?.params?.user || null;

  const [showSecurity, setShowSecurity] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [error, setError] = useState("");
  
  const [passwordsMatch, setPasswordsMatch] = useState(null);

  useEffect(() => {
    if (newPass || confirmPass) {
        setPasswordsMatch(newPass === confirmPass && newPass.length > 0);
    } else {
        setPasswordsMatch(null);
    }
  }, [newPass, confirmPass]);


  const onLogout = () => {
    if (typeof setUser === "function") {
      setUser(null);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      setError("Please fill out all fields.");
      return;
    }
    if (newPass !== confirmPass) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://192.168.100.12:5000/mobile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // FIX: The user object from login uses 'id', not 'user_id'.
          user_id: user.id, 
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'An error occurred during password update.');

      Alert.alert("Success", "Your password has been updated!");
      setError("");
      setShowSecurity(false);
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Network or server error.");
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.screen}>
          <Text>Loading...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
    <KeyboardAvoidingView 
        style={{flex: 1}}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back-outline" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {(user.fullname || "?")[0].toUpperCase()}
                </Text>
            </View>
            <Text style={styles.userName}>{formatFullName(user.fullname)}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.menuContainer}>
             <MenuItem icon="settings-outline" text="Settings" onPress={() => navigation.navigate("Settings", { user, setUser })} />
             <MenuItem icon="lock-closed-outline" text="Change Password" onPress={() => setShowSecurity(!showSecurity)} />
        </View>

        {showSecurity && (
          <View style={styles.securityCard}>
            <Text style={styles.sectionTitle}>Change Password</Text>
            <TextInput placeholder="Current Password" secureTextEntry style={styles.input} value={currentPass} onChangeText={setCurrentPass} placeholderTextColor="#9CA3AF" />
            <TextInput placeholder="New Password" secureTextEntry style={styles.input} value={newPass} onChangeText={setNewPass} placeholderTextColor="#9CA3AF" />
            <TextInput placeholder="Confirm Password" secureTextEntry style={styles.input} value={confirmPass} onChangeText={setConfirmPass} placeholderTextColor="#9CA3AF" />
            
            {passwordsMatch !== null && (
                <View style={styles.validationContainer}>
                    <Ionicons 
                        name={passwordsMatch ? "checkmark-circle" : "close-circle"} 
                        size={20} 
                        color={passwordsMatch ? "#10B981" : "#EF4444"} 
                    />
                    <Text style={[styles.validationText, {color: passwordsMatch ? "#10B981" : "#EF4444"}]}>
                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </Text>
                </View>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.changeBtn} onPress={handleChangePassword}>
              <Text style={styles.changeText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={22} color="#fff5f5" />
            <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const MenuItem = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIcon}>
             <Ionicons name={icon} size={22} color="#E9590F" />
        </View>
        <Text style={styles.menuText}>{text}</Text>
        <Ionicons name="chevron-forward-outline" size={20} color="#ccc" />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F7FB" },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 16, paddingHorizontal: 20, backgroundColor: "#F5F7FB", borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#333" },
  container: { padding: 20, paddingBottom: 40 },
  profileCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 24, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E9590F', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  userEmail: { fontSize: 16, color: '#777', marginTop: 4 },
  menuContainer: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  menuIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fdf2e9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 16, color: '#333' },
  securityCard: { backgroundColor: "#fff", borderRadius: 14, padding: 20, marginTop: 20, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#E9590F", marginBottom: 12 },
  input: { backgroundColor: "#F0F0F0", borderRadius: 8, padding: 12, marginBottom: 10, color: '#333', fontSize: 16 },
  errorText: { color: "red", marginTop: 4, marginBottom: 8, fontSize: 14 },
  changeBtn: { backgroundColor: "#E9590F", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
  changeText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff4d4f', paddingVertical: 14, borderRadius: 10, marginTop: 30 },
  logoutButtonText: { color: '#fff5f5', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  validationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 },
  validationText: { marginLeft: 8, fontSize: 14, fontWeight: '500' },
});
