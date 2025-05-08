// src\screens\LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';
import { loginSchema } from '../utils/validationSchemas';
import AuthForm from '../components/AuthForm';
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [showPassword, setShowPassword] = useState(false);
    const [loginSuccessTemporaryPassword, setLoginSuccessTemporaryPassword] = useState(false);
    const theme = useTheme();
    const { fontSize } = useFontSettings();
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [isForgotPasswordModalVisible, setIsForgotPasswordModalVisible] = useState(false);

    const handleLogin = async (values) => {
        try {
            const response = await axios.post('http://localhost:3000/api/usuario/login', {
                email: values.email,
                senha: values.password,
            });

            const { access_token, redirect_url } = response.data;
            console.log(response.data);

            await AsyncStorage.setItem('token', access_token);
            alert('Login realizado com sucesso!');

            if (values.password.startsWith('TEMP_')) {
                alert('Login com senha temporária realizado com sucesso.');
                setLoginSuccessTemporaryPassword(true);
            } else {
                if (redirect_url === 'menu.html') { //menu.html == admin / menuUser.html == cliente
                    navigation.navigate('Main', { screen: 'HomeTab' });
                } else {
                    navigation.navigate('Main', { screen: 'HomeTab' });
                }
            }

        } catch (error) {
            if (error.response?.data?.errors) {
                const mensagens = error.response.data.errors.map(err => err.msg).join('\n');
                alert(`Erro no login:\n${mensagens}`);
            } else {
                alert('Erro de conexão com o servidor.');
            }
        }
    };

    useEffect(() => {
        if (loginSuccessTemporaryPassword) {
            setTimeout(() => {
                navigation.navigate('Perfil');
                setLoginSuccessTemporaryPassword(false);
            }, 1500);
        }
    }, [loginSuccessTemporaryPassword, navigation]);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const loginFields = [
        { name: 'email', label: 'Email' },
        { name: 'password', label: 'Senha', secureTextEntry: !showPassword },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.title, { color: theme.colors.primary, fontSize: fontSize.xl }]}>Login</Text>

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
                    >
                        <Text style={[styles.buttonText, { color: theme.colors.text.inverse, fontSize: fontSize.md }]}>
                            Entrar
                        </Text>
                    </TouchableOpacity>
                )}
            </AuthForm>

            <TouchableOpacity
                onPress={() => setIsForgotPasswordModalVisible(true)}
                style={styles.forgotPasswordLink}
            >
                <Text style={[styles.forgotPasswordText, { color: theme.colors.text.secondary, fontSize: fontSize.sm }]}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setIsRegisterModalVisible(true)}
                style={styles.link}
            >
                <Text style={[styles.linkText, { color: theme.colors.primary, fontSize: fontSize.sm }]}>Não tem uma conta? Cadastre-se</Text>
            </TouchableOpacity>

            {loginSuccessTemporaryPassword && (
                <Text style={{ marginTop: 10, textAlign: 'center', color: theme.colors.primary, fontSize: fontSize.sm }}>
                    Redirecionando para o Perfil para alterar a senha...
                </Text>
            )}

            {/* Modal para o formulário de Cadastro */}
            <Modal
                visible={isRegisterModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsRegisterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, {backgroundColor: theme.colors.background}]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsRegisterModalVisible(false)}>
                                <Text style={{color: theme.colors.primary, fontSize: fontSize.md}}>✕</Text>
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
                    <View style={[styles.modalContent, {backgroundColor: theme.colors.background}]}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setIsForgotPasswordModalVisible(false)}>
                                <Text style={{color: theme.colors.primary, fontSize: fontSize.md}}>✕</Text>
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