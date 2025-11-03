
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
import io from 'socket.io-client';
import { MOBILE_API_BASE_URL, PUBLIC_API_BASE_URL, MOBILE_SERVER_ROOT_URL } from "../config/apiConfigMobile";

// Helper to prevent timezone issues
const toLocalDateString = (dateStr) => {
    // The calendar returns 'YYYY-MM-DD'. Appending time makes new Date() parse it in local time.
    return new Date(dateStr + 'T00:00:00').toDateString();
};

const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return '';
    const [hours, minutes] = timeString.split(':');
    let h = parseInt(hours, 10);
    if (isNaN(h)) return timeString; // Return original if parsing fails

    const m = String(minutes).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h || 12; // Handle midnight (0) as 12 AM
    return `${h}:${m} ${ampm}`;
};

const AppointmentItem = ({ appointment, onCancel }) => {
    const canCancel = appointment.status && ['Pending', 'Approved'].includes(appointment.status);

    return (
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
                <Text style={styles.time}>{formatTime(appointment.appointment_time)}</Text>
            </View>
            {appointment.notes && (
                <View style={[styles.itemRow, styles.notesRow]}>
                    <Ionicons name="information-circle-outline" size={16} color="#4A5568" style={styles.itemIcon} />
                    <Text style={styles.notesText}>{appointment.notes}</Text>
                </View>
            )}
            {canCancel && (
                <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => onCancel(appointment.appointment_id)}>
                    <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                    <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const PublicEventItem = ({ event }) => {
    const start = event.start ? new Date(event.start) : null;
    const end = event.end ? new Date(event.end) : null;
    const startTime = start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const endTime = end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const description = event.extendedProps?.notes || "No details provided.";

    return (
        <View style={styles.publicEventItem}>
            <View style={styles.itemHeader}>
                <Ionicons name="megaphone-outline" size={20} color="#6BCB77" />
                <Text style={styles.petName}>{event.title}</Text>
            </View>
            <View style={styles.itemRow}>
                <Ionicons name="time-outline" size={16} color="#4A5568" style={styles.itemIcon} />
                <Text style={styles.services}>{startTime} - {endTime}</Text>
            </View>
            {description !== "No details provided." && (
                <View style={styles.itemRow}>
                    <Ionicons name="information-circle-outline" size={16} color="#4A5568" style={styles.itemIcon} />
                    <Text style={styles.services}>{description}</Text>
                </View>
            )}
        </View>
    );
};

export default function AppointmentCalendar({ navigation, route }) {
    const user = route?.params?.user || null;
    const [appointments, setAppointments] = useState([]);
    const [publicEvents, setPublicEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPublicEvents, setLoadingPublicEvents] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchAppointments = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        };
        setLoading(true);
        try {
            const response = await fetch(`${MOBILE_API_BASE_URL}/appointments/${user.id}`);
            const data = await response.json();
            if (response.ok) {
                const activeAppointments = data.filter(app => app.status !== 'Cancelled' && app.status !== 'Rejected');
                setAppointments(activeAppointments);
            } else {
                throw new Error(data.message || 'Failed to fetch appointments');
            }
        } catch (error) {
            Alert.alert('Error fetching personal appointments', error.message);
            setAppointments([]); // Clear appointments on error
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchPublicEvents = useCallback(async () => {
        setLoadingPublicEvents(true);
        try {
            const response = await fetch(`${PUBLIC_API_BASE_URL}/events`);
            const data = await response.json();
            if (response.ok) {
                setPublicEvents(data);
            } else {
                throw new Error(data.error || 'Failed to fetch public events');
            }
        } catch (error) {
            Alert.alert('Error fetching public events', error.message);
            setPublicEvents([]);
        } finally {
            setLoadingPublicEvents(false);
        }
    }, []);

    useEffect(() => {
        const socket = io(MOBILE_SERVER_ROOT_URL);
        socket.on('appointment_update', () => {
            console.log('Calendar: Received appointment update, refetching...');
            fetchAppointments();
            fetchPublicEvents(); 
        });
        return () => socket.disconnect();
    }, [fetchAppointments, fetchPublicEvents]);
    
    useFocusEffect(
        React.useCallback(() => {
            fetchAppointments();
            fetchPublicEvents();
        }, [fetchAppointments, fetchPublicEvents])
    );
    
    const handleCancelAppointment = (appointmentId) => {
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
                            const response = await fetch(`${MOBILE_API_BASE_URL}/appointment/${appointmentId}/cancel`, {
                                method: 'PATCH',
                            });
                            const result = await response.json();
                            if (response.ok) {
                                Alert.alert("Success", "Appointment cancelled successfully.");
                                fetchAppointments(); // Refetch to update the UI
                            } else {
                                throw new Error(result.message || "Failed to cancel appointment.");
                            }
                        } catch (error) {
                            Alert.alert('Error', error.message);
                        }
                    },
                },
            ]
        );
    };

    const markedDates = useMemo(() => {
        const markings = {};
        // Mark user's appointments
        appointments.forEach(app => {
            const dateKey = app.appointment_date.split('T')[0];
            markings[dateKey] = { marked: true, dotColor: '#E9590F' };
        });
        // Mark public events
        publicEvents.forEach(event => {
            const dateKey = event.start.split('T')[0];
            markings[dateKey] = { ...markings[dateKey], marked: true, dotColor: markings[dateKey]?.dotColor ? '#6BCB77' : '#6BCB77' }; // Green for public events
        });

        if (selectedDate) {
            markings[selectedDate] = { ...markings[selectedDate], selected: true, selectedColor: '#E9590F', selectedTextColor: '#fff' };
        }
        return markings;
    }, [appointments, publicEvents, selectedDate]);

    const appointmentsOnSelectedDate = useMemo(() => {
        return appointments.filter(app => app.appointment_date.split('T')[0] === selectedDate);
    }, [appointments, selectedDate]);

    const publicEventsOnSelectedDate = useMemo(() => {
        return publicEvents.filter(event => event.start.split('T')[0] === selectedDate);
    }, [publicEvents, selectedDate]);


    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Calendar</Text>
                <TouchableOpacity onPress={() => { fetchAppointments(); fetchPublicEvents(); }}>
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
                    Personal Schedule for {selectedDate ? toLocalDateString(selectedDate) : '...'}
                </Text>
                {loading ? <ActivityIndicator size="large" color="#E9590F" style={{marginTop: 20}}/> :
                <ScrollView contentContainerStyle={{flexGrow: 1}}>
                    {appointmentsOnSelectedDate.length > 0 ? (
                        appointmentsOnSelectedDate.map(app => (
                           <AppointmentItem key={`app-${app.appointment_id}`} appointment={app} onCancel={handleCancelAppointment} />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={60} color="#CBD5E0" />
                            <Text style={styles.noAppointmentsText}>No personal appointments scheduled.</Text>
                        </View>
                    )}

                    <Text style={[styles.listHeader, {marginTop: 20}]}>
                        Public Events for {selectedDate ? toLocalDateString(selectedDate) : '...'}
                    </Text>
                    {loadingPublicEvents ? <ActivityIndicator size="large" color="#6BCB77" style={{marginTop: 20}}/> :
                    publicEventsOnSelectedDate.length > 0 ? (
                        publicEventsOnSelectedDate.map(event => (
                            <PublicEventItem key={`event-${event.id}`} event={event} />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="newspaper-outline" size={60} color="#CBD5E0" />
                            <Text style={styles.noAppointmentsText}>No public events scheduled for this day.</Text>
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
    listContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
    listHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#4A5568' },
    appointmentItem: { 
        backgroundColor: 'white', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    publicEventItem: {
        backgroundColor: '#EAF7EF', // Light green background for public events
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#6BCB77',
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
    },
    notesRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9'
    },
    notesText: {
        color: '#4A5568',
        fontSize: 13,
        flex: 1,
        fontStyle: 'italic',
    },
    cancelButton: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 15,
        marginLeft: 5,
    },
});
