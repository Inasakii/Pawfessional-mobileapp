import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentCard}>
          <Text style={styles.date}>Last updated: October 30, 2025</Text>
          
          <Text style={styles.paragraph}>
            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
          </Text>

          <Text style={styles.heading}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            We may collect personally identifiable information, including but not limited to your name, email address, and phone number. We also collect information about your pets that you provide, such as name, species, and breed.
          </Text>

          <Text style={styles.heading}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to provide and maintain our Service, including to schedule and manage appointments. We may use your information to contact you with updates, marketing, or promotional materials.
          </Text>

          <Text style={styles.heading}>Data Security</Text>
          <Text style={styles.paragraph}>
            The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
          </Text>

          <Text style={styles.heading}>User Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to access, update, or delete the information we have on you. You can do this through your account profile settings within the application. If you wish to permanently delete your account, you may do so from the Settings screen.
          </Text>
          
          <Text style={styles.heading}>Changes to this Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
          </Text>
          
          <Text style={styles.heading}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, You can contact us by email at support@pawfessional.com.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  date: { fontSize: 12, color: '#888', marginBottom: 20 },
  heading: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#333' },
  paragraph: { fontSize: 14, lineHeight: 22, color: '#555' },
});

export default PrivacyPolicyScreen;
