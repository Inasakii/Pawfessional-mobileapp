
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';

const Dashboard = ({ navigation, route, user: propUser }) => {
  const user = propUser || route?.params?.user || null;

  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user?.id) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`http://192.168.100.12:5000/api/mobile/appointments/${user.id}`);
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Server Error: ${response.status}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || "An unknown server error occurred.";
        } catch (e) {
          console.error("Non-JSON server response:", responseText);
          errorMessage = "Received an invalid response from the server. Please check the server logs.";
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      
      const upcoming = data
        .filter(app => ['Pending', 'Approved'].includes(app.status))
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
      setAppointments(upcoming);

    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch appointments");
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAppointments();
    }, [user])
  );

  const currentAppointmentsCount = appointments.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            {user && (
              <Text style={{ fontSize: 14, color: "#555" }}>
                Welcome, {user.fullname || user.email}
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Profile", { user })}>
            {user ? (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {(user.fullname || user.email || "?")[0].toUpperCase()}
                </Text>
              </View>
            ) : (
              <Image source={{ uri: "https://i.pravatar.cc/100" }} style={styles.profilePic} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.pointCard}>
          <Text style={styles.monthText}>Your Activity</Text>
          <Text style={styles.pointsText}>Streak: 0</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: "10%" }]} />
            </View>
            <Ionicons name="flame-outline" size={20} color="#fff" />
          </View>
          <Text style={styles.dailyAppoints}>Current Appointments: {currentAppointmentsCount}</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AppointmentHistory", { user })}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color="#E9590F" style={{ marginTop: 40 }} />
          ) : appointments.length > 0 ? (
            <FlatList
              data={appointments}
              keyExtractor={(item) => item.appointment_id.toString()}
              renderItem={({ item }) => (
                <View style={styles.spendItem}>
                  <View style={[styles.iconCircle, { backgroundColor: item.status === 'Approved' ? '#6BCB77' : '#F4A261' }]}>
                    <Ionicons name="calendar-outline" size={20} color="#fff" />
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.spendLabel}>{item.pet_name}</Text>
                    <Text style={styles.servicesText} numberOfLines={1}>{item.services.join(', ')}</Text>
                  </View>
                  <Text style={styles.spendDate}>
                    {new Date(item.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No upcoming appointments.</Text>
              <Text style={styles.emptySubText}>Tap the '+' button to book a new one!</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerBtn}>
            <Ionicons name="home-outline" size={22} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerBtn}
            onPress={() => navigation.navigate("AppointmentCalendar", { user })}
          >
            <Ionicons name="calendar-outline" size={22} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("BookingFlow", { user })}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerBtn}
            onPress={() => {
              if (user) {
                navigation.navigate("PetInfo", { user });
              } else {
                Alert.alert("Login Required", "Please log in to view your pets.");
              }
            }}
          >
            <Ionicons name="paw-outline" size={22} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate("Settings", { user })}>
            <Ionicons name="settings-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FB" },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#E9590F", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  container: { flex: 1, backgroundColor: "#F5F7FB", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: "#000" },
  profilePic: { width: 40, height: 40, borderRadius: 20 },
  pointCard: { backgroundColor: "#E9590F", borderRadius: 16, padding: 20, marginBottom: 20, elevation: 4 },
  monthText: { color: "#fff", fontSize: 14, opacity: 0.9 },
  pointsText: { fontSize: 28, fontWeight: "bold", color: "#fff", marginVertical: 8 },
  progressRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 3, marginRight: 8 },
  progressBarFill: { height: 6, backgroundColor: "#fff", borderRadius: 3 },
  dailyAppoints: { color: "#fff", fontSize: 13, opacity: 0.9 },
  section: { flex: 1, marginBottom: 70 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  seeAll: { fontSize: 13, color: "#E9590F", fontWeight: '600' },
  spendItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 10, elevation: 2 },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 12 },
  spendLabel: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 2 },
  servicesText: { fontSize: 12, color: '#777' },
  spendDate: { fontSize: 12, color: "#999", fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  emptyText: { fontSize: 16, color: '#888', marginTop: 10 },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 4 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, height: 70, backgroundColor: "#fff", flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopWidth: 1, borderTopColor: "#ddd", elevation: 8 },
  footerBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  addBtn: { backgroundColor: "#E9590F", width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 25, elevation: 6 },
});

export default Dashboard;
