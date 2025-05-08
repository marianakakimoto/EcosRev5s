// App.js
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./src/contexts/ThemeContext";
import { FontSettingsProvider } from "./src/contexts/FontContext";
import LoadingScreen from "./src/screens/LoadingScreen";
import { AppStack, AuthStack } from "./src/configs/navigation";
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from "./src/contexts/AuthContext"; // ✅ Importar aqui

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
  });

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  if (isLoading || !fontsLoaded) {
    return (
      <AuthProvider> {/* ✅ Envolver também a tela de loading */}
        <ThemeProvider>
          <FontSettingsProvider>
            <PaperProvider>
              <LoadingScreen />
            </PaperProvider>
          </FontSettingsProvider>
        </ThemeProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider> {/* ✅ Isso permite o uso do useAuth() em qualquer lugar */}
      <ThemeProvider>
        <FontSettingsProvider>
          <PaperProvider>
            <NavigationContainer>
              <AppStack /> {/* ou <AuthStack /> se usar isAuthenticated do contexto */}
            </NavigationContainer>
          </PaperProvider>
        </FontSettingsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
