//mobile/components
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, AppState, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DeleteAccountModal = ({ isVisible, onClose, onConfirm, isLoading }) => {
  const [countdown, setCountdown] = useState(5);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const timerRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (isVisible) {
      setIsButtonDisabled(true);
      setCountdown(5);
      
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isVisible]);

  useEffect(() => {
    if (countdown === 0) {
      clearInterval(timerRef.current);
      setIsButtonDisabled(false);
    }
  }, [countdown]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (isVisible) {
          setCountdown(5);
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
            Are you sure you want to delete your account? This action is irreversible and your account will be deleted permanently, are you sure?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isLoading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, (isButtonDisabled || isLoading) && styles.disabledButton]}
              onPress={onConfirm}
              disabled={isButtonDisabled || isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmButtonText}>
                {isButtonDisabled ? `Confirm (${countdown})` : 'Confirm'}
              </Text>}
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