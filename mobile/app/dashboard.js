import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import io from 'socket.io-client';
import { MOBILE_API_BASE_URL, MOBILE_SERVER_ROOT_URL } from "../config/apiConfigMobile";

const Dashboard = ({ navigation, route, user: propUser }) => {
  const user = propUser || route?.params?.user || null;
  const [allAppointments, setAllAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Pending');

  const firstName = user?.fullname ? user.fullname.split(' ')[0] : (user?.email || 'Guest');

  const completedAppointmentsCount = useMemo(() => {
    return allAppointments.filter(app => app.status && app.status.toLowerCase() === 'completed').length;
  }, [allAppointments]);

  const fetchAppointments = useCallback(async () => {
    if (!user?.id) {
        setIsLoading(false);
        return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(`${MOBILE_API_BASE_URL}/appointments/${user.id}`);
      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = `Server Error: ${response.status}`;
        try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || "An unknown server error occurred.";
        } catch (e) {
          console.error("Non-JSON server response:", responseText);
          errorMessage = "Received an invalid response from the server.";
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      setAllAppointments(data);

    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch appointments");
      setAllAppointments([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      if (user && user.id) {
        fetchAppointments();
      } else {
        setIsLoading(false);
        setAllAppointments([]);
      }
    }, [user, fetchAppointments])
  );

  useEffect(() => {
      const socket = io(MOBILE_SERVER_ROOT_URL);
      socket.on('appointment_update', () => {
        console.log('Received appointment_update event, refetching...');
        fetchAppointments();
      });
      return () => socket.disconnect();
    }, [fetchAppointments]);

  useEffect(() => {
    // Make comparisons case-insensitive to avoid issues with data from the server.
    const filterLower = activeFilter.toLowerCase();

    let filtered = [];
    if (['pending', 'approved', 'completed'].includes(filterLower)) {
        filtered = allAppointments
            .filter(app => app.status && app.status.toLowerCase() === filterLower);
    } else if (filterLower === 'cancelled') {
        const statusesToFilter = ['cancelled', 'rejected', 'no show'];
        filtered = allAppointments
            .filter(app => app.status && statusesToFilter.includes(app.status.toLowerCase()));
    }

    // Sort ascending for upcoming, descending for past/cancelled
    if (['pending', 'approved'].includes(filterLower)) {
        filtered.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    } else {
        filtered.sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date));
    }
    
    setFilteredAppointments(filtered);
  }, [activeFilter, allAppointments]);


  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#E9590F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeCardTitle}>Dashboard</Text>
            <Text style={styles.welcomeCardSubtitle}>Welcome, {firstName}</Text>
            <Text style={styles.welcomeCardInfo}>Completed Appointments: {completedAppointmentsCount}</Text>
          </View>
        </View>
        
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {['Pending', 'Approved', 'Completed', 'Cancelled'].map(f => (
                    <TouchableOpacity key={f} style={[styles.filterButton, activeFilter === f && styles.activeFilter]} onPress={() => setActiveFilter(f)}>
                        <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{activeFilter} Appointments</Text>
          </View>
          {isLoading ? (
            <ActivityIndicator size="large" color="#E9590F" style={{ marginTop: 40 }} />
          ) : filteredAppointments.length > 0 ? (
            <FlatList
              data={filteredAppointments}
              keyExtractor={(item) => item.appointment_id.toString()}
              renderItem={({ item }) => (
                <View style={styles.spendItem}>
                  <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
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
                  {item.notes && (
                      <View style={styles.notesContainer}>
                          <Ionicons name="information-circle-outline" size={16} color="#4A5568" />
                          <Text style={styles.notesText} numberOfLines={2}>Note: {item.notes}</Text>
                      </View>
                  )}
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={60} color="#E0E0E0" />
              <Text style={styles.emptyText}>No {activeFilter.toLowerCase()} appointments.</Text>
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

          <TouchableOpacity style={styles.footerBtn} onPress={() => navigation.navigate("Profile", { user })}>
            <Ionicons name="person-outline" size={22} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5F7FB" },
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  header: { 
    padding: 16, 
    paddingBottom: 0 
  },
  welcomeCard: {
      backgroundColor: '#E9590F',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#E9590F',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      marginBottom: 30,
  },
  welcomeCardTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#fff',
  },
  welcomeCardSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      marginTop: 4,
  },
  welcomeCardInfo: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 10,
  },
  filterContainer: {
    paddingBottom: 10,
    marginTop: -10, // Pulls the filters up to overlap slightly
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeFilter: {
    backgroundColor: '#E9590F',
    borderColor: '#E9590F',
  },
  filterText: {
    color: '#333',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },
  section: { flex: 1, marginBottom: 70, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#333" },
  spendItem: {  alignItems: "center", backgroundColor: "#fff", padding: 12, borderRadius: 12, marginBottom: 10, elevation: 2, flexDirection: 'column' },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 12 },
  spendLabel: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 2 },
  servicesText: { fontSize: 12, color: '#777' },
  spendDate: { fontSize: 12, color: "#999", fontWeight: '500' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  emptyText: { fontSize: 16, color: '#888', marginTop: 10 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, height: 70, backgroundColor: "#fff", flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopWidth: 1, borderTopColor: "#ddd", elevation: 8 },
  footerBtn: { flex: 1, alignItems: "center", justifyContent: "center" },
  addBtn: { backgroundColor: "#E9590F", width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", marginBottom: 25, elevation: 6 },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    width: '100%',
  },
  notesText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#4A5568',
    flex: 1,
    fontStyle: 'italic',
  },
});

export default Dashboard;
