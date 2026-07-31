import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackendPart } from '../types';
import { Button, Badge } from '../../../../common/components';

interface PartDetailModalProps {
  part: BackendPart | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart?: (part: BackendPart, qty: number) => void;
}

export const PartDetailModal: React.FC<PartDetailModalProps> = ({
  part,
  visible,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState<number>(1);

  if (!part) return null;

  const numericPrice = typeof part.mrp === 'string' ? parseFloat(part.mrp) : part.mrp;
  const formattedPrice = isNaN(numericPrice) || numericPrice === undefined || numericPrice === null
    ? '₹ --'
    : `₹ ${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const categoryName = part.category?.categoryName || 'Spare Part';
  const isInStock = (part.qtyOnHand !== undefined ? part.qtyOnHand : 1) > 0;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(part, quantity);
    }
    const msg = `Added ${quantity} x ${part.partName} to your cart!`;
    if (Platform.OS === 'web') {
      window.alert(msg);
    } else {
      Alert.alert('Cart Updated', msg);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.skuText}>PART #{part.partNumber || 'N/A'}</Text>
                  <Text style={styles.title} numberOfLines={1}>{part.partName}</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Feather name="x" size={22} color="#71717a" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {/* Visual Image Banner */}
                <View style={[styles.imageBanner, part.isBattery ? styles.batteryBanner : styles.partBanner]}>
                  <Feather
                    name={part.isBattery ? 'zap' : 'tool'}
                    size={48}
                    color={part.isBattery ? '#d97706' : '#2563eb'}
                  />
                  <View style={styles.bannerBadges}>
                    <Badge label={categoryName.toUpperCase()} variant="info" />
                    {part.isBattery && <Badge label="⚡ EV BATTERY" variant="warning" />}
                    {part.isSerialized && <Badge label="🔒 SERIALIZED" variant="success" />}
                  </View>
                </View>

                {/* Price and Stock Box */}
                <View style={styles.priceBox}>
                  <View>
                    <Text style={styles.priceLabel}>MAXIMUM RETAIL PRICE (MRP)</Text>
                    <Text style={styles.priceText}>{formattedPrice}</Text>
                    <Text style={styles.gstText}>Inclusive of {part.defaultGstRate || 18}% GST</Text>
                  </View>

                  <Badge
                    label={isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                    variant={isInStock ? 'success' : 'danger'}
                  />
                </View>

                {/* Specifications Grid */}
                <Text style={styles.sectionTitle}>PART SPECIFICATIONS</Text>
                <View style={styles.specGrid}>
                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>HSN CODE</Text>
                    <Text style={styles.specValue}>{part.hsnCode || 'N/A'}</Text>
                  </View>

                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>UNIT OF MEASURE</Text>
                    <Text style={styles.specValue}>{part.uom || 'PCS'}</Text>
                  </View>

                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>REORDER LEVEL</Text>
                    <Text style={styles.specValue}>{part.reorderLevel || 5} units</Text>
                  </View>

                  <View style={styles.specItem}>
                    <Text style={styles.specLabel}>SERIALIZED TRACKING</Text>
                    <Text style={styles.specValue}>{part.isSerialized ? 'Required' : 'Standard'}</Text>
                  </View>
                </View>

                {/* Quantity Selector */}
                <Text style={styles.sectionTitle}>SELECT QUANTITY</Text>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Feather name="minus" size={18} color="#18181b" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => setQuantity((q) => q + 1)}
                  >
                    <Feather name="plus" size={18} color="#18181b" />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Action Button */}
              <View style={styles.footer}>
                <Button
                  title={`Add to Cart • ₹${(
                    (numericPrice || 0) * quantity
                  ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                  variant="primary"
                  onPress={handleAddToCart}
                  style={styles.addToCartBtn}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  skuText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    maxWidth: 240,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  imageBanner: {
    height: 120,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  partBanner: {
    backgroundColor: '#eff6ff',
  },
  batteryBanner: {
    backgroundColor: '#fffbeb',
  },
  bannerBadges: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    gap: 6,
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#16a34a',
  },
  gstText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 10,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  specItem: {
    width: '47%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    minWidth: 24,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  addToCartBtn: {
    backgroundColor: '#82b440',
    borderRadius: 12,
  },
});
