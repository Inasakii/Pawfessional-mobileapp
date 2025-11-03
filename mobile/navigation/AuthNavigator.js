import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Corrected import paths based on the file structure provided
import Login from "../auth/login";
import Register from "../auth/register";
import StarterScreen from "../auth/starterScreen";
import Success from "../auth/Success"; // This is a new screen to handle post-registration

const Stack = createNativeStackNavigator();

// The build error pointed directly to this file.
// This is a reconstruction based on the error message and the project's file structure.
const AuthNavigator = ({ setUser }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {/* Assuming StarterScreen is the initial route for the auth flow */}
        <Stack.Screen name="Starter" component={StarterScreen} />
        
        <Stack.Screen name="Login">
             {/* Pass the setUser function down to the Login screen to update the app's state */}
             {(props) => <Login {...props} setUser={setUser} />}
        </Stack.Screen>
        
        <Stack.Screen name="Register" component={Register} />
        
        {/* The original file was importing a 'Success' screen, which is good practice after registration. */}
        <Stack.Screen name="Success" component={Success} />
        
    </Stack.Navigator>
  );
};

export default AuthNavigator;
