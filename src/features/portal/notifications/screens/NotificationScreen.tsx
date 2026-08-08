import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CustomerNotificationItem } from '../types';
import {
  fetchCustomerNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../api';

interface NotificationScreenProps {
  onBack: () => void;
}

function parseNotificationContent(item: CustomerNotificationItem) {
  const title = item.title || 'Notification';
  const body = item.body || '';
  const isAppointment = title.toLowerCase().includes('appointment') || body.toLowerCase().includes('appointment') || item.type === 'appointment';

  let aptCode: string | null = null;
  const aptMatch = body.match(/APT-[\w\d]+/i);
  if (aptMatch) {
    aptCode = aptMatch[0];
  }

  let cleanBody = body;
  const rawDateMatch = body.match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}(?:,?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)?/i);
  if (rawDateMatch) {
    try {
      const parsedDate = new Date(rawDateMatch[0]);
      if (!isNaN(parsedDate.getTime())) {
        const formatted = parsedDate.toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) + ' at ' + parsedDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
        cleanBody = cleanBody.replace(rawDateMatch[0], formatted);
      }
    } catch (_e) {}
  }

  if (aptCode) {
    cleanBody = cleanBody.replace(`(${aptCode})`, '').replace(aptCode, '').replace(/\s+/g, ' ').trim();
  }

  let formattedCreatedTime = '';
  if (item.createdAt) {
    try {
      const createdDate = new Date(item.createdAt);
      if (!isNaN(createdDate.getTime())) {
        const now = new Date();
        const isToday = createdDate.toDateString() === now.toDateString();
        if (isToday) {
          formattedCreatedTime = `Today • ${createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
        } else {
          formattedCreatedTime = createdDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
        }
      }
    } catch (_e) {}
  }

  return {
    title,
    cleanBody,
    aptCode,
    isAppointment,
    formattedCreatedTime,
  };
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<CustomerNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const list = await fetchCustomerNotificationsApi();
      setNotifications(list);
    } catch (_err) {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationAsReadApi(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsReadApi();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.8}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#84cc16" />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#84cc16" />
          </View>
        ) : notifications.length > 0 ? (
          <View style={styles.listContainer}>
            {notifications.map((item) => {
              const { title, cleanBody, aptCode, isAppointment, formattedCreatedTime } = parseNotificationContent(item);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.notifCard,
                    isAppointment && styles.appointmentCard,
                    !item.isRead && styles.unreadCard,
                  ]}
                  onPress={() => handleMarkRead(item.id)}
                  activeOpacity={0.85}
                >
                  {/* Left Green Accent Bar */}
                  {isAppointment && <View style={styles.leftAccentBar} />}

                  <View style={styles.cardInner}>
                    {/* Icon Circle */}
                    <View style={[styles.iconCircle, isAppointment ? styles.aptIconCircle : (!item.isRead && styles.unreadIconCircle)]}>
                      <Feather
                        name={isAppointment ? 'calendar' : (item.type === 'alert' ? 'alert-circle' : item.type === 'service' ? 'settings' : 'bell')}
                        size={18}
                        color={isAppointment ? '#4d7c0f' : (!item.isRead ? '#3f6212' : '#64748b')}
                      />
                    </View>

                    <View style={styles.notifMeta}>
                      {/* Title Header */}
                      <View style={styles.titleRow}>
                        <Text style={[styles.notifTitle, !item.isRead && styles.unreadTitleText]}>
                          {title}
                        </Text>
                        {!item.isRead && <View style={styles.unreadDot} />}
                      </View>

                      {/* Appointment Code Pill */}
                      {aptCode ? (
                        <View style={styles.aptPill}>
                          <Feather name="hash" size={10} color="#4d7c0f" style={{ marginRight: 3 }} />
                          <Text style={styles.aptPillText}>{aptCode}</Text>
                        </View>
                      ) : null}

                      {/* Body Text */}
                      <Text style={styles.notifBody}>{cleanBody}</Text>

                      {/* Footer Time */}
                      {formattedCreatedTime ? (
                        <View style={styles.footerRow}>
                          <Feather name="clock" size={11} color="#94a3b8" style={{ marginRight: 4 }} />
                          <Text style={styles.notifTime}>{formattedCreatedTime}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          /* Empty State Screen when 0 notifications exist */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBadge}>
              <Feather name="bell-off" size={32} color="#84cc16" />
            </View>
            <Text style={styles.emptyTitle}>You're All Caught Up!</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any new notifications at the moment. We'll alert you here as soon as there are updates regarding your EV or service bookings.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4d7c0f',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  listContainer: {
    gap: 12,
  },
  notifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  appointmentCard: {
    borderColor: '#d9f99d',
  },
  unreadCard: {
    backgroundColor: '#fcfdfa',
    borderColor: '#bef264',
  },
  leftAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#4d7c0f',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  aptIconCircle: {
    backgroundColor: '#ecfccb',
    borderWidth: 1,
    borderColor: '#d9f99d',
  },
  unreadIconCircle: {
    backgroundColor: '#ecfccb',
  },
  notifMeta: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  unreadTitleText: {
    color: '#0f172a',
    fontWeight: '800',
  },
  aptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f7fee7',
    borderWidth: 1,
    borderColor: '#d9f99d',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  aptPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3f6212',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.3,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#84cc16',
  },
  notifBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  notifTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f7fee7',
    borderWidth: 1.5,
    borderColor: '#d9f99d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#84cc16',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});
