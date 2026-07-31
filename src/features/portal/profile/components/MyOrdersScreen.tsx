import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { OrderItem, OrderTabType } from '../types';

interface MyOrdersScreenProps {
  orders: OrderItem[];
  activeTab: OrderTabType;
  onTabChange: (tab: OrderTabType) => void;
  onBack: () => void;
}

export const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({
  orders,
  activeTab,
  onTabChange,
  onBack,
}) => {
  const tabs: OrderTabType[] = ['Active Orders', 'Past Orders', 'Returns'];

  const renderStatusBadge = (status: OrderItem['status']) => {
    let bg = '#e5e2d7';
    let color = '#6b685c';

    if (status === 'Out for delivery') {
      bg = '#e6f4ce';
      color = '#4d7c0f';
    } else if (status === 'Return Requested') {
      bg = '#fef3c7';
      color = '#b45309';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header Bar */}
      <View style={styles.topHeader}>
        <Text style={styles.homeTitle}>Home</Text>
        <TouchableOpacity style={styles.avatarCircle}>
          <Feather name="user" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Sub Header Bar with Back Arrow */}
      <View style={styles.subHeader}>
        <View style={styles.subHeaderLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.myOrdersTitle}>My orders</Text>
        </View>

        <TouchableOpacity style={styles.bellBtn}>
          <Feather name="bell" size={18} color="#0f172a" />
          <View style={styles.greenBellDot} />
        </TouchableOpacity>
      </View>

      {/* 3 Tab Selector Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, isActive ? styles.tabItemActive : null]}
              onPress={() => onTabChange(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
                {tab}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Orders Content Scroll Body */}
      <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.ordersListGroup}>
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="package" size={44} color="#cbd5e1" />
              <Text style={styles.emptyTitle}>No orders in {activeTab}</Text>
              <Text style={styles.emptySub}>Your purchased items will appear here</Text>
            </View>
          ) : (
            orders.map((item) => (
              <View key={item.id} style={styles.orderCard}>
                {/* Top Row: Order Number & Status Badge */}
                <View style={styles.cardTopRow}>
                  <Text style={styles.orderNumberText}>{item.orderNumber}</Text>
                  {renderStatusBadge(item.status)}
                </View>

                {/* Middle Item Row */}
                <View style={styles.cardMiddleRow}>
                  <View style={styles.thumbBox}>
                    <Feather
                      name={
                        item.imageType === 'charger'
                          ? 'battery-charging'
                          : item.imageType === 'brakes'
                          ? 'disc'
                          : item.imageType === 'bulb'
                          ? 'zap'
                          : item.imageType === 'sensor'
                          ? 'sliders'
                          : 'box'
                      }
                      size={26}
                      color="#65a30d"
                    />
                  </View>

                  <View style={styles.itemMeta}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemDate}>{item.date}</Text>
                  </View>
                </View>

                {/* Bottom Total Paid Row */}
                <View style={styles.cardDivider} />
                <View style={styles.cardBottomRow}>
                  <Text style={styles.totalPaidLabel}>Total paid</Text>
                  <Text style={styles.totalPaidVal}>
                    {item.currency}{item.totalPaid.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
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
    paddingVertical: 12,
    backgroundColor: '#faf8fc',
  },
  homeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4d7c0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  subHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  myOrdersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  bellBtn: {
    padding: 4,
    position: 'relative',
  },
  greenBellDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#84cc16',
    position: 'absolute',
    top: 2,
    right: 2,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  tabTextActive: {
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#84cc16',
  },
  bodyScroll: {
    flex: 1,
    backgroundColor: '#f7f4ea',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  ordersListGroup: {
    gap: 16,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748b',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderNumberText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#f1f0f7',
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
    marginBottom: 4,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  itemDate: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalPaidLabel: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  totalPaidVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
});
