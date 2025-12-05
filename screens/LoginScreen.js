// screens/LoginScreen.js
// Pantalla de login y registro con Firebase Auth
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  ScrollView 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { loginUser, registerUser } from '../services/authFirestore';

export default function LoginScreen({ navigation, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const result = await loginUser(email.trim(), password);
      if (result.success) {
        if (onLogin) onLogin();
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={['#8B0000', '#6B0000', '#4A0000']}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo/Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-done" size={60} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>TodoApp</Text>
            <Text style={styles.subtitle}>
              Inicia sesión para continuar
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8B0000" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#C7C7CC"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#8B0000" style={styles.inputIcon} />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#C7C7CC"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#8B0000" 
                />
              </TouchableOpacity>
            </View>

            {/* Botón principal */}
            <TouchableOpacity 
              style={[styles.button, loading && styles.buttonDisabled]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#999', '#777'] : ['#FFFFFF', '#F8F9FA']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <Text style={styles.buttonText}>Cargando...</Text>
                ) : (
                  <>
                    <Ionicons 
                      name="log-in-outline" 
                      size={20} 
                      color="#8B0000" 
                      style={{ marginRight: 8 }} 
                    />
                    <Text style={styles.buttonText}>
                      Iniciar Sesión
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Info adicional */}
          <View style={styles.footer}>
            <View style={styles.featureRow}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.featureText}>Tus datos están protegidos</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="cloud-done" size={16} color="rgba(255,255,255,0.7)" />
              <Text style={styles.featureText}>Sincronización en tiempo real</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  gradient: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 80
  },
  header: {
    alignItems: 'center',
    marginBottom: 48
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)'
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -2
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    letterSpacing: 0.3
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFAF0',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#F5DEB3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500'
  },
  button: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B0000',
    letterSpacing: 0.5
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500'
  }
});
