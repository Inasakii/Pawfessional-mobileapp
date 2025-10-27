import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../app/login";
import Register from "../app/register";
import Success from "../app/success"; // ✅ import it

const Stack = createNativeStackNavigator();

export default function AuthNavigator({ setUser }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {props => <Login {...props} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {props => <Register {...props} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="Success" component={Success} /> 
    </Stack.Navigator>
  );
}
