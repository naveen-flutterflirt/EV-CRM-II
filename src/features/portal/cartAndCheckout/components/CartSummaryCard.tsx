import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CartSummaryCardProps {
  subtotal: number;
  gstTax: number;
  shippingFee?: number;
  discount?: number;
  total: number;
}

export const CartSummaryCard: React.FC<CartSummaryCardProps> = ({
  subtotal,
  gstTax,
  shippingFee = 0,
  discount = 0,
  total,
}) => {
  return (
    <View style={styles.card}>
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
        <Text style={[styles.summaryVal, styles.freeText]}>
          {shippingFee > 0 ? `₹${shippingFee.toFixed(2)}` : 'Free'}
        </Text>
      </View>

      {discount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount applied</Text>
          <Text style={[styles.summaryVal, styles.discountText]}>- ₹{discount.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.summaryDivider} />

      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalVal}>₹{total.toFixed(2)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderColor: '#e2e8f0',
    borderWidth: 1,
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
  discountText: {
    color: '#dc2626',
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
    fontFamily: 'PlusJakartaSans-Bold',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
