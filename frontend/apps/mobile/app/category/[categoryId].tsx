import React, { useEffect, useState } from 'react';
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
import { apiService, Product } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';

export default function CategoryScreen() {
  const { categoryId } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'rating'>('newest');
  const { addItem } = useCartStore();

  useEffect(() => {
    if (categoryId) {
      loadCategoryData(categoryId as string);
    }
  }, [categoryId]);

  const loadCategoryData = async (id: string) => {
    try {
      // Load category info and products
      const [productsData] = await Promise.all([
        apiService.getProducts({ category: id }),
        // In a real app, you'd have an endpoint to get category details
      ]);
      
      setProducts(productsData.products);
      
      // Mock category data - replace with real API call
      const mockCategory = {
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        description: `Explore our amazing collection of ${id} products`,
        productCount: productsData.products.length,
        icon: getCategoryIcon(id),
      };
      setCategory(mockCategory);
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (categoryId) {
      await loadCategoryData(categoryId as string);
    }
    setIsRefreshing(false);
  };

  const handleSortChange = (sortType: typeof sortBy) => {
    setSortBy(sortType);
    // In a real app, you'd re-fetch products with sorting
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
      stock: product.stock,
    });
  };

  const handleProductPress = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const getCategoryIcon = (categoryName: string) => {
    const icons: { [key: string]: string } = {
      electronics: '📱',
      fashion: '👗',
      home: '🏠',
      sports: '⚽',
      beauty: '💄',
      books: '📚',
      toys: '🧸',
      food: '🍔',
      health: '💊',
      automotive: '🚗',
      garden: '🌱',
      pets: '🐾',
    };
    return icons[categoryName.toLowerCase()] || '📦';
  };

  const getSortOptions = () => [
    { key: 'newest', label: 'Newest First' },
    { key: 'price_low', label: 'Price: Low to High' },
    { key: 'price_high', label: 'Price: High to Low' },
    { key: 'rating', label: 'Highest Rated' },
  ];

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item.id)}
    >
      <Image source={{ uri: item.images[0] }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.productBottom}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addToCartText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSortOption = ({ item }: { item: { key: string; label: string } }) => (
    <TouchableOpacity
      style={[
        styles.sortOption,
        sortBy === item.key && styles.sortOptionSelected,
      ]}
      onPress={() => handleSortChange(item.key as any)}
    >
      <Text
        style={[
          styles.sortOptionText,
          sortBy === item.key && styles.sortOptionTextSelected,
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading category...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category Header */}
      {category && (
        <View style={styles.headerContainer}>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <View style={styles.categoryText}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
              <Text style={styles.productCount}>
                {category.productCount} products
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getSortOptions().map((option) => (
            <View key={option.key}>
              {renderSortOption({ item: option })}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try checking back later or browse other categories
            </Text>
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
  headerContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  productCount: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },
  sortContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginRight: 12,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  sortOptionSelected: {
    backgroundColor: '#7C3AED',
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  sortOptionTextSelected: {
    color: '#fff',
  },
  productList: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
    minHeight: 40,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C3AED',
  },
  addToCartButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});