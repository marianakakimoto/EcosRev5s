// Modificação para LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native'; // Adicionado CommonActions
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { loginSchema } from '../utils/validationSchemas';
import AuthForm from '../components/AuthForm';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

// Create a base URL constant for your API
const API_BASE_URL = 'http://localhost:3000/api';

// Create an axios instance with the base URL
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000
});

export default function LoginScreen() {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const theme = useTheme();
    const { fontSize } = useFontSettings();
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);

    const handleLogin = async (values) => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // Login request
            const response = await api.post('/usuario/login', {
                email: values.email,
                senha: values.password,
            });

            const { access_token, redirect_url } = response.data;

            // Store the token
            await AsyncStorage.setItem('token', access_token);

            // Now check if the user needs to reset their password
            const userInfoResponse = await api.get('/usuario/me', {
                headers: { 'access-token': access_token }
            });

            // Se o usuário tem uma senha temporária (token de redefinição), redirecionar para a tela de redefinição de senha
            if (userInfoResponse.data.resetPasswordToken) {
                // Mostrar uma mensagem breve de sucesso
                alert('Login com senha temporária. Você precisa criar uma nova senha.');

                // Armazenar informações necessárias para a tela de redefinição de senha
                await AsyncStorage.setItem('user_email', values.email);

                // MODIFICAÇÃO AQUI: Usar o método de navegação correto
                // Para navegadores aninhados, precisamos usar um método diferente
                navigation.navigate('Main', { screen: 'ResetTab' });
            } else {
                // Fluxo normal de login - navegar para a tela apropriada com base no tipo de usuário
                alert('Login realizado com sucesso!');

                // Navegação para home
                navigation.navigate('Main', { screen: 'HomeTab' });
            }
        } catch (error) {
            console.error('Login error:', error);

            if (error.response?.data?.errors) {
                const mensagens = error.response.data.errors.map(err => err.msg).join('\n');
                setErrorMessage(mensagens);
                alert(`Erro no login:\n${mensagens}`);
            } else {
                setErrorMessage('Erro de conexão com o servidor.');
                alert('Erro de conexão com o servidor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const loginFields = [
        {
            name: 'email',
            label: 'Email',
            autoCapitalize: 'none',
            keyboardType: 'email-address'
        },
        {
            name: 'password',
            label: 'Senha',
            secureTextEntry: !showPassword
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.xl }]}>Login</Text>

            {errorMessage && (
                <Text style={[styles.errorMessage, { color: theme.colors.error, fontSize: fontSize.sm }]}>
                    {errorMessage}
                </Text>
            )}

            <AuthForm
                initialValues={{ email: '', password: '' }}
                validationSchema={loginSchema}
                onSubmit={handleLogin}
                fields={loginFields}
                isPasswordVisible={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
            >
                {({ handleSubmit }) => (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={theme.colors.text.inverse} />
                        ) : (
                            <Text style={[styles.buttonText, { color: theme.colors.text.inverse, fontSize: fontSize.md }]}>
                                Entrar
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </AuthForm>

            <TouchableOpacity
                onPress={() => setIsForgotPasswordModalVisible(true)}
                style={styles.forgotPasswordLink}
            >
                <Text style={[styles.forgotPasswordText, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>
                    Esqueceu sua senha?
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setIsRegisterModalVisible(true)}
                style={styles.link}
            >
                <Text style={[styles.linkText, { color: theme.colors.primary, fontSize: fontSize.sm }]}>
                    Não tem uma conta? Cadastre-se
                </Text>
            </TouchableOpacity>

            {/* Modal para o formulário de Cadastro */}
            <Modal
                visible={isRegisterModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsRegisterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsRegisterModalVisible(false)}>
                                <Text style={{ color: theme.colors.primary, fontSize: fontSize.md }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <RegisterForm onClose={() => setIsRegisterModalVisible(false)} />
                    </View>
                </View>
            </Modal>

            {/* Modal para o formulário de Recuperação de Senha */}
            <Modal
                visible={isForgotPasswordModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsForgotPasswordModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsForgotPasswordModalVisible(false)}>
                                <Text style={{ color: theme.colors.primary, fontSize: fontSize.md }}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ForgotPasswordForm onClose={() => setIsForgotPasswordModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        fontWeight: 'bold',
    },
    link: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {},
    forgotPasswordLink: {
        marginTop: 15,
        alignItems: 'flex-end',
    },
    forgotPasswordText: {},
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        borderRadius: 10,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    modalTitle: {
        fontWeight: 'bold',
    }
});