import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CustomerNotificationItem } from '../types';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  notifications: CustomerNotificationItem[];
  loading?: boolean;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  notifications,
  loading = false,
  onMarkRead,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.bellIconCircle}>
                <Feather name="bell" size={18} color="#4d7c0f" />
              </View>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>{unreadCount} NEW</Text>
                </View>
              )}
            </View>

            <View style={styles.headerActions}>
              {unreadCount > 0 && onMarkAllRead && (
                <TouchableOpacity
                  style={styles.markAllBtn}
                  onPress={onMarkAllRead}
                  activeOpacity={0.8}
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Feather name="x" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content Feed */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#4d7c0f" />
              <Text style={styles.loadingText}>Fetching updates...</Text>
            </View>
          ) : notifications.length === 0 ? (
            /* Elegant Empty State (Clean real-time empty state) */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBadge}>
                <Feather name="bell-off" size={32} color="#84cc16" />
              </View>
              <Text style={styles.emptyTitle}>All Caught Up!</Text>
              <Text style={styles.emptySubtitle}>
                You don't have any new notifications at the moment. We'll update you here as soon as there are alerts regarding your EV or services.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.feedScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.feedList}>
                {notifications.map((item) => {
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

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.notifCard,
                        isAppointment && styles.appointmentCard,
                        !item.isRead && styles.unreadNotifCard,
                      ]}
                      onPress={() => !item.isRead && onMarkRead && onMarkRead(item.id)}
                      activeOpacity={0.85}
                    >
                      {isAppointment && <View style={styles.leftAccentBar} />}
                      <View style={styles.cardInner}>
                        <View style={[styles.iconCircle, isAppointment ? styles.aptIconCircle : (!item.isRead && styles.unreadIconCircle)]}>
                          <Feather
                            name={isAppointment ? 'calendar' : (item.type === 'alert' ? 'alert-circle' : item.type === 'service' ? 'settings' : 'bell')}
                            size={16}
                            color={isAppointment ? '#4d7c0f' : (!item.isRead ? '#3f6212' : '#64748b')}
                          />
                        </View>
                        <View style={styles.notifMeta}>
                          <View style={styles.notifHeader}>
                            <Text style={styles.notifTitle}>{title}</Text>
                            {!item.isRead && <View style={styles.unreadDot} />}
                          </View>
                          {aptCode ? (
                            <View style={styles.aptPill}>
                              <Feather name="hash" size={10} color="#4d7c0f" style={{ marginRight: 3 }} />
                              <Text style={styles.aptPillText}>{aptCode}</Text>
                            </View>
                          ) : null}
                          <Text style={styles.notifBody}>{cleanBody}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 36,
    maxHeight: '80%',
    minHeight: 340,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bellIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecfccb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  unreadBadge: {
    backgroundColor: '#84cc16',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  unreadBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1a2b0c',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  closeBtn: {
    padding: 4,
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f7fee7',
    borderWidth: 1,
    borderColor: '#d9f99d',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'PlusJakartaSans-Regular',
  },
  feedScroll: {},
  feedList: {
    gap: 10,
    paddingBottom: 10,
  },
  notifCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  appointmentCard: {
    borderColor: '#d9f99d',
  },
  unreadNotifCard: {
    backgroundColor: '#fcfdfa',
    borderColor: '#bef264',
  },
  leftAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#4d7c0f',
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#84cc16',
  },
  aptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f7fee7',
    borderWidth: 1,
    borderColor: '#d9f99d',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    marginBottom: 6,
  },
  aptPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3f6212',
    fontFamily: 'PlusJakartaSans-Bold',
    letterSpacing: 0.3,
  },
  notifBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});
