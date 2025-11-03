import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { MOBILE_API_BASE_URL } from "../config/apiConfigMobile";

const Label = ({ children, required }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{children}</Text>
    {required && <Text style={styles.requiredAsterisk}>*</Text>}
  </View>
);

export default function PetEdit({ navigation, route }) {
  const { pet, user } = route.params || {};
  const [petData, setPetData] = useState({
    pet_name: pet?.pet_name || "",
    species: pet?.species || "",
    breed: pet?.breed || "",
    gender: pet?.gender || "",
    age: pet?.age?.toString() || "",
    weight: pet?.weight?.toString() || "",
    notes: pet?.notes || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  if (!pet) {
    Alert.alert("Error", "Pet data not found. Please go back and try again.");
    navigation.goBack();
    return null;
  }

  const handleChange = (key, value) => {
    setPetData((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = async () => {
    const { pet_name, species, breed, gender } = petData;

    if (!pet_name || !species || !breed || !gender) {
      Alert.alert("Missing Fields", "Please fill in Pet Name, Species, Breed, and Gender.");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${MOBILE_API_BASE_URL}/pets/${pet.pet_id}`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...petData, 
          user_id: user?.id,
          age: petData.age || null,
          weight: petData.weight || null
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Pet details updated successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", result.message || "Failed to update pet details.");
      }
    } catch (error) {
      console.error("Error updating pet:", error);
      Alert.alert("Error", error.message || "Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer} 
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Pet Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <Label required>Pet Name</Label>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bulky"
            placeholderTextColor="#A0AEC0"
            value={petData.pet_name}
            onChangeText={(text) => handleChange("pet_name", text)}
          />

          <Label required>Species</Label>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dog, Cat"
            placeholderTextColor="#A0AEC0"
            value={petData.species}
            onChangeText={(text) => handleChange("species", text)}
          />

          <Label required>Breed</Label>
          <TextInput
            style={styles.input}
            placeholder="e.g., Bulldog"
            placeholderTextColor="#A0AEC0"
            value={petData.breed}
            onChangeText={(text) => handleChange("breed", text)}
          />

          <Label required>Gender</Label>
          <View style={styles.genderRow}>
            {["Male", "Female"].map((g) => (
              <TouchableOpacity
                key={g}
                style={[ styles.genderBtn, petData.gender === g && styles.genderSelected ]}
                onPress={() => handleChange("gender", g)}
              >
                <Text style={[ styles.genderText, petData.gender === g && { color: "#fff" } ]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label>Age (years)</Label>
          <TextInput
            style={styles.input}
            placeholder="e.g., 3"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            value={petData.age}
            onChangeText={(text) => handleChange("age", text)}
          />

          <Label>Weight (kg)</Label>
          <TextInput
            style={styles.input}
            placeholder="e.g., 13.5"
            placeholderTextColor="#A0AEC0"
            keyboardType="decimal-pad"
            value={petData.weight}
            onChangeText={(text) => handleChange("weight", text)}
          />

          <Label>Notes</Label>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Optional notes about your pet..."
            placeholderTextColor="#A0AEC0"
            multiline
            numberOfLines={4}
            value={petData.notes}
            onChangeText={(text) => handleChange("notes", text)}
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleUpdate} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="save-outline" size={22} color="#fff" />
              <Text style={styles.btnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F7FB"
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 20, 
    paddingBottom: 40 
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    marginBottom: 24,
    paddingVertical: 10,
  },
  headerTitle: { 
    fontSize: 22,
    fontWeight: "700", 
    color: "#2D3748"
  },
  form: { 
    marginBottom: 20 
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: { 
    fontWeight: "600", 
    color: "#4A5568",
    fontSize: 14,
  },
  requiredAsterisk: {
    color: '#E9590F',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '700'
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: '#2D3748',
  },
  genderRow: { 
    flexDirection: "row", 
    marginBottom: 16,
    gap: 10,
  },
  genderBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  genderSelected: { 
    backgroundColor: "#E9590F",
    borderColor: "#E9590F",
  },
  genderText: { 
    color: "#4A5568", 
    fontWeight: "bold",
    fontSize: 16,
  },
  textArea: { 
    height: 120, 
    textAlignVertical: "top" 
  },
  btn: {
    flexDirection: "row",
    backgroundColor: "#E9590F",
    padding: 16,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#E9590F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "bold", 
    marginLeft: 10,
    fontSize: 16,
  },
});