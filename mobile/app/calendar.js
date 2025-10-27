
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';

const SERVER_URL = 'http://192.168.100.12:5000';

// Helper to prevent timezone issues
const toLocalDateString = (dateStr) => {
    // The calendar returns 'YYYY-MM-DD'. Appending time makes new Date() parse it in local time.
    return new Date(dateStr + 'T00:00:00').toDateString();
};

const AppointmentItem = ({ appointment }) => (
    <View style={styles.appointmentItem}>
        <View style={styles.itemHeader}>
            <Ionicons name="paw-outline" size={20} color="#E9590F" />
            <Text style={styles.petName}>{appointment.pet_name}</Text>
        </View>
        <View style={styles.itemRow}>
            <Ionicons name="apps-outline" size={16} color="#4A5568" style={styles.itemIcon} />
            <Text style={styles.services}>{appointment.services.join(', ')}</Text>
        </View>
        <View style={styles.itemRow}>
            <Ionicons name="time-outline" size={16} color="#4A5568" style={styles.itemIcon} />
            <Text style={styles.time}>{appointment.appointment_time}</Text>
        </View>
    </View>
);

export default function AppointmentCalendar({ navigation, route }) {
    const user = route?.params?.user || null;
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchAppointments = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        };
        setLoading(true);
        try {
            const response = await fetch(`${SERVER_URL}/api/mobile/appointments/${user.id}`);
            const data = await response.json();
            if (response.ok) {
                const activeAppointments = data.filter(app => app.status !== 'Cancelled' && app.status !== 'Rejected');
                setAppointments(activeAppointments);
            } else {
                throw new Error(data.message || 'Failed to fetch appointments');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
            setAppointments([]); // Clear appointments on error
        } finally {
            setLoading(false);
        }
    }, [user]);
    
    useFocusEffect(
        React.useCallback(() => {
            fetchAppointments();
        }, [fetchAppointments])
    );
    
    const markedDates = useMemo(() => {
        const markings = {};
        appointments.forEach(app => {
            const dateKey = app.appointment_date.split('T')[0];
            markings[dateKey] = { marked: true, dotColor: '#E9590F' };
        });
        if (selectedDate) {
            markings[selectedDate] = { ...markings[selectedDate], selected: true, selectedColor: '#E9590F' };
        }
        return markings;
    }, [appointments, selectedDate]);

    const appointmentsOnSelectedDate = useMemo(() => {
        return appointments.filter(app => app.appointment_date.split('T')[0] === selectedDate);
    }, [appointments, selectedDate]);

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Calendar</Text>
                <TouchableOpacity onPress={fetchAppointments}>
                    <Ionicons name="refresh" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={markedDates}
                theme={{
                    todayTextColor: '#E9590F',
                    arrowColor: '#E9590F',
                    textMonthFontWeight: '700',
                    monthTextColor: '#2D3748',
                    selectedDayBackgroundColor: '#E9590F',
                    textDayFontWeight: '500',
                }}
                style={styles.calendarBox}
            />
            
            <View style={styles.listContainer}>
                <Text style={styles.listHeader}>
                    Schedule for {selectedDate ? toLocalDateString(selectedDate) : '...'}
                </Text>
                {loading ? <ActivityIndicator size="large" color="#E9590F" style={{marginTop: 20}}/> :
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    {appointmentsOnSelectedDate.length > 0 ? (
                        appointmentsOnSelectedDate.map(app => (
                           <AppointmentItem key={app.appointment_id} appointment={app} />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={60} color="#CBD5E0" />
                            <Text style={styles.noAppointmentsText}>No appointments scheduled.</Text>
                        </View>
                    )}
                </ScrollView>
                }
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F7FB" },
    header: { 
        flexDirection: "row", 
        alignItems: "center", 
        justifyContent: "space-between", 
        paddingHorizontal: 20, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0'
    },
    headerTitle: { fontSize: 22, fontWeight: "700", color: "#2D3748" },
    calendarBox: { 
        borderRadius: 16, 
        margin: 16, 
        elevation: 3, 
        shadowColor: "#000", 
        shadowOpacity: 0.08, 
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
    listHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#4A5568' },
    appointmentItem: { 
        backgroundColor: 'white', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    petName: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginLeft: 8 },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    itemIcon: {
        marginRight: 8,
    },
    services: { color: '#4A5568', fontSize: 14, flex: 1 },
    time: { color: '#E9590F', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40,
    },
    noAppointmentsText: { 
        textAlign: 'center', 
        color: '#A0AEC0',
        fontSize: 16,
        marginTop: 16,
        fontWeight: '500'
    }
});
