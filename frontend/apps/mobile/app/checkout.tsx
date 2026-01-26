import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useCartStore } from '@/stores/cartStore';
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

interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export default function CheckoutScreen() {
  const { items, totalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const [addressesData, paymentData] = await Promise.all([
        apiService.getAddresses(),
        apiService.getPaymentMethods?.() || Promise.resolve([]),
      ]);
      
      setAddresses(addressesData);
      setPaymentMethods(paymentData);
      
      // Select default options
      const defaultAddress = addressesData.find((addr: Address) => addr.isDefault);
      const defaultPayment = paymentData.find((pm: PaymentMethod) => pm.isDefault);
      
      setSelectedAddress(defaultAddress?.id || addressesData[0]?.id || '');
      setSelectedPayment(defaultPayment?.id || paymentData[0]?.id || '');
    } catch (error) {
      console.error('Error loading checkout data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a shipping address');
      return;
    }

    if (!selectedPayment) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsLoading(true);
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: selectedAddress,
        paymentMethod: selectedPayment,
        totalAmount: totalPrice,
        notes: orderNotes,
      };

      const order = await apiService.createOrder(orderData);
      
      clearCart();
      
      Alert.alert(
        'Order Placed!',
        `Your order #${order.id.slice(-8)} has been placed successfully.`,
        [
          { text: 'Continue Shopping', onPress: () => router.replace('/(tabs)/products') },
          { text: 'View Orders', onPress: () => router.replace('/profile/orders') },
        ]
      );
    } catch (error: any) {
      Alert.alert('Order Failed', error.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const addNewAddress = () => {
    router.push('/profile/addresses/add');
  };

  const addNewPayment = () => {
    router.push('/profile/payment-methods/add');
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.replace('/(tabs)/products')}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${totalPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Shipping Address */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <TouchableOpacity onPress={addNewAddress}>
            <Text style={styles.addLink}>+ Add New</Text>
          </TouchableOpacity>
        </View>
        
        {addresses.length > 0 ? (
          addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddress === address.id && styles.addressCardSelected,
              ]}
              onPress={() => setSelectedAddress(address.id)}
            >
              <View style={styles.radioButton}>
                <View style={[
                  styles.radioInner,
                  selectedAddress === address.id && styles.radioInnerSelected,
                ]} />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressText}>
                  {address.street}, {address.city}, {address.state} {address.zipCode}
                </Text>
                <Text style={styles.addressText}>{address.country}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity style={styles.emptyCard} onPress={addNewAddress}>
            <Text style={styles.emptyText}>No addresses added</Text>
            <Text style={styles.addLink}>+ Add Address</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity onPress={addNewPayment}>
            <Text style={styles.addLink}>+ Add New</Text>
          </TouchableOpacity>
        </View>
        
        {paymentMethods.length > 0 ? (
          paymentMethods.map((payment) => (
            <TouchableOpacity
              key={payment.id}
              style={[
                styles.paymentCard,
                selectedPayment === payment.id && styles.paymentCardSelected,
              ]}
              onPress={() => setSelectedPayment(payment.id)}
            >
              <View style={styles.radioButton}>
                <View style={[
                  styles.radioInner,
                  selectedPayment === payment.id && styles.radioInnerSelected,
                ]} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentType}>
                  {payment.type.charAt(0).toUpperCase() + payment.type.slice(1)}
                </Text>
                {payment.last4 && (
                  <Text style={styles.paymentDetails}>
                    •••• {payment.last4}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity style={styles.emptyCard} onPress={addNewPayment}>
            <Text style={styles.emptyText}>No payment methods added</Text>
            <Text style={styles.addLink}>+ Add Payment Method</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Order Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Add any special instructions for your order..."
          value={orderNotes}
          onChangeText={setOrderNotes}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Place Order Button */}
      <TouchableOpacity
        style={[styles.placeOrderButton, isLoading && styles.buttonDisabled]}
        onPress={handlePlaceOrder}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderText}>
            Place Order • ${totalPrice.toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#7C3AED',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addLink: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  addressCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#fff8f0',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  radioInnerSelected: {
    backgroundColor: '#7C3AED',
  },
  addressInfo: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  paymentCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#fff8f0',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  paymentDetails: {
    fontSize: 14,
    color: '#666',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  placeOrderButton: {
    backgroundColor: '#7C3AED',
    margin: 16,
    marginBottom: 32,
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});