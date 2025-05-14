// Modificação para MainNavigation.js
import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { DrawerItemList } from "@react-navigation/drawer";

import HomeScreen from "../screens/HomeScreen";
import BeneficiosScreen from "../screens/BenefitsScreen";
import HistoricoScreen from "../screens/HistoryScreen";
import SobreScreen from "../screens/AboutScreen";
import PerfilScreen from "../screens/ProfileScreen";
import ConfigScreen from "../screens/ConfigScreen";
import QRCodeScannerScreen from "../screens/QRCodeScannerScreen";
import LoginScreen from "../screens/LoginScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import BottomNavigation from "../components/BottomNavigation";
import LogoutButton from "../components/LogoutButton";
import Header from "../components/header";
import { House, ArrowRightLeft, History, UserCog, Info, QrCode, LogIn } from "lucide-react-native";

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export function TabScreens() {
  return (
    <Tab.Navigator tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Início" }} />
      <Tab.Screen name="BeneficiosTab" component={BeneficiosScreen} options={{ title: "Troca" }} />
      <Tab.Screen name="HistoricoTab" component={HistoricoScreen} options={{ title: "Histórico" }} />
      <Tab.Screen name="SobreTab" component={SobreScreen} options={{ title: "Sobre" }} />
      <Tab.Screen name="PerfilTab" component={PerfilScreen} options={{ title: "Perfil" }} />
      <Tab.Screen name="ResetTab" component={ResetPasswordScreen} options={{ title: "Reset" }} />
    </Tab.Navigator>
  );
}

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: false,
          // Prevent going back to login
          gestureEnabled: false
        }}
      />
    </Stack.Navigator>
  );
}

export function AppStack() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.spacer} />
          <DrawerItemList {...props} />
          <LogoutButton />
        </SafeAreaView>
      )}
      screenOptions={{ header: () => <Header /> }}
    >
      <Drawer.Screen name="Main" component={TabScreens} options={{ title: "Início", drawerIcon: () => <House size={24} /> }} />
      <Drawer.Screen name="Perfil" component={TabScreens} options={{ drawerIcon: () => <UserCog size={24} /> }} />
      <Drawer.Screen name="Login" component={LoginScreen} options={{ title: "Entrar", drawerIcon: () => <LogIn size={24} /> }} />
      <Drawer.Screen name="Troca" component={TabScreens} options={{ drawerIcon: () => <ArrowRightLeft size={24} /> }} />
      <Drawer.Screen name="QrCode" component={QRCodeScannerScreen} options={{ drawerIcon: () => <QrCode size={24} /> }} />
      <Drawer.Screen name="Historico" component={TabScreens} options={{ drawerIcon: () => <History size={24} /> }} />
      <Drawer.Screen name="Sobre" component={TabScreens} options={{ drawerIcon: () => <Info size={24} /> }} />
      <Drawer.Screen name="Configurações" component={ConfigScreen} options={{ drawerIcon: () => <UserCog size={24} /> }} />
    </Drawer.Navigator>
  );
}

// Modificamos o fluxo para ter um Stack Navigator de alto nível
export function MainNavigation() {
  const { isAuthenticated } = useAuth();
  
  // Usamos um Stack Navigator principal para poder ter acesso a todas as telas
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="AppStack" component={AppStack} />
          {/* ResetPassword também precisa estar acessível quando autenticado */}
          <Stack.Screen 
            name="ResetPassword" 
            component={ResetPasswordScreen} 
            options={{ gestureEnabled: false }}
          />
        </>
      ) : (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  spacer: {
    height: 40,
  },
});