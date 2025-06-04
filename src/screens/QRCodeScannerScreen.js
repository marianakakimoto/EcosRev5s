//src\screens\QRCodeScannerScreen.js
import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import CustomAlert from '../components/CustomAlert';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from "@env";

export default function QRCodeScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [scannedData, setScannedData] = useState({ pontos: 0, hash: null, error: null });
  const theme = useTheme();
  const { fontSize, fontFamily } = useFontSettings();
  const [token, setToken] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    AsyncStorage.getItem('token').then(setToken);
  }, []);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.permissionText, { color: theme.colors.text.primary, fontSize: fontSize.md, fontFamily }]}>
          Precisamos de permissão para usar a câmera
        </Text>
        <Button
          onPress={requestPermission}
          title="Permitir Câmera"
          color={theme.colors.primary}
        />
      </View>
    );
  }

  const fetchUserPoints = async () => {
    if (!token) return 0;

    try {
      const response = await axios.get(`${API_URL}/usuario/pontos`, {
        headers: { "access-token": token }
      });

      if (response.data && response.data.length > 0) {
        return response.data[0].pontos;
      }
    } catch (error) {
      console.error("Error fetching user points:", error);
    }

    return 0;
  };

  const updateUserPoints = async (pontos, hash) => {
    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    try {
      const currentPoints = await fetchUserPoints();
      const newPoints = currentPoints + pontos;

      // Atualiza pontos do usuário
      const response = await axios.put(
        `${API_URL}/usuario/pontos`,
        { pontos: newPoints },
        { headers: { "access-token": token } }
      );

      if (response.status !== 200) {
        throw new Error("Erro ao atualizar pontos do usuário");
      }

      // Salva no histórico
      const histResponse = await fetch("http://localhost:4000/hist/pontos", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _id: await AsyncStorage.getItem('user'),
          pontos: pontos,
          hash: hash,
        }),
      });

      if (!histResponse.ok) {
        console.warn(`Erro ao salvar no histórico: ${histResponse.status}`);
        // Não lança erro aqui pois os pontos já foram atualizados
      } else {
        const histData = await histResponse.json();
        console.log('Histórico salvo:', histData);
      }

    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
      throw new Error("Erro ao processar pontos. Tente novamente.");
    }
  };



  const handleBarCodeScanned = async ({ data }) => {
    try {
      console.log("Dados brutos do QR Code:", data);
      
      // Verifica se os dados não estão vazios
      if (!data || data.trim() === '') {
        throw new Error("QR Code vazio ou inválido");
      }

      // Tenta fazer parse do JSON
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (parseError) {
        console.error("Erro ao fazer parse do JSON:", parseError);
        throw new Error("QR Code não contém dados válidos");
      }

      // Valida se os campos obrigatórios existem
      if (!parsedData.hash || !parsedData.pontos) {
        throw new Error("QR Code não contém as informações necessárias (hash e pontos)");
      }

      // Valida se pontos é um número válido
      const pontos = Number(parsedData.pontos);
      if (isNaN(pontos) || pontos <= 0) {
        throw new Error("Valor de pontos inválido no QR Code");
      }

      setScanned(true);
      setScannedData({
        ...parsedData,
        pontos: pontos
      });

      console.log("Hash:", parsedData.hash);
      console.log("Pontos:", pontos);

      await updateUserPoints(pontos, parsedData.hash);
      setAlertVisible(true);
      
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);
      setScanned(true);
      
      // Mostra um alert de erro para o usuário
      setScannedData({
        pontos: 0,
        error: error.message
      });
      setAlertVisible(true);
    }
  };



  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Botão de voltar */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons 
          name="arrow-back" 
          size={24} 
          color={theme.colors.text.primary} 
        />
      </TouchableOpacity>

      <CameraView
        style={styles.camera}
        facing="back"
        barCodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <Text style={[styles.overlayText, { fontSize: fontSize.md, fontFamily, color: theme.colors.text.primary }]}>
            Posicione o QR Code dentro da área
          </Text>
        </View>
      </CameraView>

      <CustomAlert
        visible={alertVisible}
        title={scannedData.error ? "Erro no QR Code" : "QR Code Escaneado"}
        message={scannedData.error ? scannedData.error : `Você recebeu ${scannedData.pontos} pontos!`}
        onClose={() => {
          setAlertVisible(false);
          setScanned(false);
          if (!scannedData.error) {
            navigation.navigate('Main', { screen: 'HomeTab' });
          }
        }}
        onConfirm={() => {
          setAlertVisible(false);
          setScanned(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontWeight: 'bold',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 20,
  },
});
