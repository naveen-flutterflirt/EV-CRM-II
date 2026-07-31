import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PartCategory, PartsFilter } from '../types';
import { Button, Badge } from '../../../../common/components';

interface PartsFilterModalProps {
  visible: boolean;
  onClose: () => void;
  categories: PartCategory[];
  currentFilter: PartsFilter;
  onApplyFilter: (newFilter: PartsFilter) => void;
  onResetFilter: () => void;
}

export const PartsFilterModal: React.FC<PartsFilterModalProps> = ({
  visible,
  onClose,
  categories,
  currentFilter,
  onApplyFilter,
  onResetFilter,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(currentFilter.categoryId || '');
  const [isBattery, setIsBattery] = useState<boolean | undefined>(currentFilter.isBattery as boolean | undefined);
  const [isSerialized, setIsSerialized] = useState<boolean | undefined>(currentFilter.isSerialized as boolean | undefined);
  const [sortBy, setSortBy] = useState<'partName' | 'mrp' | 'partNumber'>(
    (currentFilter.sortBy as 'partName' | 'mrp' | 'partNumber') || 'partName'
  );
  const [orderBy, setOrderBy] = useState<'ASC' | 'DESC'>(currentFilter.orderBy || 'ASC');

  const handleApply = () => {
    onApplyFilter({
      ...currentFilter,
      categoryId: selectedCategory || undefined,
      isBattery: isBattery !== undefined ? isBattery : undefined,
      isSerialized: isSerialized !== undefined ? isSerialized : undefined,
      sortBy,
      orderBy,
      page: 1, // Reset to page 1 on new filter application
    });
    onClose();
  };

  const handleReset = () => {
    setSelectedCategory('');
    setIsBattery(undefined);
    setIsSerialized(undefined);
    setSortBy('partName');
    setOrderBy('ASC');
    onResetFilter();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <Feather name="sliders" size={20} color="#18181b" />
                  <Text style={styles.title}>Filter & Sort Parts</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Feather name="x" size={22} color="#71717a" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                {/* Categories Section */}
                <Text style={styles.sectionHeading}>PART CATEGORIES</Text>
                <View style={styles.chipRow}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      selectedCategory === '' ? styles.chipSelected : null,
                    ]}
                    onPress={() => setSelectedCategory('')}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedCategory === '' ? styles.chipTextSelected : null,
                      ]}
                    >
                      All Categories
                    </Text>
                  </TouchableOpacity>
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.categoryId;
                    return (
                      <TouchableOpacity
                        key={cat.categoryId}
                        style={[styles.chip, isSelected ? styles.chipSelected : null]}
                        onPress={() => setSelectedCategory(cat.categoryId)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected ? styles.chipTextSelected : null,
                          ]}
                        >
                          {cat.categoryName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Special Types Section */}
                <Text style={styles.sectionHeading}>PRODUCT TYPES</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.toggleCard,
                      isBattery === true ? styles.toggleCardActive : null,
                    ]}
                    onPress={() => setIsBattery(isBattery === true ? undefined : true)}
                  >
                    <Feather
                      name="zap"
                      size={20}
                      color={isBattery === true ? '#d97706' : '#71717a'}
                    />
                    <View>
                      <Text style={styles.toggleTitle}>EV Batteries</Text>
                      <Text style={styles.toggleSub}>High voltage packs</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleCard,
                      isSerialized === true ? styles.toggleCardActive : null,
                    ]}
                    onPress={() => setIsSerialized(isSerialized === true ? undefined : true)}
                  >
                    <Feather
                      name="shield"
                      size={20}
                      color={isSerialized === true ? '#059669' : '#71717a'}
                    />
                    <View>
                      <Text style={styles.toggleTitle}>Serialized</Text>
                      <Text style={styles.toggleSub}>Unique barcode/SN</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Sort Options */}
                <Text style={styles.sectionHeading}>SORT BY</Text>
                <View style={styles.sortOptionsGroup}>
                  <TouchableOpacity
                    style={styles.sortRadioRow}
                    onPress={() => {
                      setSortBy('partName');
                      setOrderBy('ASC');
                    }}
                  >
                    <View style={styles.radioButton}>
                      {sortBy === 'partName' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.sortOptionLabel}>Name (A to Z)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sortRadioRow}
                    onPress={() => {
                      setSortBy('mrp');
                      setOrderBy('ASC');
                    }}
                  >
                    <View style={styles.radioButton}>
                      {sortBy === 'mrp' && orderBy === 'ASC' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.sortOptionLabel}>Price: Low to High</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sortRadioRow}
                    onPress={() => {
                      setSortBy('mrp');
                      setOrderBy('DESC');
                    }}
                  >
                    <View style={styles.radioButton}>
                      {sortBy === 'mrp' && orderBy === 'DESC' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.sortOptionLabel}>Price: High to Low</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sortRadioRow}
                    onPress={() => {
                      setSortBy('partNumber');
                      setOrderBy('ASC');
                    }}
                  >
                    <View style={styles.radioButton}>
                      {sortBy === 'partNumber' && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.sortOptionLabel}>Part Number / SKU</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.footer}>
                <Button
                  title="Reset All"
                  variant="outline"
                  onPress={handleReset}
                  style={styles.resetBtn}
                />
                <Button
                  title="Apply Filters"
                  variant="primary"
                  onPress={handleApply}
                  style={styles.applyBtn}
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
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#18181b',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#71717a',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
    borderColor: '#e4e4e7',
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#ecfdf5',
    borderColor: '#82b440',
  },
  chipText: {
    fontSize: 12,
    color: '#52525b',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#2e5b02',
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toggleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
    borderWidth: 1,
  },
  toggleCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  toggleTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  toggleSub: {
    fontSize: 10,
    color: '#64748b',
  },
  sortOptionsGroup: {
    gap: 10,
    marginBottom: 20,
  },
  sortRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#82b440',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#82b440',
  },
  sortOptionLabel: {
    fontSize: 13,
    color: '#18181b',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 8,
  },
  resetBtn: {
    flex: 1,
  },
  applyBtn: {
    flex: 2,
  },
});
