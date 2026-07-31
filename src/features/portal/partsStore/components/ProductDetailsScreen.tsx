import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackendPart } from '../types';

interface ProductDetailsScreenProps {
  part: BackendPart;
  evModelName?: string;
  cartCount?: number;
  onBack: () => void;
  onGoToCart: () => void;
  onAddToCart: (part: BackendPart, qty: number) => void;
}

export const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  part,
  evModelName = 'Ather 450X Gen 3',
  cartCount = 0,
  onBack,
  onGoToCart,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const numericPrice = typeof part.mrp === 'string' ? parseFloat(part.mrp) : part.mrp;
  const formattedPrice = isNaN(numericPrice) || numericPrice === undefined || numericPrice === null
    ? '₹ --'
    : `₹${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const isInStock = (part.qtyOnHand !== undefined ? part.qtyOnHand : 1) > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product details</Text>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="bell" size={20} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartIconBtn} onPress={onGoToCart}>
            <Feather name="shopping-bag" size={20} color="#0f172a" />
            {cartCount > 0 && (
              <View style={styles.cartBadgeCircle}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Hero Image Container */}
        <View style={styles.heroContainer}>
          <View style={styles.imagePlaceholder}>
            <Feather
              name={part.isBattery ? 'zap' : 'tool'}
              size={72}
              color={part.isBattery ? '#d97706' : '#65a30d'}
            />
          </View>
          {/* Pagination dots */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Product Meta Section */}
        <View style={styles.contentPadding}>
          {/* Stock Badge */}
          <View style={styles.stockBadgeContainer}>
            <View
              style={[
                styles.stockBadge,
                isInStock ? styles.lowStockBg : styles.outStockBg,
              ]}
            >
              <Text
                style={[
                  styles.stockBadgeText,
                  isInStock ? styles.lowStockText : styles.outStockText,
                ]}
              >
                {isInStock ? 'LOW STOCK' : 'OUT OF STOCK'}
              </Text>
            </View>
          </View>

          {/* Product Name & OEM */}
          <Text style={styles.productTitle}>{part.partName}</Text>
          <Text style={styles.oemText}>OEM: {part.partNumber || 'FF-BRK-2401'}</Text>

          {/* Price */}
          <Text style={styles.priceText}>{formattedPrice}</Text>

          {/* Compatibility Pill Box */}
          <View style={styles.compatPill}>
            <View style={styles.checkCircle}>
              <Feather name="check" size={12} color="#ffffff" />
            </View>
            <Text style={styles.compatText}>Fits your {evModelName}</Text>
          </View>

          {/* Description Section */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionParagraph}>
            High-performance components engineered for consistent stopping power and heat dissipation. Direct OEM fit — no modification required. Designed for optimum durability across high-mileage EV rides.
          </Text>

          {/* Specifications Table */}
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specTable}>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Material</Text>
              <Text style={styles.specValue}>{part.isBattery ? 'Lithium LFP' : 'Sintered metal'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>HSN Code</Text>
              <Text style={styles.specValue}>{part.hsnCode || '8714'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Unit of Measure</Text>
              <Text style={styles.specValue}>{part.uom || 'PCS'}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specKey}>Compatibility</Text>
              <Text style={styles.specValue}>{evModelName}</Text>
            </View>
          </View>

          {/* Warranty Note */}
          <View style={styles.warrantyRow}>
            <Feather name="shield" size={16} color="#475569" />
            <Text style={styles.warrantyText}>6-month manufacturer warranty</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyBox}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            <Feather name="minus" size={16} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.qtyNumber}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity((q) => q + 1)}
          >
            <Feather name="plus" size={16} color="#0f172a" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.addToCartBtn, addedSuccess ? styles.addToCartBtnSuccess : null]}
          onPress={() => {
            onAddToCart(part, quantity);
            setAddedSuccess(true);
            setTimeout(() => setAddedSuccess(false), 1500);
          }}
          activeOpacity={0.85}
        >
          <Text style={[styles.addToCartText, addedSuccess ? styles.addToCartTextSuccess : null]}>
            {addedSuccess ? `ADDED ${quantity} TO CART ✔` : 'ADD TO CART'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
  cartIconBtn: {
    padding: 4,
    position: 'relative',
  },
  cartBadgeCircle: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#65a30d',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  scrollBody: {
    flex: 1,
  },
  heroContainer: {
    height: 260,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imagePlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f4fce3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
  },
  dotActive: {
    backgroundColor: '#a3e635',
    width: 16,
  },
  contentPadding: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  stockBadgeContainer: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lowStockBg: {
    backgroundColor: '#fef9c3',
  },
  lowStockText: {
    color: '#ca8a04',
    fontSize: 10,
    fontWeight: 'bold',
  },
  outStockBg: {
    backgroundColor: '#fee2e2',
  },
  outStockText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  oemText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  priceText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  compatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    marginBottom: 24,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#65a30d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compatText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    fontFamily: 'PlusJakartaSans-SemiBold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  descriptionParagraph: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 24,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  specTable: {
    gap: 12,
    marginBottom: 24,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specKey: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  warrantyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 30,
  },
  warrantyText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Medium',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
    gap: 14,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 12,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    minWidth: 16,
    textAlign: 'center',
  },
  addToCartBtn: {
    flex: 1,
    backgroundColor: '#a3e635',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartBtnSuccess: {
    backgroundColor: '#16a34a',
  },
  addToCartText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  addToCartTextSuccess: {
    color: '#ffffff',
  },
});
