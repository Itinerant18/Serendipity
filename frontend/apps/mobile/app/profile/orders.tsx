import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { apiService } from '@/services/api';

interface Order {
  id: string;
  created_at: string;
  total_price: number;
  status: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
      images: string[];
    };
  }>;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#22c55e';
      case 'shipped':
        return '#3b82f6';
      case 'processing':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/profile/orders/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>Order #{item.id.slice(-8)}</Text>
        <Text
          style={[
            styles.orderStatus,
            { color: getStatusColor(item.status) },
          ]}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Text>
      </View>
      
      <Text style={styles.orderDate}>
        {new Date(item.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Text>
      
      <View style={styles.itemsPreview}>
        {item.items.slice(0, 3).map((orderItem, index) => (
          <View key={index} style={styles.itemPreview}>
            <Text style={styles.itemName} numberOfLines={1}>
              {orderItem.product?.name || 'Product'}
            </Text>
            <Text style={styles.itemDetails}>
              Qty: {orderItem.quantity} • ${orderItem.price.toFixed(2)}
            </Text>
          </View>
        ))}
        {item.items.length > 3 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 3} more items
          </Text>
        )}
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>${item.total_price.toFixed(2)}</Text>
        <Text style={styles.viewDetails}>View Details ›</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Orders</Text>
        <Text style={styles.orderCount}>{orders.length} orders</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              Start shopping to see your orders here
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.replace('/(tabs)/products')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
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
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  orderCount: {
    fontSize: 14,
    color: '#666',
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  itemsPreview: {
    marginBottom: 12,
  },
  itemPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    marginRight: 8,
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
  },
  moreItems: {
    fontSize: 12,
    color: '#7C3AED',
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  viewDetails: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
});