// mobile/app/components/DeleteAccountModal.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DeleteAccountModal = ({ isVisible, onClose, onConfirm }) => {
  const [countdown, setCountdown] = useState(3);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const timerRef = useRef(null);
  const appState = useRef(AppState.currentState);

  // This effect manages the 3-second countdown timer
  useEffect(() => {
    if (isVisible) {
      setIsButtonDisabled(true);
      setCountdown(3);
      
      // Start a 1-second interval timer
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

    } else {
      // Clear any existing timer when the modal is closed
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current); // Cleanup on unmount
  }, [isVisible]);

  // This effect enables the button when the countdown reaches zero
  useEffect(() => {
    if (countdown === 0) {
      clearInterval(timerRef.current);
      setIsButtonDisabled(false);
    }
  }, [countdown]);

  // This effect resets the timer if the user backgrounds the app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isVisible) {
          // Reset timer if app comes to foreground while modal is visible
          setCountdown(3);
          setIsButtonDisabled(true);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isVisible]);

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning-outline" size={40} color="#D97706" />
          </View>
          <Text style={styles.title}>Confirm Deletion</Text>
          <Text style={styles.message}>
            Are you sure you want to delete your account? This action is irreversible and your account will be permanently deleted after 30 days.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, isButtonDisabled && styles.disabledButton]}
              onPress={onConfirm}
              disabled={isButtonDisabled}
            >
              <Text style={styles.confirmButtonText}>
                {isButtonDisabled ? `Confirm (${countdown})` : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#F87171',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DeleteAccountModal;