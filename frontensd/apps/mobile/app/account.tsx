import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';

export default function AccountScreen() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAccountData();
    }
  }, [isAuthenticated, user]);

  const loadAccountData = async () => {
    try {
      const [profile, orders] = await Promise.all([
        apiService.getProfile(),
        apiService.getOrders(),
      ]);

      setProfileData(profile);

      // Calculate order statistics
      const stats = orders.reduce(
        (acc, order) => {
          acc.totalOrders += 1;
          acc.totalSpent += order.total_price || 0;
          if (order.status === 'pending') acc.pendingOrders += 1;
          if (order.status === 'delivered') acc.deliveredOrders += 1;
          return acc;
        },
        { totalOrders: 0, totalSpent: 0, pendingOrders: 0, deliveredOrders: 0 }
      );

      setOrderStats(stats);
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
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
      subtitle: 'Manage your account details',
      icon: '👤',
      onPress: () => router.push('/profile/edit'),
    },
    {
      title: 'Order History',
      subtitle: `View all ${orderStats.totalOrders} orders`,
      icon: '📦',
      onPress: () => router.push('/profile/orders'),
    },
    {
      title: 'Shipping Addresses',
      subtitle: 'Manage delivery addresses',
      icon: '📍',
      onPress: () => router.push('/profile/addresses'),
    },
    {
      title: 'Payment Methods',
      subtitle: 'Saved payment options',
      icon: '💳',
      onPress: () => router.push('/profile/payment-methods'),
    },
    {
      title: 'Wishlist',
      subtitle: 'Save items for later',
      icon: '❤️',
      onPress: () => router.push('/profile/wishlist'),
    },
    {
      title: 'Notifications',
      subtitle: 'Order updates and promotions',
      icon: '🔔',
      onPress: () => router.push('/profile/notifications'),
    },
    {
      title: 'Security Settings',
      subtitle: 'Password and privacy',
      icon: '🔒',
      onPress: () => router.push('/profile/security'),
    },
    {
      title: 'Help & Support',
      subtitle: 'Get help with your account',
      icon: '💬',
      onPress: () => router.push('/profile/support'),
    },
  ];

  if (!isAuthenticated) {
    return (
      <View style={styles.notLoggedInContainer}>
        <Text style={styles.notLoggedInTitle}>Please Login</Text>
        <Text style={styles.notLoggedInSubtitle}>
          You need to be logged in to view your account
        </Text>
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
        <ActivityIndicator size="large" color="#D97534" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.headerContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <View style={styles.userBadges}>
            {user?.isSeller && (
              <View style={[styles.badge, styles.sellerBadge]}>
                <Text style={styles.badgeText}>Seller</Text>
              </View>
            )}
            {user?.isAdmin && (
              <View style={[styles.badge, styles.adminBadge]}>
                <Text style={styles.badgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Account Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orderStats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>${orderStats.totalSpent.toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{orderStats.pendingOrders}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Text style={styles.quickActionIcon}>🛒</Text>
            <Text style={styles.quickActionText}>View Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(tabs)/products')}
          >
            <Text style={styles.quickActionIcon}>🛍️</Text>
            <Text style={styles.quickActionText}>Shop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/profile/orders')}
          >
            <Text style={styles.quickActionIcon}>📦</Text>
            <Text style={styles.quickActionText}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/profile/addresses')}
          >
            <Text style={styles.quickActionIcon}>📍</Text>
            <Text style={styles.quickActionText}>Addresses</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Seller CTA */}
      {!user?.isSeller && (
        <View style={styles.sellerCTAContainer}>
          <Text style={styles.sellerCTATitle}>Want to sell on Serendipity?</Text>
          <Text style={styles.sellerCTASubtitle}>
            Turn your passion into profit with our seller platform
          </Text>
          <TouchableOpacity
            style={styles.sellerCTAButton}
            onPress={() => router.push('/auth/seller-register')}
          >
            <Text style={styles.sellerCTAButtonText}>Become a Seller</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Logout */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Serendipity Mobile v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

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
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  notLoggedInSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#D97534',
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
  headerContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D97534',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sellerBadge: {
    backgroundColor: '#8B4513',
  },
  adminBadge: {
    backgroundColor: '#dc2626',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D97534',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (100 - 3) / 4 + '%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuArrow: {
    fontSize: 20,
    color: '#666',
  },
  sellerCTAContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  sellerCTATitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  sellerCTASubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  sellerCTAButton: {
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 160,
  },
  sellerCTAButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});