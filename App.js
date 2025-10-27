// App.js
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./mobile/navigation/RootNavigator";
import Toast from "react-native-toast-message"; 

export default function App() {
  const [user, setUser] = useState(null); // holds logged in user

  return (
    <>
      <NavigationContainer>
        <RootNavigator user={user} setUser={setUser} />
      </NavigationContainer>
      {/* ✅ Global Toast provider (must be outside navigation) */}
      <Toast />
    </>
  );
}
