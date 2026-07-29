import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../../../common/components/Card';
import { ActivityItem } from '../types';

interface RecentActivityCardProps {
  activities?: ActivityItem[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => {
  const activityList = activities && activities.length > 0
    ? activities
    : [
        {
          id: '1',
          title: 'Full vehicle health check-up',
          date: '02 Jul 2026',
          type: 'completed' as const,
          subtitle: '02 Jul 2026 • Completed',
        },
        {
          id: '2',
          title: 'Software Update v2.4',
          date: '28 Jun 2026',
          type: 'over-the-air' as const,
          subtitle: '28 Jun 2026 • Over-the-air',
        },
      ];

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Recent activity</Text>

      <Card style={styles.cardContainer}>
        {activityList.map((item, index) => {
          const isLast = index === activityList.length - 1;
          const isCompleted = item.type === 'completed';

          return (
            <View
              key={item.id || index}
              style={[styles.activityRow, !isLast && styles.rowBorder]}
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
            </View>
          );
        })}
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
});
