import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { apiService, Product } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    rating: 0,
    sortBy: 'relevance',
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = () => {
    // Load search history from storage
    const mockHistory = [
      'wireless headphones',
      'running shoes',
      'smart watch',
      'yoga mat',
      'coffee maker',
    ];
    setSearchHistory(mockHistory);
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await apiService.searchProducts(query);
      setProducts(searchResults);
      
      // Add to search history
      if (query && !searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (searchQuery) {
      await handleSearch(searchQuery);
    }
    setIsRefreshing(false);
  };

  const handleSubmit = () => {
    handleSearch(searchQuery);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleHistoryItemPress = (item: string) => {
    setSearchQuery(item);
    handleSearch(item);
  };

  const handleFilterApply = () => {
    // Apply filters to search
    setShowFilters(false);
    // In a real app, you'd make a filtered API call
  };

  const handleAddToCart = (product: Product) => {
    const { addItem } = useCartStore();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0] || '',
      stock: product.stock,
    });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/products/${item.id}`)}
    >
      <Text style={styles.productImage} numberOfLines={1}>
        {item.images[0] ? '📦' : '📦'}
      </Text>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
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

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryItemPress(item)}
    >
      <Text style={styles.historyIcon}>🔍</Text>
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: { name: string; icon: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        filters.category === item.name && styles.categoryItemSelected,
      ]}
      onPress={() => setFilters(prev => ({ ...prev, category: item.name }))}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const categories = [
    { name: 'electronics', icon: '📱' },
    { name: 'fashion', icon: '👗' },
    { name: 'home', icon: '🏠' },
    { name: 'sports', icon: '⚽' },
    { name: 'beauty', icon: '💄' },
    { name: 'books', icon: '📚' },
  ];

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, categories..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSubmit}
            disabled={isSearching}
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#D97534" />
            ) : (
              <Text style={styles.searchIcon}>🔍</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filters Modal/Sheet */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.filterSectionTitle}>Category</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((category) => (
              <View key={category.name}>
                {renderCategory({ item: category })}
              </View>
            ))}
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => setFilters({ category: '', priceRange: [0, 1000], rating: 0, sortBy: 'relevance' })}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleFilterApply}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Search Results or History */}
      {searchQuery ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsHeader}>
            {isSearching ? 'Searching...' : `Found ${products.length} results for "${searchQuery}"`}
          </Text>
          
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
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptySubtitle}>
                  Try different keywords or browse categories
                </Text>
              </View>
            }
          />
        </View>
      ) : (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => index.toString()}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No search history</Text>
                <Text style={styles.emptySubtitle}>
                  Your recent searches will appear here
                </Text>
              </View>
            }
          />

          {/* Trending Searches */}
          <View style={styles.trendingContainer}>
            <Text style={styles.trendingTitle}>Trending Searches</Text>
            <View style={styles.trendingList}>
              {['summer sale', 'wireless earbuds', 'fitness tracker', 'home decor'].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.trendingItem}
                  onPress={() => handleHistoryItemPress(item)}
                >
                  <Text style={styles.trendingText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
  },
  searchHeader: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  filterButton: {
    padding: 8,
  },
  filterIcon: {
    fontSize: 18,
  },
  filterContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 20,
    zIndex: 1000,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  closeIcon: {
    fontSize: 18,
    color: '#666',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryItemSelected: {
    backgroundColor: '#D97534',
    borderColor: '#D97534',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  categoryItemSelected: {
    color: '#fff',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#D97534',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    padding: 16,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
    fontSize: 40,
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
    borderRadius: 8,
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
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    minHeight: 32,
  },
  productBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97534',
  },
  addToCartButton: {
    backgroundColor: '#D97534',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  historyContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  clearButton: {
    fontSize: 14,
    color: '#D97534',
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#666',
  },
  historyText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  trendingContainer: {
    padding: 16,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  trendingList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  trendingItem: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  trendingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});