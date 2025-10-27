import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SERVER_URL = 'http://192.168.100.12:5000';

export default function AppointmentHistory({ navigation, route }) {
    const { user } = route.params;
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // 'All', 'Pending', 'Approved', 'Cancelled'

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchAppointments();
        });
        return unsubscribe;
    }, [navigation]);

    useEffect(() => {
        if (filter === 'All') {
            setFilteredAppointments(appointments);
        } else {
            setFilteredAppointments(appointments.filter(app => app.status.toLowerCase() === filter.toLowerCase()));
        }
    }, [filter, appointments]);

    const fetchAppointments = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const response = await fetch(`${SERVER_URL}/api/mobile/appointments/${user.id}`);
            const data = await response.json();
            if (response.ok) {
                setAppointments(data);
            } else {
                throw new Error(data.message || 'Failed to fetch appointments');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        Alert.alert(
            "Confirm Cancellation",
            "Are you sure you want to cancel this appointment?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${SERVER_URL}/api/mobile/appointment/${appointmentId}/cancel`, {
                                method: 'PATCH',
                            });
                            const result = await response.json();
                            if (response.ok) {
                                Alert.alert("Success", "Appointment cancelled.");
                                fetchAppointments(); // Refresh the list
                            } else {
                                throw new Error(result.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            pending: { backgroundColor: '#FEF3C7', color: '#D97706' },
            approved: { backgroundColor: '#D1FAE5', color: '#065F46' },
            cancelled: { backgroundColor: '#FEE2E2', color: '#991B1B' },
        };
        const style = styles[status.toLowerCase()] || { backgroundColor: '#E5E7EB', color: '#4B5563' };
        return (
            <View style={[badgeStyles.badge, { backgroundColor: style.backgroundColor }]}>
                <Text style={[badgeStyles.badgeText, { color: style.color }]}>{status}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Appointment History</Text>
                <TouchableOpacity onPress={fetchAppointments} style={styles.refreshBtn}>
                    <Ionicons name="refresh" size={22} color="#333" />
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                {['All', 'Pending', 'Approved', 'Cancelled'].map(f => (
                    <TouchableOpacity key={f} style={[styles.filterButton, filter === f && styles.activeFilter]} onPress={() => setFilter(f)}>
                        <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {loading ? <ActivityIndicator size="large" color="#E9590F" /> :
                 filteredAppointments.length === 0 ? 
                 <View style={styles.emptyContainer}>
                    <Ionicons name="document-text-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No appointments found for this filter.</Text>
                 </View>
                 :
                 filteredAppointments.map(app => (
                    <View key={app.appointment_id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.petName}>{app.pet_name || 'Pet'}</Text>
                            <StatusBadge status={app.status} />
                        </View>
                        <Text style={styles.services}>{app.services.join(', ')}</Text>
                        <Text style={styles.dateTime}>{new Date(app.appointment_date + 'T00:00:00').toDateString()} at {app.appointment_time}</Text>
                        {['pending', 'approved'].includes(app.status.toLowerCase()) && (
                            <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelAppointment(app.appointment_id)}>
                                <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                 ))
                }
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    backBtn: { padding: 5 },
    refreshBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    content: { padding: 20 },
    filterContainer: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    filterButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#E5E7EB' },
    activeFilter: { backgroundColor: '#E9590F' },
    filterText: { color: '#555', fontWeight: '500' },
    activeFilterText: { color: '#fff' },
    card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    petName: { fontSize: 18, fontWeight: 'bold' },
    services: { color: '#555', marginBottom: 8, flexWrap: 'wrap' },
    dateTime: { color: '#E9590F', fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyText: { textAlign: 'center', marginTop: 16, fontSize: 16, color: '#888' },
    cancelButton: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0', alignItems: 'center' },
    cancelButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
});

const badgeStyles = StyleSheet.create({
    badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: 'bold', textTransform: 'capitalize' },
});
