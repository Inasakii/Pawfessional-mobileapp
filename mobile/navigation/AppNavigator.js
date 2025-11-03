// mobile/navigation/AppNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Dashboard from "../app/dashboard";
import Profile from "../app/profile";
import AppointmentCalendar from "../app/calendar";
import BookingScreen from "../app/BookingScreen";
import PetAdd from "../app/pet-add";
import PetInfo from "../app/pet-info";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ user, setUser }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard">
        {props => <Dashboard {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="BookingFlow" component={BookingScreen} />
      <Stack.Screen name="AppointmentCalendar" component={AppointmentCalendar}/>
      <Stack.Screen name="Profile">
        {props => <Profile {...props} user={user} setUser={setUser} />}
      </Stack.Screen>
      <Stack.Screen name="PetInfo">
        {props => <PetInfo {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="PetAdd">
        {props => <PetAdd {...props} user={user} />} 
      </Stack.Screen>
    </Stack.Navigator>
  );
}
