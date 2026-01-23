import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiService, Product } from '@/services/api';
import { useCartStore } from '@/stores/cartStore';

// Design System matching web
const Theme = {
  // Colors
  darkBlue: '#232f3e',
  lightBlue: '#37475A',
  accent: '#febd69',
  accentDark: '#D97534',
  white: '#FFFFFF',
  cream: '#FFF8F0',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const { width: screenWidth } = Dimensions.get('window');

// Category data with images
const categoryData = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
  { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
  { name: 'Books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400' },
];

// Hero slides - 6 main categories with redirects
const heroSlides = [
  {
    badge: 'NEW ARRIVALS',
    discount: '30% OFF',
    title: 'Electronics',
    subtitle: 'Latest gadgets and tech at unbeatable prices.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800',
    buttonText: 'Shop Electronics',
    category: 'Electronics',
  },
  {
    badge: 'TRENDING NOW',
    discount: '25% OFF',
    title: 'Beauty',
    subtitle: 'Discover premium skincare and cosmetics.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    buttonText: 'Explore Beauty',
    category: 'Beauty',
  },
  {
    badge: 'SPORTS SALE',
    discount: '35% OFF',
    title: 'Sports',
    subtitle: 'Gear up for your active lifestyle.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    buttonText: 'Shop Sports',
    category: 'Sports',
  },
  {
    badge: 'BOOK LOVERS',
    discount: '20% OFF',
    title: 'Books',
    subtitle: 'Explore bestsellers and hidden gems.',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800',
    buttonText: 'Browse Books',
    category: 'Books',
  },
  {
    badge: 'FASHION WEEK',
    discount: '40% OFF',
    title: 'Fashion',
    subtitle: 'Discover your unique style this season.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    buttonText: 'Find Your Look',
    category: 'Fashion',
  },
  {
    badge: 'HOME TREASURES',
    discount: '30% OFF',
    title: 'Home & Living',
    subtitle: 'Transform your house into a home.',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    buttonText: 'Explore Home',
    category: 'Home & Living',
  },
];

// Trust badges
const trustBadges = [
  { icon: 'local-shipping', title: 'Free Delivery', subtitle: 'On orders over $50' },
  { icon: 'verified-user', title: 'Secure Payment', subtitle: '100% Protected' },
  { icon: 'support-agent', title: '24/7 Support', subtitle: 'Always here to help' },
];

export default function HomeScreen() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const { addItem, totalItems } = useCartStore();
  const heroFlatListRef = useRef<FlatList>(null);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-scroll carousel - pauses when user is scrolling
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollTimer.current = setInterval(() => {
        if (!isUserScrolling) {
          setCurrentSlide((prev) => {
            const next = (prev + 1) % heroSlides.length;
            heroFlatListRef.current?.scrollToIndex({ index: next, animated: true });
            return next;
          });
        }
      }, 4000);
    };

    startAutoScroll();
    
    return () => {
      if (autoScrollTimer.current) {
        clearInterval(autoScrollTimer.current);
      }
    };
  }, [isUserScrolling]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiService.getProducts({ limit: 8 }),
        apiService.getCategories(),
      ]);
      
      if (productsData?.products) {
        setFeaturedProducts(productsData.products);
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/(tabs)/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Enhanced product card with glassmorphism and interactive elements
  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    if (!item) return null;
    
    const imageUri = (item.images && item.images.length > 0) ? item.images[0] : '';
    const price = typeof item.price === 'number' ? item.price : 0;
    const originalPrice = price * 1.2; // Show 20% discount
    const rating = 4 + Math.random(); // Simulated rating
    const isNew = index < 2; // First 2 products are "new"
    const isBestseller = index === 0 || index === 3;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/products/${item.id}`)}
        activeOpacity={0.95}
      >
        {/* Image Container with Badges */}
        <View style={styles.productImageContainer}>
          <Image source={{ uri: imageUri }} style={styles.productImage} />
          
          {/* Glassmorphism overlay on hover simulation */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.03)']}
            style={styles.productImageGradient}
          />
          
          {/* Badges */}
          <View style={styles.productBadges}>
            {isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            )}
            {isBestseller && (
              <View style={styles.bestsellerBadge}>
                <Text style={styles.badgeText}>⭐ BESTSELLER</Text>
              </View>
            )}
          </View>
          
          {/* Wishlist Button - Glass effect */}
          <TouchableOpacity style={styles.wishlistButton}>
            <Ionicons name="heart-outline" size={18} color={Theme.white} />
          </TouchableOpacity>
          
          {/* Discount Tag */}
          <View style={styles.discountTag}>
            <Text style={styles.discountTagText}>-20%</Text>
          </View>
        </View>
        
        {/* Product Info with Glass Effect */}
        <View style={styles.productInfo}>
          <Text style={styles.productCategory}>{item.category || 'Serendipity'}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          
          {/* Rating Stars */}
          <View style={styles.ratingContainer}>
            {[1,2,3,4,5].map((star) => (
              <Ionicons 
                key={star} 
                name={star <= Math.floor(rating) ? 'star' : 'star-outline'} 
                size={12} 
                color={Theme.accent} 
              />
            ))}
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
          
          {/* Price Section */}
          <View style={styles.productFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>${price.toFixed(2)}</Text>
              <Text style={styles.originalPrice}>${originalPrice.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => handleAddToCart(item)}
            >
              <LinearGradient
                colors={[Theme.accent, '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cartButtonGradient}
              >
                <MaterialIcons name="add-shopping-cart" size={16} color={Theme.darkBlue} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Category card with grayscale effect like web
  const renderCategory = ({ item, index }: { item: string; index: number }) => {
    const catData = categoryData.find(c => c.name === item) || categoryData[index % categoryData.length];
    
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => router.push(`/products?category=${item}`)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: catData.image }} 
          style={styles.categoryImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.categoryGradient}
        >
          <Text style={styles.categoryName}>{item}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.accent} />
      </View>
    );
  }

  const renderHeader = () => (
    <>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🌟</Text>
          <Text style={styles.logoText}>Serendipity</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Theme.gray500}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={Theme.darkBlue} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(tabs)/cart')}>
          <Feather name="shopping-cart" size={22} color={Theme.white} />
          {totalItems > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItems}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Hero Carousel - Using FlatList for better performance */}
      <View style={styles.heroContainer}>
        <FlatList
          ref={heroFlatListRef}
          data={heroSlides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={screenWidth}
          snapToAlignment="start"
          scrollEventThrottle={16}
          bounces={false}
          onScrollBeginDrag={() => setIsUserScrolling(true)}
          onScrollEndDrag={() => {
            setTimeout(() => setIsUserScrolling(false), 2000);
          }}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setCurrentSlide(index);
            setIsUserScrolling(false);
          }}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          keyExtractor={(_, index) => `hero-${index}`}
          renderItem={({ item: slide }) => (
            <View style={styles.heroSlide}>
              <Image source={{ uri: slide.image }} style={styles.heroImage} />
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.6)']}
                style={styles.heroOverlay}
              >
                <View style={styles.heroBadges}>
                  <View style={styles.trendingBadge}>
                    <Text style={styles.trendingText}>{slide.badge}</Text>
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{slide.discount}</Text>
                  </View>
                </View>
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle}>{slide.title}</Text>
                  <Text style={styles.heroSubtitle}>{slide.subtitle}</Text>
                  <TouchableOpacity 
                    style={styles.heroButton}
                    onPress={() => router.push(`/(tabs)/products?category=${encodeURIComponent(slide.category)}`)}
                  >
                    <Text style={styles.heroButtonText}>{slide.buttonText}</Text>
                    <MaterialIcons name="arrow-forward" size={16} color={Theme.darkBlue} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          )}
        />
        
        {/* Slide Indicators - Tappable */}
        <View style={styles.slideIndicators}>
          {heroSlides.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                heroFlatListRef.current?.scrollToIndex({ index, animated: true });
                setCurrentSlide(index);
              }}
              style={[
                styles.indicator,
                currentSlide === index && styles.indicatorActive
              ]}
            />
          ))}
        </View>
      </View>

      {/* Explore Categories Section */}
      <View style={styles.sectionLight}>
        <Text style={styles.sectionTitleDark}>Explore Categories</Text>
        <Text style={styles.sectionSubtitle}>Shop by category to find exactly what you're looking for</Text>
        <View style={styles.categoriesGrid}>
          {(categories.length > 0 ? categories.slice(0, 6) : categoryData.map(c => c.name)).map((cat, index) => (
            <TouchableOpacity
              key={cat}
              style={styles.categoryGridItem}
              onPress={() => router.push(`/products?category=${cat}`)}
              activeOpacity={0.8}
            >
              <Image 
                source={{ uri: categoryData[index % categoryData.length].image }} 
                style={styles.categoryGridImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.categoryGridGradient}
              >
                <Text style={styles.categoryGridName}>{cat}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* The Serendipity Collection Section - Enhanced with Glass Effect */}
      <LinearGradient
        colors={[Theme.darkBlue, '#1a2634', Theme.darkBlue]}
        style={styles.collectionSection}
      >
        {/* Decorative Glass Orbs */}
        <View style={styles.glassOrb1} />
        <View style={styles.glassOrb2} />
        
        <View style={styles.collectionHeader}>
          <View style={styles.collectionContent}>
            {/* Glass Badge */}
            <View style={styles.glassBadge}>
              <Text style={styles.collectionBadgeText}>✨ FEATURED COLLECTION</Text>
            </View>
            
            <Text style={styles.collectionTitle}>The Serendipity</Text>
            <Text style={styles.collectionTitle}>Collection</Text>
            
            <Text style={styles.collectionSubtitle}>
              Discover items curated just for you. Every product feels serendipitous.
            </Text>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>500+</Text>
                <Text style={styles.statLabel}>Products</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.9</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24h</Text>
                <Text style={styles.statLabel}>Delivery</Text>
              </View>
            </View>
          </View>
          
          {/* Glass View All Button */}
          <TouchableOpacity 
            style={styles.glassViewAllButton}
            onPress={() => router.push('/(tabs)/products')}
          >
            <LinearGradient
              colors={['rgba(254,189,105,0.2)', 'rgba(254,189,105,0.1)']}
              style={styles.glassButtonInner}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <MaterialIcons name="arrow-forward" size={14} color={Theme.accent} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </>
  );

  const renderFooter = () => (
    <>
      {/* Trust Badges */}
      <View style={styles.trustSection}>
        <Text style={styles.trustTitle}>Why Shop With Us</Text>
        <View style={styles.trustBadges}>
          {trustBadges.map((badge, index) => (
            <View key={index} style={styles.trustBadge}>
              <View style={styles.trustIconContainer}>
                <MaterialIcons name={badge.icon as any} size={28} color={Theme.accent} />
              </View>
              <Text style={styles.trustBadgeTitle}>{badge.title}</Text>
              <Text style={styles.trustBadgeSubtitle}>{badge.subtitle}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Start Selling CTA */}
      <View style={styles.sellerCTA}>
        <Text style={styles.sellerTitle}>Start Selling Today</Text>
        <Text style={styles.sellerSubtitle}>
          Join thousands of sellers and reach millions of customers worldwide.
        </Text>
        <TouchableOpacity style={styles.sellerButton}>
          <Text style={styles.sellerButtonText}>Become a Seller</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.darkBlue} />
      <FlatList
        data={featuredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.productsList}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyProducts}>
            <Text style={styles.emptyText}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.white,
  },
  
  // Header
  header: {
    backgroundColor: Theme.darkBlue,
    paddingTop: 50,
    paddingBottom: Theme.md,
    paddingHorizontal: Theme.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
  },
  logoText: {
    color: Theme.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Theme.white,
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: Theme.sm,
    paddingVertical: Theme.sm,
    fontSize: 14,
    color: Theme.gray900,
  },
  searchButton: {
    backgroundColor: Theme.accent,
    paddingHorizontal: Theme.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    padding: Theme.xs,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Theme.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: Theme.darkBlue,
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Hero Carousel
  heroContainer: {
    height: 220,
    position: 'relative',
  },
  heroSlide: {
    width: screenWidth,
    height: 220,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: Theme.lg,
    justifyContent: 'space-between',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: Theme.sm,
  },
  trendingBadge: {
    backgroundColor: Theme.accentDark,
    paddingHorizontal: Theme.sm,
    paddingVertical: Theme.xs,
    borderRadius: 4,
  },
  trendingText: {
    color: Theme.white,
    fontSize: 10,
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: Theme.accent,
    paddingHorizontal: Theme.sm,
    paddingVertical: Theme.xs,
    borderRadius: 4,
  },
  discountText: {
    color: Theme.darkBlue,
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroContent: {
    maxWidth: '70%',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.white,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Theme.md,
    lineHeight: 18,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.accent,
    paddingVertical: Theme.sm,
    paddingHorizontal: Theme.md,
    borderRadius: 6,
    alignSelf: 'flex-start',
    gap: 6,
  },
  heroButtonText: {
    color: Theme.darkBlue,
    fontSize: 13,
    fontWeight: '600',
  },
  slideIndicators: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: 4,
  },
  indicatorActive: {
    backgroundColor: Theme.accent,
    width: 24,
  },

  // Categories Section (Light)
  sectionLight: {
    padding: Theme.lg,
    backgroundColor: Theme.cream,
  },
  sectionTitleDark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.gray900,
    textAlign: 'center',
    marginBottom: Theme.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Theme.gray500,
    textAlign: 'center',
    marginBottom: Theme.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Theme.sm,
  },
  categoryGridItem: {
    width: (screenWidth - Theme.lg * 2 - Theme.sm * 2) / 3,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryGridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryGridGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Theme.sm,
    justifyContent: 'flex-end',
  },
  categoryGridName: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.white,
    textAlign: 'center',
  },

  // Collection Section (Dark) - Enhanced with Glassmorphism
  collectionSection: {
    backgroundColor: Theme.darkBlue,
    padding: Theme.lg,
    paddingVertical: Theme.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  glassOrb1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(254, 189, 105, 0.08)',
  },
  glassOrb2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  collectionContent: {
    flex: 1,
    marginRight: Theme.md,
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(254, 189, 105, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: Theme.md,
    borderWidth: 1,
    borderColor: 'rgba(254, 189, 105, 0.3)',
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.sm,
  },
  collectionBadgeText: {
    color: Theme.accent,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600',
  },
  collectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.white,
    lineHeight: 34,
  },
  collectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Theme.sm,
    lineHeight: 20,
    maxWidth: '95%',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Theme.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Theme.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.accent,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 4,
  },
  glassViewAllButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(254, 189, 105, 0.3)',
    borderRadius: 20,
  },
  viewAllButton: {
    paddingVertical: Theme.xs,
    paddingHorizontal: Theme.md,
    borderWidth: 1,
    borderColor: Theme.accent,
    borderRadius: 20,
  },
  viewAllText: {
    color: Theme.accent,
    fontSize: 12,
    fontWeight: '500',
  },

  // Products in Collection
  productsList: {
    paddingBottom: Theme.xl,
  },
  productRow: {
    paddingHorizontal: Theme.md,
    justifyContent: 'space-between',
    backgroundColor: Theme.darkBlue,
  },
  productCard: {
    backgroundColor: Theme.lightBlue,
    borderRadius: 12,
    marginBottom: Theme.md,
    width: '48%',
    overflow: 'hidden',
  },
  productImageContainer: {
    aspectRatio: 1,
    backgroundColor: Theme.white,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: Theme.sm,
  },
  productCategory: {
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: Theme.white,
    marginBottom: Theme.sm,
    minHeight: 34,
    lineHeight: 17,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Theme.white,
  },
  originalPrice: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  priceContainer: {
    flex: 1,
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cartButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  productBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  newBadge: {
    backgroundColor: '#00C853',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestsellerBadge: {
    backgroundColor: Theme.accentDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: Theme.white,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    // Glassmorphism effect
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  discountTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#FF3D00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountTagText: {
    color: Theme.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 2,
  },
  ratingText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginLeft: 4,
  },
  emptyProducts: {
    padding: Theme.xl,
    alignItems: 'center',
    backgroundColor: Theme.darkBlue,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },

  // Trust Section
  trustSection: {
    padding: Theme.lg,
    backgroundColor: Theme.white,
  },
  trustTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.gray900,
    textAlign: 'center',
    marginBottom: Theme.lg,
  },
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trustBadge: {
    alignItems: 'center',
    flex: 1,
  },
  trustIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(254, 189, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.sm,
  },
  trustBadgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.gray900,
    textAlign: 'center',
  },
  trustBadgeSubtitle: {
    fontSize: 10,
    color: Theme.gray500,
    textAlign: 'center',
    marginTop: 2,
  },

  // Seller CTA
  sellerCTA: {
    backgroundColor: Theme.darkBlue,
    padding: Theme.xl,
    alignItems: 'center',
  },
  sellerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.white,
    marginBottom: Theme.sm,
  },
  sellerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: Theme.lg,
  },
  sellerButton: {
    backgroundColor: Theme.accent,
    paddingVertical: Theme.md,
    paddingHorizontal: Theme.xl,
    borderRadius: 8,
  },
  sellerButtonText: {
    color: Theme.darkBlue,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Legacy styles for compatibility
  categoriesList: {
    paddingRight: Theme.md,
  },
  categoryCard: {
    width: 140,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    justifyContent: 'flex-end',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.white,
  },
});


