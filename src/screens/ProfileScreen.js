import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { User, CirclePower, Key } from 'lucide-react-native';
import CustomAlert from '../components/CustomAlert';
import PasswordModal from '../components/PasswordModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';


export default function ProfileScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const { fontSize } = useFontSettings();
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    profileImage: '',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para os CustomAlerts
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
    confirmColor: '',
    showCancelButton: true,
  });

useFocusEffect(
  React.useCallback(() => {
    fetchUserData();
  }, [])
);


  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/usuario/me', {
        headers: {
          'Content-Type': 'application/json',
          'access-token': await AsyncStorage.getItem('token')
        },
      });
  
      if (!response.ok) {
        throw new Error('Erro ao buscar usuário');
      }
      const data = await response.json();
      const user = Array.isArray(data.results) ? data.results[0] : data; // adapte se a estrutura do retorno for diferente
  
      setUserData({
        nome: user.nome,
        email: user.email,
        profileImage: 'https://randomuser.me/api/portraits/lego/1.jpg',
      });
    } catch (error) {
      console.error('Erro ao obter os dados do usuário:', error);
      setUserData({
        nome: "",
        email: "",
        profileImage: "",
      });
      showAlert({
        title: 'Erro',
        message: 'Não foi possível carregar os dados do perfil.',
        confirmText: 'OK',
        confirmColor: theme.colors.error,
        showCancelButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  // Função genérica para mostrar alertas, agora com controle de botão único
  const showAlert = ({
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancelar',
    onConfirm = () => {},
    confirmColor = theme.colors.primary,
    showCancelButton = true
  }) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
      confirmColor,
      showCancelButton,
      onConfirm: () => {
        setAlertConfig((prev) => ({ ...prev, visible: false }));
        onConfirm();
      }
    });
  };

  const handleLogout = () => {
    showAlert({
      title: 'Confirmar Saída',
      message: 'Tem certeza que deseja sair da conta?',
      confirmText: 'Sair',
      cancelText: 'Cancelar',
      confirmColor: theme.colors.error,
      onConfirm: () => navigation.navigate('Login'),
      showCancelButton: true
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      style={{ backgroundColor: theme.colors.background }}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.shadow }]}>
          <View style={styles.header}>
            {isLoading ? (
              <View style={[styles.userImagePlaceholder, { backgroundColor: theme.colors.border }]} />
            ) : userData.profileImage ? (
              <Image source={{ uri: userData.profileImage }} style={styles.userImage} />
            ) : (
              <View style={[styles.userImagePlaceholder, { backgroundColor: theme.colors.primary }]}>
                <User size={60} color={theme.colors.text.inverse} />
              </View>
            )}
            <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.lg }]}>
              Perfil do Usuário
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontSize: fontSize.md }]}>
              Nome
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text.primary,
                  fontSize: fontSize.md,
                  backgroundColor: theme.colors.background
                }
              ]}
              value={userData.nome}
              placeholder="Nome"
              placeholderTextColor={theme.colors.text.secondary}
              onChangeText={(text) => setUserData({ ...userData, nome: text })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.secondary, fontSize: fontSize.md }]}>
              E-mail
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.colors.border,
                  color: theme.colors.text.primary,
                  fontSize: fontSize.md,
                  backgroundColor: theme.colors.background
                }
              ]}
              value={userData.email}
              placeholder="E-mail"
              placeholderTextColor={theme.colors.text.secondary}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={[styles.passwordContainer, { backgroundColor: theme.colors.cardAlt || theme.colors.surface }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowPasswordModal(true)}
            >
              <Key size={24} color={theme.colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={[styles.buttonText, { color: theme.colors.text.inverse, fontSize: fontSize.md }]}>
                Alterar Senha
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: theme.colors.error }]}
          onPress={handleLogout}
        >
          <CirclePower size={24} color={theme.colors.error} />
          <Text style={[styles.logoutText, { color: theme.colors.error, fontSize: fontSize.md }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <PasswordModal
        isVisible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSave={() => {
          // Lógica para salvar a senha (você pode passar uma função aqui)
          showAlert({
            title: 'Sucesso',
            message: 'Senha alterada com sucesso.',
            confirmColor: theme.colors.sucess,
            showCancelButton: false,
          });
          setShowPasswordModal(false);
        }}
        theme={theme}
        fontSize={fontSize}
        showAlert={showAlert}
      />

      {/* CustomAlert Component */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        onConfirm={alertConfig.onConfirm}
        confirmColor={alertConfig.confirmColor}
        showCancelButton={alertConfig.showCancelButton}
        singleButtonText={alertConfig.confirmText || "OK"}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  passwordContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 2,
  },
  logoutText: {
    marginLeft: 10,
    fontWeight: 'bold',
  },
});