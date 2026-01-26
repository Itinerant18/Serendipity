import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCartStore } from '@/stores/cartStore';
import { BrandColors, NeutralColors, BackgroundColors, Shadows, BorderRadius, Spacing } from '@/constants/theme';

export default function CartScreen() {
  const {
    items,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/checkout');
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.productId, item.quantity - 1)}
          >
            <MaterialIcons name="remove" size={16} color={NeutralColors.gray700} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
          >
            <MaterialIcons name="add" size={16} color={NeutralColors.gray700} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          ${(item.price * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item.productId)}
        >
          <MaterialIcons name="delete-outline" size={20} color={BrandColors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="shopping-cart" size={80} color={NeutralColors.gray300} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started!</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(tabs)/products')}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{totalItems}</Text>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>${totalPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearCart}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.checkoutButtonText}>Checkout</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.neutral,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: BackgroundColors.neutral,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: NeutralColors.gray900,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    color: NeutralColors.gray500,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header
  header: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: NeutralColors.gray200,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: NeutralColors.gray900,
  },
  itemCountBadge: {
    backgroundColor: BrandColors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    minWidth: 28,
    alignItems: 'center',
  },
  itemCountText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Cart List
  cartList: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  cartItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    ...Shadows.md,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    backgroundColor: NeutralColors.gray100,
    marginRight: Spacing.sm,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: NeutralColors.gray900,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: NeutralColors.gray500,
    marginBottom: Spacing.sm,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: NeutralColors.gray100,
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    fontSize: 15,
    fontWeight: '600',
    color: NeutralColors.gray900,
    marginHorizontal: Spacing.md,
    minWidth: 24,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BrandColors.primary,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  
  // Footer
  footer: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: NeutralColors.gray200,
    ...Shadows.lg,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: NeutralColors.gray600,
  },
  totalPrice: {
    fontSize: 26,
    fontWeight: 'bold',
    color: NeutralColors.gray900,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  clearButton: {
    flex: 1,
    backgroundColor: NeutralColors.gray100,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: NeutralColors.gray600,
  },
  checkoutButton: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: BrandColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});