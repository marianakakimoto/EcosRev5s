// components/PasswordModal.js (ou AuthModal.js)
import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableWithoutFeedback,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';

export default function PasswordModal({ isVisible, onClose, children, title }) {
    const theme = useTheme();
    const { fontSize } = useFontSettings();

    return (
        <Modal visible={isVisible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalContainer}>
                    <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.colors.primary, fontSize: fontSize.lg }]}>
                                    {title}
                                </Text>
                                <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
                                    <X size={24} color={theme.colors.text.primary} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.modalBody}>
                                {children}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        padding: 20,
        borderRadius: 15,
        width: '90%',
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontWeight: 'bold',
        flex: 1,
    },
    closeModalButton: {
        padding: 5,
    },
    modalBody: {
        // Estilos para o corpo do modal, se necessário
    },
});