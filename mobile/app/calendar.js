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
import Toast from 'react-native-toast-message';
import { MOBILE_API_BASE_URL, PUBLIC_API_BASE_URL, MOBILE_SERVER_ROOT_URL } from "../config/apiConfigMobile";

// Helper to prevent timezone issues
const toLocalDateString = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toDateString();
};

const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return '';
    const [hours, minutes] = timeString.split(':');
    let h = parseInt(hours, 10);
    if (isNaN(h)) return timeString; 

    const m = String(minutes).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h || 12; 
    return `${h}:${m} ${ampm}`;
};

const AppointmentItem = ({ appointment, onCancel }) => {
    const canCancel = appointment.status && ['Pending', 'Approved'].includes(appointment.status);
    return (
        <View style={styles.appointmentItem}>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
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
                </View>
                {canCancel && (
                    <TouchableOpacity style={styles.cancelIconContainer} onPress={() => onCancel(appointment.appointment_id)}>
                        <Ionicons name="close-circle" size={28} color="#EF4444" />
                    </TouchableOpacity>
                )}
            </View>
            {appointment.notes && (
                <View style={[styles.itemRow, styles.notesRow]}>
                    <Ionicons name="information-circle-outline" size={16} color="#4A5568" style={styles.itemIcon} />
                    <Text style={styles.notesText}>{appointment.notes}</Text>
                </View>
            )}
        </View>
    );
};

const CancelledAppointmentItem = ({ appointment }) => (
    <View style={styles.cancelledItem}>
        <View style={styles.itemHeader}>
            <Ionicons name="close-circle-outline" size={20} color="#A0AEC0" />
            <Text style={styles.cancelledPetName}>{appointment.pet_name}</Text>
        </View>
        <View style={styles.itemRow}>
            <Ionicons name="apps-outline" size={16} color="#A0AEC0" style={styles.itemIcon} />
            <Text style={styles.cancelledServices}>{appointment.services.join(', ')}</Text>
        </View>
    </View>
);


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
    const [allAppointments, setAllAppointments] = useState([]);
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
                setAllAppointments(data);
            } else {
                throw new Error(data.message || 'Failed to fetch appointments');
            }
        } catch (error) {
            Alert.alert('Error fetching personal appointments', error.message);
            setAllAppointments([]); 
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
    
    useFocusEffect(
        React.useCallback(() => {
            fetchAppointments();
            fetchPublicEvents();
        }, [fetchAppointments, fetchPublicEvents])
    );
    
    useEffect(() => {
        const socket = io(MOBILE_SERVER_ROOT_URL);
        socket.on('appointment_update', () => {
          fetchAppointments();
        });
        return () => socket.disconnect();
    }, [fetchAppointments]);

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
                                Toast.show({ type: 'info', text1: 'Appointment Cancelled', text2: result.message });
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

    const handleClearCancelled = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to permanently delete all your cancelled, rejected, and no-show appointment records?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Clear",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(`${MOBILE_API_BASE_URL}/appointments/cancelled/${user.id}`, {
                                method: 'DELETE',
                            });
                            const result = await response.json();
                            if (response.ok) {
                                Toast.show({
                                    type: 'success',
                                    text1: 'History Cleared',
                                    text2: result.message,
                                });
                                fetchAppointments(); // Will refetch and show an empty list
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

    const { activeAppointments, cancelledAppointments } = useMemo(() => {
        const active = [];
        const cancelled = [];
        const cancelledStatuses = ['cancelled', 'rejected', 'no show'];
        for (const app of allAppointments) {
            if (app.status && cancelledStatuses.includes(app.status.toLowerCase())) {
                cancelled.push(app);
            } else {
                active.push(app);
            }
        }
        return { activeAppointments: active, cancelledAppointments: cancelled };
    }, [allAppointments]);

    const markedDates = useMemo(() => {
        const markings = {};
        activeAppointments.forEach(app => {
            const dateKey = app.appointment_date.split('T')[0];
            if (!markings[dateKey]) markings[dateKey] = { dots: [] };
            if (!markings[dateKey].dots.some(d => d.key === 'active')) {
                markings[dateKey].dots.push({ key: 'active', color: '#E9590F' });
            }
        });
        cancelledAppointments.forEach(app => {
            const dateKey = app.appointment_date.split('T')[0];
            if (!markings[dateKey]) markings[dateKey] = { dots: [] };
            if (!markings[dateKey].dots.some(d => d.key === 'cancelled')) {
                markings[dateKey].dots.push({ key: 'cancelled', color: '#A0AEC0' });
            }
        });
        publicEvents.forEach(event => {
            const dateKey = event.start.split('T')[0];
            if (!markings[dateKey]) markings[dateKey] = { dots: [] };
            if (!markings[dateKey].dots.some(d => d.key === 'public')) {
                markings[dateKey].dots.push({ key: 'public', color: '#6BCB77' });
            }
        });

        if (selectedDate && markings[selectedDate]) {
            markings[selectedDate].selected = true;
            markings[selectedDate].selectedColor = '#E9590F';
            markings[selectedDate].selectedTextColor = '#fff';
        } else if (selectedDate) {
            markings[selectedDate] = { selected: true, selectedColor: '#E9590F', selectedTextColor: '#fff' };
        }
        return markings;
    }, [activeAppointments, cancelledAppointments, publicEvents, selectedDate]);

    const appointmentsOnSelectedDate = useMemo(() => {
        return activeAppointments.filter(app => app.appointment_date.split('T')[0] === selectedDate);
    }, [activeAppointments, selectedDate]);

    const cancelledOnSelectedDate = useMemo(() => {
        return cancelledAppointments.filter(app => app.appointment_date.split('T')[0] === selectedDate);
    }, [cancelledAppointments, selectedDate]);

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
                markingType={'multi-dot'}
                theme={{
                    todayTextColor: '#E9590F',
                    arrowColor: '#E9590F',
                    textMonthFontWeight: '700',
                    monthTextColor: '#2D3748',
                    selectedDayBackgroundColor: '#E9590F',
                    selectedDayTextColor: '#fff',
                    textDayFontWeight: '500',
                }}
                style={styles.calendarBox}
            />
            
            <ScrollView style={styles.listContainer} contentContainerStyle={{paddingBottom: 20}}>
                <Text style={styles.listHeader}>
                    Personal Schedule for {selectedDate ? toLocalDateString(selectedDate) : '...'}
                </Text>
                {loading ? <ActivityIndicator size="large" color="#E9590F" style={{marginTop: 20}}/> :
                    appointmentsOnSelectedDate.length > 0 ? (
                        appointmentsOnSelectedDate.map(app => (
                           <AppointmentItem key={`app-${app.appointment_id}`} appointment={app} onCancel={handleCancelAppointment} />
                        ))
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={40} color="#CBD5E0" />
                            <Text style={styles.noAppointmentsText}>No personal appointments.</Text>
                        </View>
                    )
                }
                
                {cancelledOnSelectedDate.length > 0 && (
                    <View style={{marginTop: 20}}>
                        <View style={styles.listHeaderContainer}>
                            <Text style={styles.listHeader}>Cancellation History</Text>
                            <TouchableOpacity style={styles.clearButton} onPress={handleClearCancelled}>
                                <Ionicons name="trash-outline" size={16} color="#991B1B" />
                                <Text style={styles.clearButtonText}>Clear History</Text>
                            </TouchableOpacity>
                        </View>
                        {cancelledOnSelectedDate.map(app => (
                           <CancelledAppointmentItem key={`cancelled-app-${app.appointment_id}`} appointment={app} />
                        ))}
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
                        <Ionicons name="newspaper-outline" size={40} color="#CBD5E0" />
                        <Text style={styles.noAppointmentsText}>No public events for this day.</Text>
                    </View>
                )}
            </ScrollView>
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
    listHeaderContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    listHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#4A5568' },
    appointmentItem: { 
        backgroundColor: 'white', 
        padding: 16, 
        borderRadius: 12, 
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    cancelledItem: {
        backgroundColor: '#F1F5F9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        opacity: 0.7,
    },
    publicEventItem: {
        backgroundColor: '#F0FDF4',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    petName: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginLeft: 8 },
    cancelledPetName: { fontSize: 16, fontWeight: 'bold', color: '#64748B', marginLeft: 8, textDecorationLine: 'line-through' },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    itemIcon: {
        marginRight: 8,
    },
    services: { color: '#4A5568', fontSize: 14, flex: 1 },
    cancelledServices: { color: '#64748B', fontSize: 14, flex: 1, textDecorationLine: 'line-through' },
    time: { color: '#E9590F', fontWeight: 'bold', fontSize: 14 },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    noAppointmentsText: { 
        textAlign: 'center', 
        color: '#A0AEC0',
        fontSize: 15,
        marginTop: 8,
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
    cancelIconContainer: {
        padding: 8,
        alignSelf: 'center',
    },
    cancelButtonText: {
        color: '#EF4444',
        fontWeight: '600',
        fontSize: 15,
        marginLeft: 5,
    },
    clearButton: {
        flexDirection: 'row',
        backgroundColor: '#FEE2E2',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    clearButtonText: {
        color: '#991B1B',
        fontWeight: '600',
        marginLeft: 6,
        fontSize: 13,
    },
});
