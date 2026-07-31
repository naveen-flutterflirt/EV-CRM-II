import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BackendPart } from '../types';

interface PartItemCardProps {
  part: BackendPart;
  onPress?: (part: BackendPart) => void;
  onAddToCart?: (part: BackendPart) => void;
  style?: ViewStyle;
}

export const PartItemCard: React.FC<PartItemCardProps> = ({
  part,
  onPress,
  onAddToCart,
  style,
}) => {
  const [addedAnimation, setAddedAnimation] = useState(false);

  const numericPrice = typeof part.mrp === 'string' ? parseFloat(part.mrp) : part.mrp;
  const formattedPrice = isNaN(numericPrice) || numericPrice === undefined || numericPrice === null
    ? '₹ --'
    : `₹${numericPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const categoryName = part.category?.categoryName || 'Ather 450X';

  const handlePlusClick = (e: any) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(part);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress && onPress(part)}
      style={[styles.cardContainer, style]}
    >
      {/* Left Thumbnail Container */}
      <View style={styles.thumbnailBox}>
        <Feather
          name={part.isBattery ? 'zap' : 'tool'}
          size={24}
          color={part.isBattery ? '#d97706' : '#558b14'}
        />
      </View>

      {/* Middle Info */}
      <View style={styles.middleInfo}>
        <Text style={styles.titleText} numberOfLines={1}>
          {part.partName}
        </Text>
        <Text style={styles.fitsText} numberOfLines={1}>
          Fits: {categoryName}
        </Text>
        <Text style={styles.priceText}>{formattedPrice}</Text>
      </View>

      {/* Right Action Button (Lime Green Circle Plus) */}
      <TouchableOpacity
        style={[styles.plusBtn, addedAnimation ? styles.plusBtnSuccess : null]}
        onPress={handlePlusClick}
        activeOpacity={0.75}
      >
        <Feather
          name={addedAnimation ? 'check' : 'plus'}
          size={20}
          color={addedAnimation ? '#ffffff' : '#1a2b0c'}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#f1f0f7',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    shadowColor: '#8a7db3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    height: 80,
  },
  thumbnailBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#f1f0f7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  middleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2b0c',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  fitsText: {
    fontSize: 11,
    color: '#8e8a9f',
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#558b14',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  plusBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#a2e52c',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  plusBtnSuccess: {
    backgroundColor: '#16a34a',
  },
});
