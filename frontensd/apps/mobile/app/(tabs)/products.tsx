import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService, Product } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';
import { BrandColors, NeutralColors, BackgroundColors, Shadows, BorderRadius, Spacing } from '@/constants/theme';

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
        activeOpacity={0.9}
      >
        {/* Product Image */}
        <View style={styles.productImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.productImage} />
        </View>
        
        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{item.category || 'Serendipity'}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          
          <View style={styles.productFooter}>
            <Text style={styles.productPrice}>${price.toFixed(2)}</Text>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
            >
              <MaterialIcons name="add-shopping-cart" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BrandColors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={20} color={NeutralColors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={NeutralColors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color={NeutralColors.gray400} />
            </TouchableOpacity>
          )}
        </View>
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
              activeOpacity={0.8}
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
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh}
            tintColor={BrandColors.primary}
            colors={[BrandColors.primary]}
          />
        }
        ListFooterComponent={hasMore ? (
          <ActivityIndicator size="small" color={BrandColors.primary} style={styles.footerLoader} />
        ) : null}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="shopping-bag" size={48} color={NeutralColors.gray300} />
            <Text style={styles.emptyStateText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.neutral,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BackgroundColors.neutral,
  },
  
  // Search
  searchSection: {
    padding: Spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray200,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NeutralColors.gray100,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    fontSize: 15,
    color: NeutralColors.gray900,
  },
  
  // Categories
  categoriesSection: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray200,
  },
  categoriesList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  categoryChip: {
    backgroundColor: NeutralColors.gray100,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  categoryChipSelected: {
    backgroundColor: BrandColors.primary,
  },
  categoryChipText: {
    fontSize: 13,
    color: NeutralColors.gray600,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
  },
  
  // Products
  productsList: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    width: '48%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Shadows.lg,
  },
  productImageContainer: {
    aspectRatio: 4 / 5,
    backgroundColor: NeutralColors.gray100,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: Spacing.sm,
  },
  productBrand: {
    fontSize: 10,
    fontWeight: '600',
    color: BrandColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: NeutralColors.gray900,
    marginBottom: Spacing.sm,
    minHeight: 36,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: NeutralColors.gray200,
    paddingTop: Spacing.sm,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: NeutralColors.gray900,
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: BrandColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  
  // Footer & Empty
  footerLoader: {
    marginVertical: Spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyStateText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: NeutralColors.gray500,
  },
});