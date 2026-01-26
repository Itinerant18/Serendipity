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
import {
  BrandColors,
  NeutralColors,
  BackgroundColors,
  GlassEffects,
  Shadows,
  Spacing,
  BorderRadius
} from '@/constants/theme';

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
            <Ionicons name="heart-outline" size={18} color={NeutralColors.white} />
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
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.floor(rating) ? 'star' : 'star-outline'}
                size={12}
                color={BrandColors.starGold}
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
                colors={[BrandColors.cta, '#FFD700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cartButtonGradient}
              >
                <MaterialIcons name="add-shopping-cart" size={16} color={NeutralColors.white} />
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
        <ActivityIndicator size="large" color={BrandColors.primary} />
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
            placeholderTextColor={NeutralColors.gray200}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={NeutralColors.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(tabs)/cart')}>
          <Feather name="shopping-cart" size={22} color={NeutralColors.white} />
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
                    <MaterialIcons name="arrow-forward" size={16} color={BrandColors.primary} />
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
        colors={[BrandColors.primaryActive, '#1a2634', BrandColors.primaryActive]}
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
              <MaterialIcons name="arrow-forward" size={14} color={BrandColors.cta} />
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
                <MaterialIcons name={badge.icon as any} size={28} color={BrandColors.primary} />
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
      <StatusBar barStyle="light-content" backgroundColor={BrandColors.primary} />
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
    backgroundColor: BackgroundColors.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BackgroundColors.light,
  },

  // Header
  header: {
    backgroundColor: BrandColors.primary,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.md, // Add subtle shadow
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
  },
  logoText: {
    color: NeutralColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Glass effect
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: NeutralColors.white,
  },
  searchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'relative',
    padding: Spacing.xs,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: BrandColors.cta, // Orange CTA
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BrandColors.primary,
  },
  cartBadgeText: {
    color: NeutralColors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Hero Carousel
  heroContainer: {
    height: 220,
    position: 'relative',
    marginTop: 0,
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
    padding: Spacing.lg,
    justifyContent: 'space-between',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  trendingBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)', // Brand primary
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  trendingText: {
    color: NeutralColors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: BrandColors.cta, // Orange
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    color: NeutralColors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  heroContent: {
    maxWidth: '70%',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: NeutralColors.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    gap: 6,
    ...Shadows.sm,
  },
  heroButtonText: {
    color: BrandColors.primary,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  indicatorActive: {
    backgroundColor: NeutralColors.white,
    width: 24,
  },

  // Categories Section (Light)
  sectionLight: {
    padding: Spacing.lg,
    backgroundColor: BackgroundColors.light,
  },
  sectionTitleDark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BrandColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  categoryGridItem: {
    width: (screenWidth - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    height: 100,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
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
    padding: Spacing.sm,
    justifyContent: 'flex-end',
    height: '100%',
  },
  categoryGridName: {
    fontSize: 11,
    fontWeight: '600',
    color: NeutralColors.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Collection Section (Dark) - Enhanced with Glassmorphism
  collectionSection: {
    backgroundColor: BrandColors.textPrimary, // Slate 800
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
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
    backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue glow
  },
  glassOrb2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(96, 165, 250, 0.1)', // Light blue glow
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  collectionContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  glassBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)', // Orange tint
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  collectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  collectionBadgeText: {
    color: BrandColors.cta,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600',
  },
  collectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: NeutralColors.white,
    lineHeight: 34,
  },
  collectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: Spacing.sm,
    lineHeight: 20,
    maxWidth: '95%',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: Spacing.md,
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
    color: BrandColors.secondary,
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
    borderColor: 'rgba(96, 165, 250, 0.3)', // Blue tint
    borderRadius: 20,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
  },
  viewAllButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: BrandColors.secondary,
    borderRadius: 20,
  },
  viewAllText: {
    color: BrandColors.secondary,
    fontSize: 12,
    fontWeight: '500',
  },

  // Products in Collection
  productsList: {
    paddingBottom: Spacing.xl,
  },
  productRow: {
    paddingHorizontal: Spacing.md,
    justifyContent: 'space-between',
    backgroundColor: BackgroundColors.light, // Match container
    paddingTop: Spacing.md,
  },
  productCard: {
    backgroundColor: NeutralColors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    width: '48%',
    overflow: 'hidden',
    ...Shadows.sm, // Subtle shadow for lift
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  productImageContainer: {
    aspectRatio: 1,
    backgroundColor: NeutralColors.gray50,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfo: {
    padding: Spacing.sm,
  },
  productCategory: {
    fontSize: 9,
    fontWeight: '600',
    color: BrandColors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
    marginBottom: Spacing.sm,
    minHeight: 34,
    lineHeight: 18,
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: BrandColors.textPrimary,
  },
  originalPrice: {
    fontSize: 11,
    color: BrandColors.textTertiary,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  priceContainer: {
    flex: 1,
  },
  addToCartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.sm,
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
    backgroundColor: BrandColors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestsellerBadge: {
    backgroundColor: BrandColors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: NeutralColors.white,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  discountTag: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: BrandColors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountTagText: {
    color: NeutralColors.white,
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
    color: BrandColors.textSecondary,
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyProducts: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: BrandColors.textSecondary,
    fontSize: 14,
  },

  // Trust Section
  trustSection: {
    padding: Spacing.lg,
    backgroundColor: NeutralColors.white,
    marginTop: Spacing.md,
  },
  trustTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: BrandColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
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
    backgroundColor: BackgroundColors.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: NeutralColors.gray100,
  },
  trustBadgeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
    textAlign: 'center',
  },
  trustBadgeSubtitle: {
    fontSize: 10,
    color: BrandColors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },

  // Seller CTA
  sellerCTA: {
    backgroundColor: BrandColors.textPrimary, // Slate 800
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sellerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: NeutralColors.white,
    marginBottom: Spacing.sm,
  },
  sellerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  sellerButton: {
    backgroundColor: BrandColors.cta,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    ...Shadows.md,
  },
  sellerButtonText: {
    color: NeutralColors.white,
    fontSize: 14,
    fontWeight: '600',
  },

  // Legacy styles for compatibility
  categoriesList: {
    paddingRight: Spacing.md,
  },
  categoryCard: {
    width: 140,
    height: 100,
    borderRadius: BorderRadius.lg,
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
    color: NeutralColors.white,
  },
});


