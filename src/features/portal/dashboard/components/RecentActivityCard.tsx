import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../../../../common/components/Card';
import { ActivityItem } from '../types';

interface RecentActivityCardProps {
  activities?: ActivityItem[];
  onActivityPress?: (activity: ActivityItem) => void;
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities, onActivityPress }) => {
  const activityList = activities || [];

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Recent activity</Text>

      <Card style={styles.cardContainer}>
        {activityList.length > 0 ? (
          activityList.map((item, index) => {
            const isLast = index === activityList.length - 1;
            const isCompleted = item.type === 'completed' || item.type === 'delivered' || item.type === 'closed';

            return (
              <TouchableOpacity
                key={item.id || index}
                style={[styles.activityRow, !isLast && styles.rowBorder]}
                onPress={() => onActivityPress && onActivityPress(item)}
                activeOpacity={0.7}
                disabled={!onActivityPress}
              >
                {/* Icon Circle */}
                <View style={[styles.iconCircle, isCompleted ? styles.completedCircle : styles.otaCircle]}>
                  <Text style={[styles.iconText, isCompleted ? styles.completedIconText : styles.otaIconText]}>
                    {isCompleted ? '✓' : '⚡'}
                  </Text>
                </View>

                {/* Text Info */}
                <View style={styles.textContainer}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activitySubtitle}>{item.subtitle}</Text>
                </View>

                {/* Chevron icon to show it is interactive */}
                {onActivityPress && (
                  <Feather name="chevron-right" size={16} color="#a1a1aa" />
                )}
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={styles.noActivitiesText}>No recent activity logged yet.</Text>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27272a',
    marginBottom: 10,
  },
  cardContainer: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
    borderWidth: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCircle: {
    backgroundColor: '#84cc16',
  },
  otaCircle: {
    backgroundColor: '#f4f4f5',
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  completedIconText: {
    color: '#ffffff',
  },
  otaIconText: {
    color: '#71717a',
  },
  textContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  noActivitiesText: {
    fontSize: 13,
    color: '#71717a',
    textAlign: 'center',
    paddingVertical: 12,
    fontFamily: 'PlusJakartaSans-Regular',
  },
});
