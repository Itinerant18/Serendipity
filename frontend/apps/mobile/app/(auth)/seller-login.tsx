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
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

export default function SellerLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { sellerLogin, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await sellerLogin(email, password);
      
      // Redirect to web app for seller dashboard
      Alert.alert(
        'Seller Dashboard Available on Web',
        'The seller dashboard requires advanced features that are only available on our web platform. You will be redirected to the web version.',
        [
          {
            text: 'Open Web Dashboard',
            onPress: () => {
              Linking.openURL('http://192.168.0.135:4000/seller/dashboard');
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              router.replace('/(tabs)/products');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'An error occurred');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Seller Login</Text>
        <Text style={styles.subtitle}>Access your seller dashboard</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In as Seller</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Customer Account? </Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Customer Login</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={styles.registerSection}>
          <Text style={styles.footerText}>Don't have a seller account? </Text>
          <Link href="/auth/seller-register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Register as Seller</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4C1D95',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
});