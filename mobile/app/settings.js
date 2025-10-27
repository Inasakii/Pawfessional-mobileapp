
import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DeleteAccountModal from "./components/DeleteAccountModal";

export default function Settings({ navigation, setUser }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Dashboard");
    }
  };
  
  // This function is called from the modal when deletion is confirmed
  const handleAccountDeletion = () => {
    console.log("Account deletion confirmed by user.");
    // 1. Add your API call to the backend to start the 30-day deletion process.
    // 2. On success, log the user out.
    if (typeof setUser === "function") {
        setUser(null);
    }
    setModalVisible(false);
    // The RootNavigator will automatically handle navigating to the Login screen.
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <DeleteAccountModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleAccountDeletion}
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="arrow-back-outline" size={26} color="#E9590F" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Push notifications</Text>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: "#767577", true: "#f5ddc9" }} thumbColor={pushEnabled ? "#E9590F" : "#f4f3f4"} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email notifications</Text>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: "#767577", true: "#f5ddc9" }} thumbColor={emailEnabled ? "#E9590F" : "#f4f3f4"} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.deleteText}>Delete account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  content: {
    padding: 20
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 20, paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { marginRight: 10, padding: 6 },
  title: { fontSize: 24, fontWeight: "bold", color: "#E9590F" },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  label: { fontSize: 16, color: '#555' },
  deleteBtn: { backgroundColor: '#ee4949ff',paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  deleteText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
