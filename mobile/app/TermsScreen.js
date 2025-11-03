import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TermsScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentCard}>
          <Text style={styles.date}>Last updated: October 30, 2025</Text>
          
          <Text style={styles.paragraph}>
            Please read these terms and conditions carefully before using Our Service.
          </Text>

          <Text style={styles.heading}>Interpretation and Definitions</Text>
          <Text style={styles.paragraph}>
            The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </Text>

          <Text style={styles.heading}>Acknowledgment</Text>
          <Text style={styles.paragraph}>
            These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
          </Text>
          <Text style={styles.paragraph}>
            Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
          </Text>

          <Text style={styles.heading}>User Accounts</Text>
          <Text style={styles.paragraph}>
            When You create an account with Us, You must provide Us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of Your account on Our Service.
          </Text>

          <Text style={styles.heading}>Appointments and Services</Text>
          <Text style={styles.paragraph}>
            Our application allows you to book appointments for veterinary services. While we strive to honor all appointments, scheduling conflicts may arise. We reserve the right to cancel or reschedule appointments and will make a reasonable effort to notify you in advance. All services are provided by licensed professionals.
          </Text>

          <Text style={styles.heading}>Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend Your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
          </Text>

          <Text style={styles.heading}>Governing Law</Text>
          <Text style={styles.paragraph}>
            The laws of the Philippines, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service.
          </Text>

          <Text style={styles.heading}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms and Conditions, You can contact us by email at support@pawfessional.com.
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

export default TermsScreen;
