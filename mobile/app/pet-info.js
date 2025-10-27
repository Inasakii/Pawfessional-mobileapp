
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Image 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const SERVER_URL = 'http://192.168.100.12:5000';

export default function PetInfo({ navigation, route }) {
  const { user } = route.params; 
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPets();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPets = async () => {
    if (!user || !user.id) {
      Alert.alert("Error", "User not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/mobile/pets/${user.id}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setPets(data);
      } else {
        Alert.alert("Error", data.message || "Unexpected response from server.");
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      Alert.alert("Error", "Could not fetch pets from the server.");
    } finally {
      setLoading(false);
    }
  };

  const DetailRow = ({ icon, text }) => (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={16} color="#718096" style={styles.detailIcon} />
      <Text style={styles.petDetails}>{text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Pets</Text>
        <TouchableOpacity onPress={fetchPets} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#E9590F" style={{ marginTop: 50 }} />
        ) : pets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="paw-outline" size={60} color="#CBD5E0" />
            <Text style={styles.noPetsText}>No pets found.</Text>
            <Text style={styles.noPetsSubText}>Tap the button below to add your first pet!</Text>
          </View>
        ) : (
          pets.map((pet) => (
            <View key={pet.pet_id} style={styles.petCard}>
              <View style={styles.petCardHeader}>
                {pet.pet_image_url ? (
                  <Image source={{ uri: `${SERVER_URL}${pet.pet_image_url}`}} style={styles.petImage} />
                ) : (
                  <View style={styles.petAvatar}>
                    <Text style={styles.petAvatarText}>{(pet.pet_name || '?')[0].toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.petInfo}>
                  <Text style={styles.petName}>{pet.pet_name}</Text>
                  <Text style={styles.petBreed}>{pet.species} • {pet.breed}</Text>
                </View>
              </View>
              <View style={styles.detailsContainer}>
                <DetailRow icon="male-female-outline" text={pet.gender || 'N/A'} />
                <DetailRow icon="calendar-outline" text={pet.age !== null ? `${pet.age} ${pet.age === 1 ? 'yr' : 'yrs'}` : 'N/A'} />
                <DetailRow icon="barbell-outline" text={pet.weight !== null ? `${pet.weight} kg` : 'N/A'} />
              </View>
              {pet.notes ? (
                <Text style={styles.notes}>Notes: {pet.notes}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addBtn} 
        onPress={() => navigation.navigate("PetAdd", { user })}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addBtnText}>Add New Pet</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FB" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 22, fontWeight: "700", color: '#2D3748' },
  refreshButton: { padding: 5 },
  scrollContainer: { padding: 20, paddingBottom: 120 },
  petCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#2D3748",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  petCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: '#E2E8F0'
  },
  petAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petAvatarText: {
    color: '#E9590F',
    fontSize: 22,
    fontWeight: 'bold',
  },
  petInfo: {
    flex: 1,
  },
  petName: { fontSize: 18, fontWeight: "bold", color: "#2D3748" },
  petBreed: { fontSize: 14, color: "#718096" },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    marginRight: 8,
  },
  petDetails: { fontSize: 14, color: "#4A5568" },
  notes: { fontSize: 13, color: "#718096", marginTop: 12, fontStyle: "italic", paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  noPetsText: { fontSize: 18, fontWeight: '600', color: "#A0AEC0", marginTop: 16 },
  noPetsSubText: { textAlign: "center", color: "#CBD5E0", marginTop: 8 },
  addBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    left: 20,
    backgroundColor: "#E9590F",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#E9590F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addBtnText: { color: "#fff", marginLeft: 8, fontWeight: "bold", fontSize: 16 },
});
