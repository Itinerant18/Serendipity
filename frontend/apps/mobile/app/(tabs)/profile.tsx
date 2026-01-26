import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';
import {
  BrandColors,
  NeutralColors,
  BackgroundColors,
  Shadows,
  Spacing,
  BorderRadius
} from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout, isLoading } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    setOrdersLoading(true);
    try {
      const userOrders = await apiService.getOrders();
      setOrders(userOrders.slice(0, 5)); // Show recent 5 orders
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      title: 'Personal Information',
      icon: '👤',
      onPress: () => router.push('/profile/edit'),
    },
    {
      title: 'Shipping Addresses',
      icon: '📍',
      onPress: () => router.push('/profile/addresses'),
    },
    {
      title: 'Payment Methods',
      icon: '💳',
      onPress: () => router.push('/profile/payment-methods'),
    },
    {
      title: 'Order History',
      icon: '📦',
      onPress: () => router.push('/profile/orders'),
    },
    {
      title: 'Settings',
      icon: '⚙️',
      onPress: () => router.push('/profile/settings'),
    },
    {
      title: 'Help & Support',
      icon: '💬',
      onPress: () => router.push('/profile/support'),
    },
  ];

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInText}>Please login to view your profile</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.replace('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.userType}>
          {user.isSeller && (
            <View style={[styles.badge, styles.sellerBadge]}>
              <Text style={styles.badgeText}>Seller</Text>
            </View>
          )}
          {user.isAdmin && (
            <View style={[styles.badge, styles.adminBadge]}>
              <Text style={styles.badgeText}>Admin</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/profile/orders')}
        >
          <Text style={styles.statNumber}>{orders.length}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/profile/addresses')}
        >
          <Text style={styles.statNumber}>📍</Text>
          <Text style={styles.statLabel}>Addresses</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push('/profile/payment-methods')}
        >
          <Text style={styles.statNumber}>💳</Text>
          <Text style={styles.statLabel}>Payment</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Orders */}
      <View style={styles.recentOrders}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push('/profile/orders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {ordersLoading ? (
          <ActivityIndicator size="small" color={BrandColors.primary} style={styles.loader} />
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/profile/orders/${order.id}`)}
            >
              <View>
                <Text style={styles.orderNumber}>Order #{order.id.slice(-8)}</Text>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>${order.total_price.toFixed(2)}</Text>
                <Text
                  style={[
                    styles.orderStatus,
                    { color: getStatusColor(order.status) },
                  ]}
                >
                  {order.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noOrdersText}>No orders yet</Text>
        )}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return BrandColors.success;
    case 'shipped':
      return BrandColors.info;
    case 'processing':
      return BrandColors.warning;
    case 'cancelled':
      return BrandColors.error;
    default:
      return BrandColors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.light,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notLoggedInText: {
    fontSize: 16,
    color: BrandColors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: BrandColors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  loginButtonText: {
    color: NeutralColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: NeutralColors.white,
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray200,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BrandColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: NeutralColors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandColors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    marginBottom: 12,
  },
  userType: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sellerBadge: {
    backgroundColor: BrandColors.primaryActive,
  },
  adminBadge: {
    backgroundColor: BrandColors.error,
  },
  badgeText: {
    color: NeutralColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: NeutralColors.white,
    padding: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  menuContainer: {
    backgroundColor: NeutralColors.white,
    margin: 16,
    borderRadius: BorderRadius.lg,
    padding: 8,
    ...Shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray200,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: BrandColors.textPrimary,
  },
  menuArrow: {
    fontSize: 20,
    color: BrandColors.textSecondary,
  },
  recentOrders: {
    backgroundColor: NeutralColors.white,
    margin: 16,
    borderRadius: BorderRadius.lg,
    padding: 16,
    ...Shadows.sm,
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
    color: BrandColors.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    color: BrandColors.primary,
    fontWeight: '600',
  },
  loader: {
    padding: 20,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray200,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textPrimary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BrandColors.primary,
    marginBottom: 2,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  noOrdersText: {
    textAlign: 'center',
    color: BrandColors.textSecondary,
    padding: 20,
  },
  logoutButton: {
    backgroundColor: NeutralColors.white,
    margin: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.error,
  },
  logoutButtonText: {
    color: BrandColors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});