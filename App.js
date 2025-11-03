// App.js
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./mobile/navigation/RootNavigator";
import Toast from "react-native-toast-message";
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator, StyleSheet } from 'react-native';


export default function App() {
  const [user, setUser] = useState(null); // holds logged in user
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Check for a saved user session when the app starts
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const userSession = await SecureStore.getItemAsync('userSession');
        if (userSession) {
          const savedUser = JSON.parse(userSession);
          console.log("Found saved user session:", savedUser);
          setUser(savedUser);
        } else {
          console.log("No user session found.");
        }
      } catch (error) {
        console.error("Could not load user session", error);
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkUserSession();
  }, []);

  // Display a loading screen while checking for authentication
  if (isAuthenticating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E9590F" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <RootNavigator user={user} setUser={setUser} />
      </NavigationContainer>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  }
});