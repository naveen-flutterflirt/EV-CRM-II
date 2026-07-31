import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackendPart } from '../types';

export interface CartItem {
  part: BackendPart;
  quantity: number;
}

interface MyCartScreenProps {
  cartItems: CartItem[];
  onBack: () => void;
  onUpdateQty: (partId: string, delta: number) => void;
  onRemoveItem: (partId: string) => void;
  onProceedToAddress: () => void;
}

export const MyCartScreen: React.FC<MyCartScreenProps> = ({
  cartItems,
  onBack,
  onUpdateQty,
  onRemoveItem,
  onProceedToAddress,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.part.mrp === 'string' ? parseFloat(item.part.mrp) : item.part.mrp || 0;
    return sum + price * item.quantity;
  }, 0);

  const gstTax = subtotal * 0.18;
  const total = subtotal + gstTax - appliedDiscount;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'EV10') {
      setAppliedDiscount(subtotal * 0.1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My cart</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Feather name="bell" size={20} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCartContainer}>
          <Feather name="shopping-bag" size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Browse parts in store and add items to your cart</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={onBack}>
            <Text style={styles.browseText}>Browse Spare Parts</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Cart Item Cards */}
          <View style={styles.itemsGroup}>
            {cartItems.map(({ part, quantity }) => {
              const price = typeof part.mrp === 'string' ? parseFloat(part.mrp) : part.mrp || 0;
              return (
                <View key={part.partId} style={styles.cartCard}>
                  <View style={styles.cardTopRow}>
                    {/* Image Thumbnail */}
                    <View style={styles.thumbBox}>
                      <Feather
                        name={part.isBattery ? 'zap' : 'tool'}
                        size={28}
                        color={part.isBattery ? '#d97706' : '#65a30d'}
                      />
                    </View>

                    {/* Title & Fits */}
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {part.partName}
                      </Text>
                      <Text style={styles.itemFits}>
                        Fits: {part.category?.categoryName || 'Universal'}
                      </Text>
                      <Text style={styles.itemPrice}>
                        ₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </Text>
                    </View>

                    {/* Qty Controls */}
                    <View style={styles.rightControlCol}>
                      <View style={styles.qtyBox}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => onUpdateQty(part.partId, -1)}
                        >
                          <Feather name="minus" size={14} color="#0f172a" />
                        </TouchableOpacity>
                        <Text style={styles.qtyNum}>{quantity}</Text>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => onUpdateQty(part.partId, 1)}
                        >
                          <Feather name="plus" size={14} color="#0f172a" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() => onRemoveItem(part.partId)}
                        style={styles.removeTouch}
                      >
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Cost Summary Box */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item subtotal</Text>
              <Text style={styles.summaryVal}>₹{subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Estimated tax (GST 18%)</Text>
              <Text style={styles.summaryVal}>₹{gstTax.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping fee</Text>
              <Text style={[styles.summaryVal, styles.freeText]}>Free</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalVal}>₹{total.toFixed(2)}</Text>
            </View>
          </View>

          {/* Discount Code Box */}
          <View style={styles.promoContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter discount code"
              placeholderTextColor="#94a3b8"
              value={promoCode}
              onChangeText={setPromoCode}
            />
            <TouchableOpacity style={styles.applyBtn} onPress={handleApplyPromo}>
              <Text style={styles.applyText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Bottom Sticky Action Button */}
      {cartItems.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={onProceedToAddress}
            activeOpacity={0.85}
          >
            <Text style={styles.proceedText}>Proceed to Address</Text>
            <Feather name="arrow-right" size={18} color="#1a2b0c" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
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
  iconBtn: {
    padding: 4,
  },
  scrollBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 14,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: '#a3e635',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  browseText: {
    color: '#1a2b0c',
    fontWeight: 'bold',
  },
  itemsGroup: {
    gap: 12,
    marginBottom: 20,
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbBox: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#f4fce3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemMeta: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  itemFits: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  rightControlCol: {
    alignItems: 'flex-end',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
    marginBottom: 6,
  },
  qtyBtn: {
    padding: 2,
  },
  qtyNum: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  removeTouch: {
    paddingVertical: 2,
  },
  removeText: {
    fontSize: 11,
    color: '#94a3b8',
    textDecorationLine: 'underline',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  summaryCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  freeText: {
    color: '#65a30d',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  promoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 30,
  },
  promoInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  applyBtn: {
    paddingHorizontal: 12,
  },
  applyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#65a30d',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  proceedBtn: {
    backgroundColor: '#a3e635',
    borderRadius: 24,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  proceedText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
