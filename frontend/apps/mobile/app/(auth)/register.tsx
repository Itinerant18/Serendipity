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
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/theme';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await register({ name, email, password, mobile: formData.mobile });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          {/* Logo */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="shopping-bag" size={32} color={Colors.light.primary} />
              <Text style={styles.logoText}>Serendipity</Text>
            </View>
          </View>

          {/* Register Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Serendipity today</Text>

            <View style={styles.form}>
              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="John Doe"
                    value={formData.name}
                    onChangeText={(value) => updateField('name', value)}
                    autoComplete="name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="john@example.com"
                    value={formData.email}
                    onChangeText={(value) => updateField('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Mobile Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mobile Number (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+1234567890"
                    value={formData.mobile}
                    onChangeText={(value) => updateField('mobile', value)}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
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

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Create Account</Text>
                    <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Seller Link */}
            <View style={styles.sellerSection}>
              <Text style={styles.sellerText}>Want to sell on Serendipity? </Text>
              <TouchableOpacity onPress={() => import('@/services/auth').then(m => m.authManager.openSellerPortal())}>
                <Text style={[styles.link, { color: Colors.light.textHeading }]}>Become a Seller →</Text>
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
    paddingTop: 40,
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
    fontWeight: 'bold',
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
    color: '#374151',
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
  eyeIcon: {
    padding: 4,
  },
  button: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 9999,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
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
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  sellerText: {
    fontSize: 14,
    color: '#6B7280',
  },
});