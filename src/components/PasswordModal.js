// components/PasswordModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { Eye, EyeOff, Save, X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSettings } from '../contexts/FontContext';

export default function PasswordModal({
  visible,
  onClose,
  onSave,
  passwordAtual,
  novaSenha,
  confirmarNovaSenha,
  setPasswordAtual,
  setNovaSenha,
  setConfirmarNovaSenha,
  showPasswordAtual,
  showNovaSenha,
  showConfirmarNovaSenha,
  setShowPasswordAtual,
  setShowNovaSenha,
  setShowConfirmarNovaSenha,
}) {
  const theme = useTheme();
  const { fontSize } = useFontSettings();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.primary, fontSize: fontSize.lg }]}>
                  Alterar Senha
                </Text>
                <TouchableOpacity style={styles.closeModalButton} onPress={onClose}>
                  <X size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Campos de senha */}
              {[{
                label: 'Senha Atual',
                value: passwordAtual,
                setValue: setPasswordAtual,
                show: showPasswordAtual,
                setShow: setShowPasswordAtual,
                placeholder: 'Digite sua senha atual',
              }, {
                label: 'Nova Senha',
                value: novaSenha,
                setValue: setNovaSenha,
                show: showNovaSenha,
                setShow: setShowNovaSenha,
                placeholder: 'Digite sua nova senha',
              }, {
                label: 'Confirmar Nova Senha',
                value: confirmarNovaSenha,
                setValue: setConfirmarNovaSenha,
                show: showConfirmarNovaSenha,
                setShow: setShowConfirmarNovaSenha,
                placeholder: 'Confirme sua nova senha',
              }].map((field, index) => (
                <View key={index} style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.colors.text.secondary, fontSize: fontSize.md }]}>
                    {field.label}
                  </Text>
                  <View style={[styles.passwordInputContainer, { borderColor: theme.colors.border }]}>
                    <TextInput
                      style={[styles.passwordInput, { color: theme.colors.text.primary, fontSize: fontSize.md }]}
                      placeholder={field.placeholder}
                      placeholderTextColor={theme.colors.text.secondary}
                      secureTextEntry={field.show}
                      value={field.value}
                      onChangeText={field.setValue}
                    />
                    <TouchableOpacity style={styles.eyeIcon} onPress={() => field.setShow(!field.show)}>
                      {field.show ? (
                        <EyeOff size={20} color={theme.colors.text.secondary} />
                      ) : (
                        <Eye size={20} color={theme.colors.text.secondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={onSave}
              >
                <Save size={24} color={theme.colors.text.inverse} style={{ marginRight: 8 }} />
                <Text style={[styles.buttonText, { color: theme.colors.text.inverse, fontSize: fontSize.md }]}>
                  Salvar Senha
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Copie os estilos do seu modal atual aqui
});