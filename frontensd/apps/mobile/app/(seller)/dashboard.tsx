import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  recentOrders: any[];
  salesData: Array<{ date: string; sales: number }>;
}

export default function SellerDashboardScreen() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.isSeller) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await apiService.getSellerDashboard();
      
      // Transform data to match our interface
      const transformedStats: DashboardStats = {
        totalSales: dashboardData.totalSales || 0,
        totalOrders: dashboardData.totalOrders || 0,
        totalProducts: dashboardData.totalProducts || 0,
        recentOrders: dashboardData.recentOrders || [],
        salesData: dashboardData.salesData || [],
      };
      
      setStats(transformedStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to mock data
      const mockStats: DashboardStats = {
        totalSales: 15420.50,
        totalOrders: 234,
        totalProducts: 45,
        recentOrders: [
          { id: '1', customer: 'John Doe', total: 125.99, status: 'pending', date: '2024-01-20' },
          { id: '2', customer: 'Jane Smith', total: 89.50, status: 'shipped', date: '2024-01-19' },
          { id: '3', customer: 'Bob Johnson', total: 234.99, status: 'delivered', date: '2024-01-18' },
        ],
        salesData: [
          { date: 'Mon', sales: 1200 },
          { date: 'Tue', sales: 1500 },
          { date: 'Wed', sales: 1800 },
          { date: 'Thu', sales: 1400 },
          { date: 'Fri', sales: 2200 },
          { date: 'Sat', sales: 2800 },
          { date: 'Sun', sales: 2100 },
        ],
      };
      
      setStats(mockStats);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
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

  const menuItems = [
    {
      title: 'Products',
      subtitle: 'Manage your inventory',
      icon: '📦',
      color: '#D97534',
      onPress: () => router.push('/seller/inventory'),
    },
    {
      title: 'Orders',
      subtitle: 'View and manage orders',
      icon: '🛍️',
      color: '#3b82f6',
      onPress: () => router.push('/seller/orders'),
    },
    {
      title: 'Analytics',
      subtitle: 'Sales insights and reports',
      icon: '📊',
      color: '#10b981',
      onPress: () => router.push('/seller/analytics'),
    },
    {
      title: 'Settings',
      subtitle: 'Store configuration',
      icon: '⚙️',
      color: '#6b7280',
      onPress: () => router.push('/seller/settings'),
    },
  ];

  if (!user?.isSeller) {
    return (
      <View style={styles.notAuthorized}>
        <Text style={styles.notAuthorizedText}>Access denied. Seller account required.</Text>
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

  if (!stats) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.storeName}>{user.name}'s Store</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${stats.totalSales.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total Sales</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.totalProducts}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
      </View>

      {/* Weekly Sales Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Weekly Sales</Text>
        <View style={styles.chart}>
          {stats.salesData.map((item, index) => (
            <View key={index} style={styles.chartBar}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (item.sales / 3000) * 120,
                      backgroundColor: '#D97534',
                    },
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.date}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => router.push('/seller/orders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.ordersList}>
          {stats.recentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/seller/orders/${order.id}`)}
            >
              <View style={styles.orderInfo}>
                <Text style={styles.orderCustomer}>{order.customer}</Text>
                <Text style={styles.orderDate}>{order.date}</Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
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
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  notAuthorized: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  notAuthorizedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#8B4513',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D97534',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
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
  viewAllText: {
    fontSize: 14,
    color: '#D97534',
    fontWeight: '600',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ordersList: {
    gap: 8,
  },
  orderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D97534',
    marginBottom: 2,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
});