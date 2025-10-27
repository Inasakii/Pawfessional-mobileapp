
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

const SERVER_URL = 'http://192.168.100.12:5000';

const Label = ({ children, required }) => (
  <View style={styles.labelContainer}>
    <Text style={styles.label}>{children}</Text>
    {required && <Text style={styles.requiredAsterisk}>*</Text>}
  </View>
);

export default function PetAdd({ navigation, route }) {
  const { user } = route.params || {};
  const [petData, setPetData] = useState({
    pet_name: "",
    species: "",
    breed: "",
    gender: "",
    age: "",
    weight: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key, value) => {
    setPetData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const { pet_name, species, breed, gender } = petData;

    if (!pet_name || !species || !breed || !gender) {
      Alert.alert("Missing Fields", "Please fill in Pet Name, Species, Breed, and Gender.");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`${SERVER_URL}/api/mobile/pets/add`, {
        method: "POST",
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

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("JSON Parse error on server response:", responseText);
        throw new Error("Received an invalid response from the server.");
      }

      if (response.ok) {
        Alert.alert("Success", "Pet registered successfully!");
        navigation.goBack();
      } else {
        Alert.alert("Error", result.message || "Failed to save pet.");
      }
    } catch (error) {
      console.error("Error adding pet:", error);
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
          <Text style={styles.headerTitle}>Add New Pet</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
          <View style={styles.imagePickerDisabled}>
              <Ionicons name="camera-outline" size={30} color="#A0AEC0" />
              <Text style={styles.imagePickerTextDisabled}>Photo Upload</Text>
          </View>

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

        <TouchableOpacity style={styles.btn} onPress={handleSave} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="paw-outline" size={22} color="#fff" />
              <Text style={styles.btnText}>Save Pet</Text>
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
  imagePickerDisabled: {
    height: 120,
    width: 120,
    borderRadius: 60,
    backgroundColor: '#E8EAF0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#D6D9E0',
    borderStyle: 'dashed',
  },
  imagePickerTextDisabled: {
    marginTop: 8,
    color: '#A0AEC0',
    fontWeight: '600'
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
