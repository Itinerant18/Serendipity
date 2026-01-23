import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import { apiService } from '@/services/api';

const { width } = Dimensions.get('window');

export default function MarketplaceScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const [marketplaceData, setMarketplaceData] = useState({
    totalSellers: 0,
    totalProducts: 0,
    featuredSellers: [],
    trendingProducts: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sellers' | 'products'>('sellers');

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      // Mock marketplace data - replace with actual API calls
      const mockData = {
        totalSellers: 1247,
        totalProducts: 15420,
        featuredSellers: [
          {
            id: '1',
            storeName: 'Fashion Hub',
            description: 'Trendy clothing and accessories',
            rating: 4.8,
            productsCount: 234,
            avatar: '👗',
          },
          {
            id: '2',
            storeName: 'Tech Paradise',
            description: 'Latest gadgets and electronics',
            rating: 4.6,
            productsCount: 189,
            avatar: '📱',
          },
          {
            id: '3',
            storeName: 'Home Essentials',
            description: 'Everything for your home',
            rating: 4.9,
            productsCount: 456,
            avatar: '🏠',
          },
          {
            id: '4',
            storeName: 'Sports Zone',
            description: 'Sports equipment and apparel',
            rating: 4.7,
            productsCount: 167,
            avatar: '⚽',
          },
        ],
        trendingProducts: [
          {
            id: '1',
            name: 'Wireless Headphones',
            price: 89.99,
            seller: 'Tech Paradise',
            rating: 4.5,
            image: '🎧',
            orders: 234,
          },
          {
            id: '2',
            name: 'Designer Watch',
            price: 199.99,
            seller: 'Fashion Hub',
            rating: 4.8,
            image: '⌚',
            orders: 156,
          },
          {
            id: '3',
            name: 'Yoga Mat Pro',
            price: 45.99,
            seller: 'Sports Zone',
            rating: 4.6,
            image: '🧘',
            orders: 89,
          },
          {
            id: '4',
            name: 'Smart LED Lights',
            price: 34.99,
            seller: 'Home Essentials',
            rating: 4.7,
            image: '💡',
            orders: 201,
          },
        ],
        categories: [
          { name: 'Electronics', icon: '📱', count: 3421 },
          { name: 'Fashion', icon: '👗', count: 2897 },
          { name: 'Home', icon: '🏠', count: 2156 },
          { name: 'Sports', icon: '⚽', count: 1789 },
          { name: 'Beauty', icon: '💄', count: 1234 },
          { name: 'Books', icon: '📚', count: 987 },
        ],
      };
      
      setMarketplaceData(mockData);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBecomeSeller = () => {
    router.push('/auth/seller-register');
  };

  const handleBrowseSellers = () => {
    setActiveTab('sellers');
  };

  const handleBrowseProducts = () => {
    setActiveTab('products');
  };

  const handleSellerPress = (sellerId: string) => {
    // Navigate to seller profile or store
    console.log('Navigate to seller:', sellerId);
  };

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97534" />
        <Text style={styles.loadingText}>Loading Marketplace...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>
          Discover amazing products from top sellers
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{marketplaceData.totalSellers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Active Sellers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{marketplaceData.totalProducts.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Products</Text>
        </View>
      </View>

      {/* CTA for Sellers */}
      {!user?.isSeller && (
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Want to sell on Serendipity?</Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleBecomeSeller}>
            <Text style={styles.ctaButtonText}>Become a Seller</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'sellers' && styles.tabButtonActive,
          ]}
          onPress={handleBrowseSellers}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'sellers' && styles.tabButtonTextActive,
            ]}
          >
            Featured Sellers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'products' && styles.tabButtonActive,
          ]}
          onPress={handleBrowseProducts}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'products' && styles.tabButtonTextActive,
            ]}
          >
            Trending Products
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Shop by Category</Text>
        <View style={styles.categoriesGrid}>
          {marketplaceData.categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => router.push(`/products?category=${category.name}`)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>{category.count} items</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'sellers' ? (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Featured Sellers</Text>
          <View style={styles.sellersGrid}>
            {marketplaceData.featuredSellers.map((seller) => (
              <TouchableOpacity
                key={seller.id}
                style={styles.sellerCard}
                onPress={() => handleSellerPress(seller.id)}
              >
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>{seller.avatar}</Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{seller.storeName}</Text>
                  <Text style={styles.sellerDescription}>{seller.description}</Text>
                  <View style={styles.sellerStats}>
                    <Text style={styles.sellerRating}>⭐ {seller.rating}</Text>
                    <Text style={styles.sellerProductsCount}>
                      {seller.productsCount} products
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Trending Products</Text>
          <View style={styles.productsGrid}>
            {marketplaceData.trendingProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => handleProductPress(product.id)}
              >
                <View style={styles.productImage}>
                  <Text style={styles.productImageText}>{product.image}</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productSeller}>by {product.seller}</Text>
                  <View style={styles.productBottom}>
                    <Text style={styles.productPrice}>${product.price}</Text>
                    <Text style={styles.productRating}>⭐ {product.rating}</Text>
                  </View>
                  <Text style={styles.productOrders}>{product.orders} sold</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Footer CTA */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerTitle}>Join Our Growing Marketplace</Text>
        <Text style={styles.footerSubtitle}>
          Connect with thousands of buyers and sellers worldwide
        </Text>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => router.push('/(tabs)/products')}
        >
          <Text style={styles.footerButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#D97534',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  ctaContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  categoriesContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryItem: {
    width: (width - 64) / 3,
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sellersGrid: {
    gap: 16,
  },
  sellerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerAvatarText: {
    fontSize: 24,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sellerDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  sellerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sellerRating: {
    fontSize: 12,
    color: '#D97534',
    fontWeight: '500',
  },
  sellerProductsCount: {
    fontSize: 12,
    color: '#666',
  },
  productsGrid: {
    gap: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    alignSelf: 'flex-start',
  },
  productImageText: {
    fontSize: 24,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  productSeller: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97534',
  },
  productRating: {
    fontSize: 12,
    color: '#D97534',
  },
  productOrders: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  footerContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  footerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  footerButton: {
    backgroundColor: '#D97534',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 160,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});