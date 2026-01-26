import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[Colors.light.backgroundGradientStart, Colors.light.backgroundGradientMiddle, Colors.light.backgroundGradientEnd]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo & Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="shopping-bag" size={32} color={Colors.light.primary} />
              <Text style={styles.logoText}>Serendipity</Text>
            </View>
            
            <View style={styles.badge}>
              <Text style={styles.badgeIcon}>🛒</Text>
              <Text style={styles.badgeText}>Customer account</Text>
            </View>
          </View>

          {/* Login Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your Serendipity account</Text>

            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.passwordHeader}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <MaterialIcons 
                      name={showPassword ? "visibility-off" : "visibility"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Sign In</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Placeholder (Google) */}
            <TouchableOpacity 
              style={styles.socialButton}
              onPress={async () => {
                try {
                  await useAuthStore.getState().loginWithGoogle();
                  router.replace('/(tabs)');
                } catch (error: any) {
                  Alert.alert('Google Login Failed', error.message);
                }
              }}
            >
              <MaterialIcons name="g-translate" size={20} color="#4285F4" /> 
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Create account</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Seller Link */}
             <View style={styles.sellerSection}>
              <View style={styles.sellerContent}>
                <Text style={styles.sellerTitle}>Sell on Serendipity</Text>
                <Text style={styles.sellerSubtitle}>Manage products & orders</Text>
              </View>
              <TouchableOpacity 
                style={styles.sellerButton}
                onPress={() => import('@/services/auth').then(m => m.authManager.openSellerPortal())}
              >
                <Text style={styles.sellerButtonText}>Seller portal</Text>
                <MaterialIcons name="arrow-forward" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.textHeading,
    // fontFamily: 'serif', // Use serif for Playfair-like look if available
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.badgeBackground,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.badgeText,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold', // Playfair
    color: Colors.light.textHeading,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textBody,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151', // gray-700
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPassword: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 9999, // full
    alignItems: 'center',
    marginTop: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB', // gray-200
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280', // gray-500
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    borderRadius: 8,
    marginBottom: 24,
  },
  socialButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    color: Colors.light.textBody,
    fontSize: 14,
  },
  link: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  sellerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6', // gray-100
    borderStyle: 'dashed',
  },
  sellerContent: {
    flex: 1,
  },
  sellerTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#9CA3AF', // gray-400
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sellerSubtitle: {
    fontSize: 12,
    color: Colors.light.textBody,
  },
  sellerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E1065',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    gap: 4,
  },
  sellerButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});