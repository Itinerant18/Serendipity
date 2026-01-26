import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressManagementScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAddresses();
    }
  }, [isAuthenticated, user]);

  const loadAddresses = async () => {
    try {
      const addressesData = await apiService.getAddresses();
      setAddresses(addressesData);
    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteAddress(addressId);
              loadAddresses();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await apiService.setDefaultAddress(addressId);
      loadAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const handleSaveAddress = async (addressData: Partial<Address>) => {
    try {
      if (editingAddress) {
        await apiService.updateAddress(editingAddress.id, addressData);
      } else {
        await apiService.addAddress(addressData);
      }
      
      setShowAddForm(false);
      setEditingAddress(null);
      loadAddresses();
    } catch (error) {
      Alert.alert('Error', 'Failed to save address');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Text style={styles.notLoggedInText}>Please login to manage addresses</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading addresses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Shipping Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddAddress}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Address Form Modal */}
      {showAddForm && (
        <View style={styles.formOverlay}>
          <ScrollView style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <AddressForm
              address={editingAddress}
              onSave={handleSaveAddress}
              onCancel={handleCancel}
            />
          </ScrollView>
        </View>
      )}

      {/* Addresses List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>
              Add your first shipping address to make checkout faster
            </Text>
            <TouchableOpacity
              style={styles.addFirstButton}
              onPress={handleAddAddress}
            >
              <Text style={styles.addFirstButtonText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressContent}>
                <View style={styles.addressHeader}>
                  <Text style={styles.addressType}>
                    {address.isDefault ? 'Default Address' : 'Shipping Address'}
                  </Text>
                  {!address.isDefault && (
                    <TouchableOpacity
                      style={styles.setDefaultButton}
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <Text style={styles.setDefaultButtonText}>Set as Default</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.addressInfo}>
                  <Text style={styles.addressText}>
                    {address.street}
                  </Text>
                  <Text style={styles.addressText}>
                    {address.city}, {address.state} {address.zipCode}
                  </Text>
                  <Text style={styles.addressText}>
                    {address.country}
                  </Text>
                </View>
              </View>

                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditAddress(address)}
                  >
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteAddress(address.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface AddressFormProps {
  address: Address | null;
  onSave: (addressData: Partial<Address>) => void;
  onCancel: () => void;
}

function AddressForm({ address, onSave, onCancel }: AddressFormProps) {
  const [formData, setFormData] = useState<Partial<Address>>({
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    zipCode: address?.zipCode || '',
    country: address?.country || 'United States',
    isDefault: address?.isDefault || false,
  });

  const updateField = (field: keyof Address, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onSave(formData);
  };

  return (
    <View style={addressFormStyles.form}>
      <View style={addressFormStyles.formGroup}>
        <Text style={addressFormStyles.label}>Street Address *</Text>
        <TextInput
          style={addressFormStyles.input}
          value={formData.street}
          onChangeText={(value) => updateField('street', value)}
          placeholder="123 Main St"
        />
      </View>

      <View style={addressFormStyles.formGroup}>
        <Text style={addressFormStyles.label}>City *</Text>
        <TextInput
          style={addressFormStyles.input}
          value={formData.city}
          onChangeText={(value) => updateField('city', value)}
          placeholder="New York"
        />
      </View>

      <View style={addressFormStyles.row}>
        <View style={[addressFormStyles.formGroup, addressFormStyles.halfWidth]}>
          <Text style={addressFormStyles.label}>State *</Text>
          <TextInput
            style={addressFormStyles.input}
            value={formData.state}
            onChangeText={(value) => updateField('state', value)}
            placeholder="NY"
          />
        </View>

        <View style={[addressFormStyles.formGroup, addressFormStyles.halfWidth]}>
          <Text style={addressFormStyles.label}>ZIP Code *</Text>
          <TextInput
            style={addressFormStyles.input}
            value={formData.zipCode}
            onChangeText={(value) => updateField('zipCode', value)}
            placeholder="10001"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={addressFormStyles.formGroup}>
        <Text style={addressFormStyles.label}>Country</Text>
        <TextInput
          style={addressFormStyles.input}
          value={formData.country}
          onChangeText={(value) => updateField('country', value)}
          placeholder="United States"
        />
      </View>

      <View style={addressFormStyles.checkboxGroup}>
        <TouchableOpacity
          style={addressFormStyles.checkbox}
          onPress={() => updateField('isDefault', !formData.isDefault)}
        >
          <View style={[
            addressFormStyles.checkboxInner,
            formData.isDefault && addressFormStyles.checkboxChecked,
          ]}>
            {formData.isDefault && (
              <Text style={addressFormStyles.checkmark}>✓</Text>
            )}
          </View>
        </TouchableOpacity>
        <Text style={addressFormStyles.checkboxLabel}>
          Set as default address
        </Text>
      </View>

      <View style={addressFormStyles.formActions}>
        <TouchableOpacity
          style={[addressFormStyles.button, addressFormStyles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={addressFormStyles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[addressFormStyles.button, addressFormStyles.saveButton]}
          onPress={handleSubmit}
        >
          <Text style={addressFormStyles.saveButtonText}>Save Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const addressFormStyles = StyleSheet.create({
  form: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxInner: {
    width: 16,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: '#7C3AED',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#7C3AED',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notLoggedInText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    padding: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  setDefaultButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  setDefaultButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  addressInfo: {
    marginBottom: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  deleteButton: {
    borderColor: '#ef4444',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
});