
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image, Animated } from 'react-native'; 
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { MOBILE_API_BASE_URL, MOBILE_SERVER_ROOT_URL } from "../config/apiConfigMobile"; 


const phases = ["Select Pet", "Select Service", "Schedule", "Summary"];

export default function BookingScreen({ navigation, route }) {
    const { user } = route.params;
    const [phaseIndex, setPhaseIndex] = useState(0);

    const [pets, setPets] = useState([]);
    const [loadingPets, setLoadingPets] = useState(true);
    const [selectedPetIds, setSelectedPetIds] = useState([]);
    const [services, setServices] = useState([
        { name: 'Consultation', selected: false },
        { name: 'Vaccination', selected: false },
        { name: 'Deworming', selected: false },
        { name: 'Grooming', selected: false },
        { name: 'Ultrasound', selected: false },
        { name: 'Confinement', selected: false },
        { name: 'Surgery', selected: false },
    ]);
    const [notes, setNotes] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for Toast
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const toastOpacity = useState(new Animated.Value(0))[0];

    const fetchPets = async () => {
        if (!user?.id) return;
        setLoadingPets(true);
        try {
            const response = await fetch(`${MOBILE_API_BASE_URL}/pets/${user.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch pets from server.");
            }
            
            setPets(data.map(p => ({...p, id: p.pet_id})));
        } catch (error) {
            Alert.alert("Error", "Could not load your pets. Please try again later.");
            console.error("Failed to fetch pets:", error);
        } finally {
            setLoadingPets(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchPets();
        }, [user])
    );
    
    useEffect(() => {
        if (showToast) {
            Animated.timing(toastOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(toastOpacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => {
                        setShowToast(false);
                        navigation.navigate('Dashboard');
                    });
                }, 2000);
            });
        }
    }, [showToast]);

    const handleNext = () => {
        if (phaseIndex === 0 && selectedPetIds.length === 0) return Alert.alert("Selection Required", "Please select at least one pet.");
        if (phaseIndex === 1 && services.every(s => !s.selected)) return Alert.alert("Selection Required", "Please select at least one service.");
        if (phaseIndex === 2 && (!selectedDate || !selectedTime)) return Alert.alert("Selection Required", "Please select a date and time.");

        if (phaseIndex < phases.length - 1) {
            setPhaseIndex(phaseIndex + 1);
        }
    };

    const handleBack = () => {
        if (phaseIndex > 0) {
            setPhaseIndex(phaseIndex - 1);
        } else {
            navigation.goBack();
        }
    };

    const togglePetSelection = (petId) => {
        setSelectedPetIds(prev =>
            prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
        );
    };

    const toggleSelectAllPets = () => {
        if (selectedPetIds.length === pets.length) {
            setSelectedPetIds([]);
        } else {
            setSelectedPetIds(pets.map(p => p.id));
        }
    };

    const toggleServiceSelection = (serviceName) => {
        setServices(prev =>
            prev.map(s => s.name === serviceName ? { ...s, selected: !s.selected } : s)
        );
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let i = 8; i < 18; i++) { 
            slots.push(`${String(i).padStart(2, '0')}:00`);
            slots.push(`${String(i).padStart(2, '0')}:30`);
        }
        return slots;
    };
    const timeSlots = generateTimeSlots();

    const handleConfirmBooking = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                user_id: user.id,
                pet_ids: selectedPetIds,
                services: services.filter(s => s.selected).map(s => s.name),
                notes,
                appointment_date: selectedDate,
                appointment_time: selectedTime,
            };

            const response = await fetch(`${MOBILE_API_BASE_URL}/appointment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const responseText = await response.text();

            if (!response.ok) {
                try {
                    const errorResult = JSON.parse(responseText);
                    throw new Error(errorResult.message || 'An unknown server error occurred.');
                } catch (e) {
                    throw new Error(`Server returned an invalid response. Status: ${response.status}`);
                }
            }

            setToastMessage('Booking Confirmed! Your appointment has been successfully scheduled.');
            setShowToast(true);

        } catch (error) {
            Alert.alert('Booking Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderPetSelection = () => (
        <>
            <View style={styles.listHeader}>
                <Text style={styles.title}>Select Pet(s)</Text>
                {pets.length > 0 && (
                    <TouchableOpacity onPress={toggleSelectAllPets}>
                        <Text style={styles.selectAllText}>
                            {selectedPetIds.length === pets.length ? 'Deselect All' : 'Select All'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {loadingPets ? <ActivityIndicator size="large" color="#E9590F" /> :
             pets.length === 0 ? <Text style={styles.emptyText}>No pets found. Please add a pet in your profile first.</Text> :
             pets.map(pet => (
                <TouchableOpacity key={pet.id} style={[styles.option, selectedPetIds.includes(pet.id) && styles.selectedOption]} onPress={() => togglePetSelection(pet.id)}>
                    <View style={styles.petInfoContainer}>
                        {pet.pet_image_url ? (
                            <Image source={{ uri: `${MOBILE_SERVER_ROOT_URL}${pet.pet_image_url}`}} style={styles.petImage} />
                        ) : (
                            <View style={styles.petAvatar}>
                                <Text style={styles.petAvatarText}>{(pet.pet_name || '?')[0]}</Text>
                            </View>
                        )}
                        <Text style={styles.optionText}>{pet.pet_name} <Text style={styles.petSpecies}>({pet.species})</Text></Text>
                    </View>
                    <Ionicons name={selectedPetIds.includes(pet.id) ? "checkbox" : "square-outline"} size={24} color="#E9590F" />
                </TouchableOpacity>
             ))
            }
        </>
    );

    const renderServiceSelection = () => (
        <>
            <Text style={styles.title}>Select Service(s)</Text>
            {services.map(service => (
                <TouchableOpacity key={service.name} style={[styles.option, service.selected && styles.selectedOption]} onPress={() => toggleServiceSelection(service.name)}>
                    <Text style={styles.optionText}>{service.name}</Text>
                    <Ionicons name={service.selected ? "checkbox" : "square-outline"} size={24} color="#E9590F" />
                </TouchableOpacity>
            ))}
            <Text style={styles.notesLabel}>Additional Notes (Optional)</Text>
            <TextInput style={styles.notesInput} value={notes} onChangeText={setNotes} placeholder="Any specific requests or concerns..." multiline placeholderTextColor="#999" />
        </>
    );

    const renderScheduleSelection = () => (
        <>
            <Text style={styles.title}>Select Date & Time</Text>
            <Calendar
                onDayPress={day => setSelectedDate(day.dateString)}
                markedDates={{ [selectedDate]: { selected: true, selectedColor: '#E9590F', selectedTextColor: '#fff' } }}
                minDate={new Date().toISOString().split('T')[0]}
                theme={{ todayTextColor: '#E9590F', arrowColor: '#E9590F' }}
                style={styles.calendar}
            />
            {selectedDate && (
                <>
                    <Text style={styles.timeTitle}>Available Times for {new Date(selectedDate + 'T00:00:00').toDateString()}</Text>
                    <View style={styles.timeContainer}>
                        {timeSlots.map(time => (
                            <TouchableOpacity key={time} style={[styles.timeSlot, selectedTime === time && styles.selectedTimeSlot]} onPress={() => setSelectedTime(time)}>
                                <Text style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}>{time}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}
        </>
    );

    const renderSummary = () => {
        const selectedPets = pets.filter(p => selectedPetIds.includes(p.id));
        const selectedServices = services.filter(s => s.selected);
        return (
            <>
                <Text style={styles.title}>Appointment Summary</Text>
                <View style={styles.summaryCard}>
                    <SummaryItem icon="paw" label="Pet(s)" value={selectedPets.map(p => p.pet_name).join(', ')} />
                    <SummaryItem icon="cut-outline" label="Service(s)" value={selectedServices.map(s => s.name).join(', ')} />
                    <SummaryItem icon="calendar-outline" label="Date" value={selectedDate} />
                    <SummaryItem icon="time-outline" label="Time" value={selectedTime} />
                    {notes ? <SummaryItem icon="document-text-outline" label="Notes" value={notes} /> : null}
                </View>
            </>
        );
    };
    
    const SummaryItem = ({ icon, label, value }) => (
        <View style={styles.summaryItem}>
            <Ionicons name={icon} size={20} color="#E9590F" style={styles.summaryIcon} />
            <View style={{flex: 1}}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={styles.summaryValue}>{value}</Text>
            </View>
        </View>
    );
    
    const renderPhase = () => {
        switch(phaseIndex) {
            case 0: return renderPetSelection();
            case 1: return renderServiceSelection();
            case 2: return renderScheduleSelection();
            case 3: return renderSummary();
            default: return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Book Appointment</Text>
                <View style={{width: 24}} />
            </View>

            <View style={styles.progressBarContainer}>
                {phases.map((phase, index) => (
                    <View key={phase} style={[styles.progressStep, index <= phaseIndex && styles.activeStep]}>
                        <Ionicons name={index < phaseIndex ? "checkmark" : "ellipse"} size={14} color="#fff" />
                    </View>
                ))}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {renderPhase()}
            </ScrollView>

            <View style={styles.footer}>
                {phaseIndex < phases.length - 1 ? (
                    <TouchableOpacity style={styles.footerButton} onPress={handleNext}>
                        <Text style={styles.footerButtonText}>Next</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={[styles.footerButton, isSubmitting && styles.disabledButton]} onPress={handleConfirmBooking} disabled={isSubmitting}>
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.footerButtonText}>Confirm Booking</Text>}
                    </TouchableOpacity>
                )}
            </View>

            {showToast && (
                <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
                    <Text style={styles.toastText}>{toastMessage}</Text>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F7FB' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold' },
    progressBarContainer: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
    progressStep: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
    activeStep: { backgroundColor: '#E9590F' },
    content: { padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    selectedOption: { borderColor: '#E9590F', backgroundColor: '#FFF7ED' },
    optionText: { fontSize: 16, fontWeight: '500' },
    petSpecies: { color: '#888' },
    petInfoContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    petImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
    petAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#FDE6D8', justifyContent: 'center', alignItems: 'center' },
    petAvatarText: { color: '#E9590F', fontSize: 18, fontWeight: 'bold' },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    selectAllText: { color: '#E9590F', fontWeight: '600' },
    emptyText: { textAlign: 'center', color: '#888', marginVertical: 20, fontSize: 15, paddingHorizontal: 20 },
    notesLabel: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 10 },
    notesInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, height: 100, textAlignVertical: 'top' },
    calendar: { borderRadius: 10, marginBottom: 20, elevation: 1, shadowColor: '#999', shadowOpacity: 0.1, shadowRadius: 5 },
    timeTitle: { fontSize: 18, fontWeight: '600', marginVertical: 10, textAlign: 'center' },
    timeContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    timeSlot: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 10, width: '30%', alignItems: 'center', marginBottom: 10, marginHorizontal: 5 },
    selectedTimeSlot: { backgroundColor: '#E9590F', borderColor: '#E9590F' },
    timeText: { color: '#333' },
    selectedTimeText: { color: '#fff', fontWeight: 'bold' },
    summaryCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15 },
    summaryItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    summaryIcon: { marginRight: 15, marginTop: 2 },
    summaryLabel: { fontSize: 14, color: '#888' },
    summaryValue: { fontSize: 16, fontWeight: '600', color: '#333' },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#ddd', backgroundColor: '#fff' },
    footerButton: { backgroundColor: '#E9590F', padding: 15, borderRadius: 10, alignItems: 'center' },
    footerButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#ccc' },
    toastContainer: {
        position: 'absolute',
        bottom: 100, // Adjust as needed to not overlap with footer/buttons
        left: 20,
        right: 20,
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        elevation: 5,
    },
    toastText: {
        color: 'white',
        fontSize: 14,
        textAlign: 'center',
    },
});
