
import React, { useState, useMemo } from "react";
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
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { MOBILE_API_BASE_URL } from "../config/apiConfigMobile";
import Toast from "react-native-toast-message";
import DeleteAccountModal from "./components/DeleteAccountModal";

const PasswordRequirement = ({ met, text }) => (
  <View style={styles.requirementRow}>
    <Feather name={met ? "check-circle" : "x-circle"} size={16} color={met ? "#10B981" : "#EF4444"} />
    <Text style={[styles.requirementText, { color: met ? "#10B981" : "#6B7281" }]}>{text}</Text>
  </View>
);

const Profile = ({ navigation, route, setUser }) => {
  const { user } = route.params;
  const [activeSection, setActiveSection] = useState(null); // 'edit', 'password', null
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoadingDeletion, setIsLoadingDeletion] = useState(false);

  // State for Edit Profile
  const [editedName, setEditedName] = useState(user.fullname);

  // State for Change Password
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const passwordValidation = useMemo(() => {
    const pass = passwords.newPassword;
    const hasLength = pass.length >= 8;
    const hasUppercase = /[A-Z]/.test(pass);
    const hasNumber = /\d/.test(pass);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const allMet = hasLength && hasUppercase && hasNumber && hasSpecialChar;
    return { hasLength, hasUppercase, hasNumber, hasSpecialChar, allMet };
  }, [passwords.newPassword]);

  const handleUpdateProfile = async () => {
    if (editedName.trim().length < 3) {
      Alert.alert("Validation Error", "Full name must be at least 3 characters long.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${MOBILE_API_BASE_URL}/users/${user.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname: editedName.trim() }),
      });
      const result = await response.json();
      if (response.ok) {
        Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Your name has been changed.' });
        setUser({ ...user, fullname: editedName.trim() }); // Update user state in App.js
        setActiveSection(null);
      } else {
        throw new Error(result.message || "Failed to update profile.");
      }
    } catch (error) {
      Alert.alert("Update Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
        Alert.alert('Validation Error', 'All password fields are required.');
        return;
    }
    if (!passwordValidation.allMet) {
        Alert.alert('Validation Error', 'New password does not meet all requirements.');
        return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
        Alert.alert('Validation Error', 'New passwords do not match.');
        return;
    }

    setIsLoading(true);
    try {
        const response = await fetch(`${MOBILE_API_BASE_URL}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            }),
        });
        const result = await response.json();
        if (response.ok) {
            Toast.show({ type: 'success', text1: 'Password Updated', text2: 'Your password has been changed successfully.' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setActiveSection(null);
        } else {
            throw new Error(result.message || 'Failed to change password.');
        }
    } catch (error) {
        Alert.alert('Update Error', error.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    setIsLoadingDeletion(true);
    try {
        const response = await fetch(`${MOBILE_API_BASE_URL}/users/${user.id}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (response.ok && result.success) {
            Alert.alert("Account Deleted", result.message || "Your account has been permanently deleted.");
            if (typeof setUser === "function") {
                setUser(null);
            }
            navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
            });
        } else {
            Alert.alert("Deletion Failed", result.message || "Could not delete account. Please try again.");
        }
    } catch (error) {
        console.error("Account deletion error:", error);
        Alert.alert("Error", "Unable to connect to server for deletion. Please try again.");
    } finally {
        setIsLoadingDeletion(false);
        setModalVisible(false);
    }
  };


  const handleLogout = () => {
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <DeleteAccountModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleAccountDeletion}
        isLoading={isLoadingDeletion}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(user.fullname || '?')[0].toUpperCase()}</Text>
            </View>
            <Text style={styles.name}>{user.fullname}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          
          <View style={styles.menuContainer}>
            <MenuItem icon="person-outline" text="Edit Profile" onPress={() => setActiveSection(activeSection === 'edit' ? null : 'edit')} />
            {activeSection === 'edit' && (
              <View style={styles.formContainer}>
                <TextInput style={styles.input} value={editedName} onChangeText={setEditedName} placeholder="Full Name" placeholderTextColor="#A0AEC0" />
                <TouchableOpacity style={styles.button} onPress={handleUpdateProfile} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Update Name</Text>}
                </TouchableOpacity>
              </View>
            )}

            <MenuItem icon="lock-closed-outline" text="Change Password" onPress={() => setActiveSection(activeSection === 'password' ? null : 'password')} />
            {activeSection === 'password' && (
              <View style={styles.formContainer}>
                <TextInput style={styles.input} value={passwords.currentPassword} onChangeText={(t) => setPasswords(p => ({...p, currentPassword: t}))} placeholder="Current Password" secureTextEntry placeholderTextColor="#A0AEC0" />
                <TextInput style={styles.input} value={passwords.newPassword} onChangeText={(t) => setPasswords(p => ({...p, newPassword: t}))} placeholder="New Password" secureTextEntry placeholderTextColor="#A0AEC0" />
                {passwords.newPassword.length > 0 && (
                  <View style={styles.requirementsContainer}>
                    <PasswordRequirement met={passwordValidation.hasLength} text="At least 8 characters" />
                    <PasswordRequirement met={passwordValidation.hasUppercase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
                    <PasswordRequirement met={passwordValidation.hasSpecialChar} text="One special character" />
                  </View>
                )}
                <TextInput style={styles.input} value={passwords.confirmPassword} onChangeText={(t) => setPasswords(p => ({...p, confirmPassword: t}))} placeholder="Confirm New Password" secureTextEntry placeholderTextColor="#A0AEC0" />
                <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="#fff"/> : <Text style={styles.buttonText}>Update Password</Text>}
                </TouchableOpacity>
              </View>
            )}
            
            <MenuItem icon="document-text-outline" text="Terms & Conditions" onPress={() => navigation.navigate('TermsScreen')} />
            <MenuItem icon="shield-checkmark-outline" text="Privacy Policy" onPress={() => navigation.navigate('PrivacyPolicyScreen')} />
            <MenuItem icon="trash-outline" text="Delete Account" onPress={() => setModalVisible(true)} isDelete />
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const MenuItem = ({ icon, text, onPress, isDelete }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={isDelete ? "#EF4444" : "#4A5568"} />
    <Text style={[styles.menuText, isDelete && { color: "#EF4444" }]}>{text}</Text>
    <Ionicons name="chevron-forward-outline" size={22} color="#CBD5E0" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scrollContent: { padding: 20, flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  profileHeader: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E9590F', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#2D3748' },
  email: { fontSize: 16, color: '#718096' },
  menuContainer: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuText: { flex: 1, marginLeft: 16, fontSize: 16, color: '#4A5568' },
  formContainer: { padding: 16, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#CBD5E0', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16, color: '#2D3748' },
  button: { backgroundColor: '#E9590F', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12 },
  logoutText: { color: '#EF4444', marginLeft: 8, fontWeight: 'bold', fontSize: 16 },
  requirementsContainer: { paddingHorizontal: 10, paddingBottom: 10 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  requirementText: { marginLeft: 8, fontSize: 13 },
});

export default Profile;