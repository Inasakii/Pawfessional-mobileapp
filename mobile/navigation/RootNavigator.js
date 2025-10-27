// mobile/navigation/RootNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../auth/login";
import Register from "../auth/register";
import StarterScreen from "../auth/starterScreen";
import AppNavigator from "./AppNavigator";
import ForgotPassword from "../auth/ForgotPassword"; // Import the new screen

const Stack = createNativeStackNavigator();

export default function RootNavigator({ user, setUser }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // If logged in → show App stack (pass user & setUser down)
        <Stack.Screen name="App">
          {props => <AppNavigator {...props} user={user} setUser={setUser} />}
        </Stack.Screen>
      ) : (
        
        <>
          <Stack.Screen name="StarterScreen" component={StarterScreen} />
          <Stack.Screen name="Login">
            {props => <Login {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="Register">
            {props => <Register {...props} setUser={setUser} />}
          </Stack.Screen>
          {/* Add the new screen to the auth stack */}
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        </>
      )}
    </Stack.Navigator>
  );
}
