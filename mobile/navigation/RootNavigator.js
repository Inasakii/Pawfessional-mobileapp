// mobile/navigation/RootNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import TermsScreen from '../app/TermsScreen'; 
import PrivacyPolicyScreen from '../app/PrivacyPolicyScreen'; 
import PetEdit from '../app/pet-edit';

const Stack = createNativeStackNavigator();

const RootNavigator = ({ user, setUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="App">
            {props => <AppNavigator {...props} user={user} setUser={setUser} />}
          </Stack.Screen>
          {/* Add screens accessible when logged in, but outside the tab navigator */}
          <Stack.Screen name="TermsScreen" component={TermsScreen} />
          <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
          <Stack.Screen name="PetEdit" component={PetEdit} />
        </>
      ) : (
        <Stack.Screen name="Auth">
          {props => <AuthNavigator {...props} setUser={setUser} />}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;