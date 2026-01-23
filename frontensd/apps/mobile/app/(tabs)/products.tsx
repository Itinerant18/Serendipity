import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService, Product } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';

export default function ProductsScreen() {
  const { category } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category?.toString() || '');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadInitialData();
  }, [category]);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategory]);

  const loadInitialData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts({ category: category?.toString() }),
        apiService.getCategories(),
      ]);
      
      if (productsData?.products) {
        setProducts(productsData.products);
        setHasMore(productsData.products.length === 24);
      }

      // Safe category loading
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData.map((cat: any) => typeof cat === 'string' ? cat : cat.name));
      } else if (categoriesData && Array.isArray((categoriesData as any).categories)) {
        setCategories((categoriesData as any).categories);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    if (!hasMore || isLoading) return;
    
    try {
      const nextPage = page + 1;
      const productsData = await apiService.getProducts({
        page: nextPage,
        category: selectedCategory,
        search: searchQuery,
      });
      
      if (productsData?.products) {
        setProducts(prev => [...prev, ...productsData.products]);
        setPage(nextPage);
        setHasMore(productsData.products.length === 24);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter(product =>
        (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    await loadInitialData();
    setIsRefreshing(false);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: (product.images && product.images.length > 0) ? product.images[0] : '',
      stock: product.stock,
    });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    if (!item) return null;

    const imageUri = (item.images && item.images.length > 0) ? item.images[0] : '';
    const price = typeof item.price === 'number' ? item.price : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/products/${item.id}`)}
      >
        <Image source={{ uri: imageUri }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>${price.toFixed(2)}</Text>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipSelected
      ]}
      onPress={() => setSelectedCategory(item === selectedCategory ? '' : item)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === item && styles.categoryChipTextSelected
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D97534" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <FlatList
          data={['All', ...categories]}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryChip,
                (item === 'All' && !selectedCategory) || selectedCategory === item
                  ? styles.categoryChipSelected
                  : null
              ]}
              onPress={() => setSelectedCategory(item === 'All' ? '' : item)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  (item === 'All' && !selectedCategory) || selectedCategory === item
                    ? styles.categoryChipTextSelected
                    : null
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
        onEndReached={loadMoreProducts}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={hasMore ? (
          <ActivityIndicator size="small" color="#D97534" style={styles.footerLoader} />
        ) : null}
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
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#D97534',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  productsList: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
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
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97534',
    marginBottom: 8,
  },
  addToCartButton: {
    backgroundColor: '#D97534',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  footerLoader: {
    marginVertical: 20,
  },
});