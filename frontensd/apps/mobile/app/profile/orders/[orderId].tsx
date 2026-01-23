import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { apiService } from '@/services/api';

interface OrderItem {
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
      category: string;
    };
  }>;
}

export default function OrdersScreen() {
  const { orderId } = useLocalSearchParams();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await apiService.getOrders();
      setOrders(ordersData);
      
      if (orderId) {
        const order = ordersData.find(o => o.id === orderId);
        if (order) {
          setSelectedOrder(order);
        }
      }
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

  const getOrderStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '#22c55e';
      case 'shipped':
        return '#3b82f6';
      case 'processing':
        return '#f59e0b';
      case 'pending':
        return '#8b5cf6';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#666';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return '✅';
      case 'shipped':
        return '🚚';
      case 'processing':
        return '⚙️';
      case 'pending':
        return '⏳';
      case 'cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  const filterOrders = (orders: OrderItem[], status: string) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status.toLowerCase() === status);
  };

  const handleOrderPress = (order: OrderItem) => {
    if (orderId) {
      // If we have an orderId param, show detail view
      router.setParams({ orderId: order.id });
    } else {
      // Otherwise navigate to detail
      router.push(`/profile/orders/${order.id}`);
    }
  };

  const handleTrackOrder = (order: OrderItem) => {
    // In a real app, this would open tracking info
    console.log('Track order:', order.id);
  };

  const handleReorder = async (order: OrderItem) => {
    try {
      // Add all items from this order back to cart
      for (const item of order.items) {
        // You'd need to import cart functions
        console.log('Reorder item:', item);
      }
      router.push('/(tabs)/cart');
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{item.id.slice(-8)}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View style={styles.orderStatus}>
          <Text style={styles.statusIcon}>{getOrderStatusIcon(item.status)}</Text>
          <Text
            style={[
              styles.statusText,
              { color: getOrderStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <View key={index} style={styles.orderItem}>
            {orderItem.product?.images[0] && (
              <Image
                source={{ uri: orderItem.product.images[0] }}
                style={styles.itemImage}
              />
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={1}>
                {orderItem.product?.name || 'Product'}
              </Text>
              <Text style={styles.itemMeta}>
                Qty: {orderItem.quantity} • ${orderItem.price.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${item.total_price.toFixed(2)}</Text>
        </View>
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleTrackOrder(item)}
          >
            <Text style={styles.actionButtonText}>Track</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.reorderButton]}
            onPress={() => handleReorder(item)}
          >
            <Text style={styles.reorderButtonText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;

    return (
      <View style={styles.orderDetail}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.detailTitle}>Order Details</Text>
          <View />
        </View>

        <View style={styles.detailContent}>
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Order Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Number:</Text>
              <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(selectedOrder.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusIcon}>
                  {getOrderStatusIcon(selectedOrder.status)}
                </Text>
                <Text
                  style={[
                    styles.detailValue,
                    { color: getOrderStatusColor(selectedOrder.status) },
                  ]}
                >
                  {selectedOrder.status}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>Items ({selectedOrder.items.length})</Text>
            {selectedOrder.items.map((item, index) => (
              <View key={index} style={styles.detailItem}>
                {item.product?.images[0] && (
                  <Image
                    source={{ uri: item.product.images[0] }}
                    style={styles.detailItemImage}
                  />
                )}
                <View style={styles.detailItemInfo}>
                  <Text style={styles.detailItemName}>
                    {item.product?.name || 'Product'}
                  </Text>
                  <Text style={styles.detailItemCategory}>
                    {item.product?.category || 'N/A'}
                  </Text>
                  <View style={styles.detailItemMeta}>
                    <Text style={styles.detailItemPrice}>
                      ${item.price.toFixed(2)}
                    </Text>
                    <Text style={styles.detailItemQuantity}>
                      Qty: {item.quantity}
                    </Text>
                    <Text style={styles.detailItemSubtotal}>
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.detailSection}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Subtotal:</Text>
              <Text style={styles.detailValue}>
                ${(selectedOrder.total_price * 0.9).toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shipping:</Text>
              <Text style={styles.detailValue}>
                ${(selectedOrder.total_price * 0.1).toFixed(2)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, styles.totalLabel]}>Total:</Text>
              <Text style={[styles.detailValue, styles.totalValue]}>
                ${selectedOrder.total_price.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97534" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  if (orderId && selectedOrder) {
    return (
      <View style={styles.container}>
        {renderOrderDetail()}
      </View>
    );
  }

  const filteredOrders = filterOrders(orders, activeTab);

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab && styles.tabButtonTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'all' 
                ? "You haven't placed any orders yet"
                : `No ${activeTab} orders`
              }
            </Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => router.push('/(tabs)/products')}
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  tabContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  tabButtonActive: {
    backgroundColor: '#D97534',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabButtonTextActive: {
    color: '#fff',
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 12,
    color: '#666',
  },
  moreItems: {
    fontSize: 12,
    color: '#D97534',
    fontStyle: 'italic',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D97534',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  reorderButton: {
    backgroundColor: '#D97534',
    borderColor: '#D97534',
  },
  reorderButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
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
  shopButton: {
    backgroundColor: '#D97534',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  orderDetail: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  detailContent: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  detailItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  detailItemInfo: {
    flex: 1,
  },
  detailItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  detailItemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  detailItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItemPrice: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  detailItemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  detailItemSubtotal: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D97534',
  },
});