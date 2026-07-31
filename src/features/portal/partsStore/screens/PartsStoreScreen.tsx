import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Switch,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useInfinitePartsCatalog, usePartCategories, useUserVehicles } from '../hooks/usePartsStore';
import { BackendPart, PartsFilter } from '../types';
import { PartItemCard } from '../components/PartItemCard';
import { ProductDetailsScreen } from '../components/ProductDetailsScreen';
import { MyCartScreen, DeliveryAddressScreen, useCartState } from '../../cartAndCheckout';
import { LoadingScreen } from '../../../../common/components';

interface PartsStoreScreenProps {
  onBack?: () => void;
}

export const PartsStoreScreen: React.FC<PartsStoreScreenProps> = ({ onBack }) => {
  const [viewState, setViewState] = useState<'STORE' | 'PRODUCT_DETAILS' | 'CART' | 'ADDRESS'>('STORE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCompatibleOnly, setIsCompatibleOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<BackendPart | null>(null);

  // Hook into Redis-backed persistent cart state
  const {
    items: cartItems,
    addItem: handleAddToCart,
    updateQuantity: handleUpdateCartQty,
    removeItem: handleRemoveCartItem,
    clearCart,
    totalCount: totalCartCount,
  } = useCartState();

  // Fetch user's registered EV model dynamically from backend
  const { data: userVehicles } = useUserVehicles();
  const evModelName = useMemo(() => {
    if (userVehicles && userVehicles.length > 0) {
      const v = userVehicles[0];
      const brandStr = typeof v.brand === 'string' ? v.brand : (v.manufacturer?.manufacturerName || 'Ather');
      const modelStr = typeof v.model === 'string' ? v.model : (v.model?.modelName || '450X Gen 3');
      return `${brandStr} ${modelStr}`;
    }
    return 'Ather 450X Gen 3';
  }, [userVehicles]);

  // Combine search query into active filter
  const activeFilter = useMemo(() => {
    const filter: PartsFilter = {};
    if (searchQuery.trim()) filter.search = searchQuery.trim();
    if (selectedCategory) filter.categoryId = selectedCategory;
    if (isCompatibleOnly) filter.search = (filter.search || '') + ' Ather';
    return filter;
  }, [searchQuery, selectedCategory, isCompatibleOnly]);

  // Fetch infinite paginated parts list with placeholderData (non-flashing search)
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePartsCatalog(activeFilter, 10);

  // Fetch categories dynamically
  const { data: categories = [] } = usePartCategories();

  // Flatten infinite query pages into a single array
  const allParts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data || []);
  }, [data]);

  // Top 6 Category Chips
  const categoryChips = [
    { id: 'cat_bat', name: 'EV Batteries', icon: 'zap' },
    { id: 'cat_chg', name: 'Portable Chargers', icon: 'battery-charging' },
    { id: 'cat_disc', name: 'Brake Discs', icon: 'disc' },
    { id: 'cat_tyre', name: 'Tyres & Tubes', icon: 'circle' },
    { id: 'cat_helm', name: 'Riding Helmets', icon: 'shield' },
    { id: 'cat_mnt', name: 'Mobile Mounts', icon: 'smartphone' },
  ];

  // Header component for Store View matching Image 1 Left
  const renderStoreHeader = () => (
    <View style={styles.storeHeaderSection}>
      {/* Top Bar: Branch Selector & Avatar */}
      <View style={styles.topBranchBar}>
        <TouchableOpacity style={styles.branchSelector}>
          <Text style={styles.branchLabel}>BRANCH</Text>
          <View style={styles.branchRow}>
            <Text style={styles.branchName}>Bhopal Head Office</Text>
            <Feather name="chevron-down" size={16} color="#0f172a" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarBtn}>
          <Feather name="user" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Main Title */}
      <Text style={styles.mainTitle}>Spare parts store</Text>

      {/* Search Input Pill */}
      <View style={styles.searchPill}>
        <Feather name="search" size={18} color="#8e8a9f" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { outlineStyle: 'none' } as any]}
          placeholder="Search parts, SKU, or OEM code"
          placeholderTextColor="#8e8a9f"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x-circle" size={16} color="#8e8a9f" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* EV Compatibility Toggle Card */}
      <View style={styles.compatToggleCard}>
        <View style={styles.toggleTextCol}>
          <Text style={styles.compatTitle}>Show parts compatible with my EV</Text>
          <Text style={styles.compatSub}>{evModelName}</Text>
        </View>
        <Switch
          value={isCompatibleOnly}
          onValueChange={setIsCompatibleOnly}
          trackColor={{ false: '#cbd5e1', true: '#a3e635' }}
          thumbColor={isCompatibleOnly ? '#4d7c0f' : '#f8fafc'}
        />
      </View>

      {/* 6 Category Cards Grid (2 rows of 3) */}
      <View style={styles.categoryGrid}>
        {categoryChips.map((chip, idx) => {
          const matchedCategory = categories[idx];
          const catId = matchedCategory?.categoryId || chip.id;
          const isSelected = selectedCategory === catId;
          return (
            <TouchableOpacity
              key={chip.id}
              style={[
                styles.categoryCard,
                isSelected ? styles.categoryCardSelected : null,
              ]}
              onPress={() => {
                setSelectedCategory(isSelected ? null : catId);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.categoryIconCircle}>
                <Feather name={chip.icon as any} size={20} color="#65a30d" />
              </View>
              <Text style={styles.categoryCardName} numberOfLines={2}>
                {matchedCategory?.categoryName || chip.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Popular Items Heading */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.popularHeading}>Popular items</Text>
        {allParts.length > 0 && (
          <Text style={styles.resultsCountText}>{allParts.length} items</Text>
        )}
      </View>
    </View>
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color="#65a30d" />
        </View>
      );
    }
    return <View style={{ height: 20 }} />;
  };

  // --- Sub-Screen Renders ---

  if (viewState === 'PRODUCT_DETAILS' && selectedPart) {
    return (
      <ProductDetailsScreen
        part={selectedPart}
        evModelName={evModelName}
        cartCount={totalCartCount}
        onBack={() => setViewState('STORE')}
        onGoToCart={() => setViewState('CART')}
        onAddToCart={(part, qty) => handleAddToCart(part, qty)}
      />
    );
  }

  if (viewState === 'CART') {
    return (
      <MyCartScreen
        cartItems={cartItems}
        onBack={() => setViewState('STORE')}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToAddress={() => setViewState('ADDRESS')}
      />
    );
  }

  if (viewState === 'ADDRESS') {
    return (
      <DeliveryAddressScreen
        onBack={() => setViewState('CART')}
        onProceedToPayment={(address) => {
          const msg = `Order placed successfully! Delivering to ${address.title} (${address.address}).`;
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('Order Confirmed', msg);
          clearCart();
          setViewState('STORE');
        }}
      />
    );
  }

  // --- Main Store Screen Render (Image 1 Left) ---
  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading && !isRefetching && !allParts.length ? (
        <LoadingScreen message="Loading spare parts..." />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={40} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load products</Text>
          <Text style={styles.errorSub}>
            {(error as any)?.message || 'Could not connect to backend server'}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={allParts}
          keyExtractor={(item) => item.partId || item.partNumber}
          renderItem={({ item }) => (
            <PartItemCard
              part={item}
              onPress={(p) => {
                setSelectedPart(p);
                setViewState('PRODUCT_DETAILS');
              }}
              onAddToCart={(p) => handleAddToCart(p, 1)}
            />
          )}
          ListHeaderComponent={renderStoreHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              colors={['#65a30d']}
              tintColor="#65a30d"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f6fd',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  storeHeaderSection: {
    paddingTop: 12,
    paddingBottom: 10,
  },
  topBranchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  branchSelector: {},
  branchLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#78866b',
    letterSpacing: 1,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  avatarBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#a3e635',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a2b0c',
    marginBottom: 16,
    letterSpacing: -0.5,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ece8f5',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  compatToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginBottom: 16,
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  compatTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a2b0c',
    marginBottom: 2,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  compatSub: {
    fontSize: 11,
    color: '#8e8a9f',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 24,
  },
  categoryCard: {
    width: '31%',
    backgroundColor: '#ede9f4',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 96,
  },
  categoryCardSelected: {
    backgroundColor: '#f4fce3',
    borderColor: '#84cc16',
    borderWidth: 1.5,
  },
  categoryIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryCardName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1a2b0c',
    textAlign: 'center',
    lineHeight: 13,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  popularHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  resultsCountText: {
    fontSize: 11,
    color: '#8e8a9f',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  loadingFooter: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 4,
  },
  errorSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#84cc16',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: '#1a2b0c',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
