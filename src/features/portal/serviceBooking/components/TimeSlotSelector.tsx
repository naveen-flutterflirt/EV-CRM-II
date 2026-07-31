import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAvailableSlots } from '../hooks/useServiceBooking';

interface TimeSlotSelectorProps {
  onBack: () => void;
  onConfirm: (date: string, slotId: string, slotTime: string) => void;
  isSubmitting?: boolean;
}

export const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  onBack,
  onConfirm,
  isSubmitting = false,
}) => {
  // Generate next 7 days starting from today
  const getDates = () => {
    const dates = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      dates.push({
        dateStr,
        dayName: days[date.getDay()],
        dayNum: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' }),
      });
    }
    return dates;
  };

  const dates = getDates();
  const [selectedDate, setSelectedDate] = useState(dates[0].dateStr);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(null);

  // Fetch slots for selected date
  const { data: slots, isLoading } = useAvailableSlots(selectedDate);

  // Predefined fallback slots if API doesn't return anything or errors
  const fallbackSlots = [
    { id: 'slot_1', timeSlot: '09:00 AM - 11:00 AM', availableCount: 3 },
    { id: 'slot_2', timeSlot: '11:00 AM - 01:00 PM', availableCount: 2 },
    { id: 'slot_3', timeSlot: '02:00 PM - 04:00 PM', availableCount: 4 },
    { id: 'slot_4', timeSlot: '04:00 PM - 06:00 PM', availableCount: 1 },
  ];

  const activeSlots = slots && Array.isArray(slots) && slots.length > 0 && 'timeSlot' in slots[0]
    ? slots
    : fallbackSlots;

  const handleConfirm = () => {
    if (selectedSlotId && selectedSlotTime) {
      onConfirm(selectedDate, selectedSlotId, selectedSlotTime);
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={24} color="#1c1c1e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Slot</Text>
      </View>

      <Text style={styles.sectionTitle}>Choose Date</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateList}
        contentContainerStyle={styles.dateListContent}
      >
        {dates.map((d) => {
          const isSelected = selectedDate === d.dateStr;
          return (
            <TouchableOpacity
              key={d.dateStr}
              style={[
                styles.dateCard,
                isSelected ? styles.selectedDateCard : styles.unselectedDateCard,
              ]}
              onPress={() => {
                setSelectedDate(d.dateStr);
                setSelectedSlotId(null);
                setSelectedSlotTime(null);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.dayName, isSelected && styles.selectedDateText]}>
                {d.dayName}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.selectedDateNumText]}>
                {d.dayNum}
              </Text>
              <Text style={[styles.monthLabel, isSelected && styles.selectedDateText]}>
                {d.month}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Available Slots ({formatDateLabel(selectedDate)})</Text>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#95d03a" />
          <Text style={styles.loadingText}>Fetching available slots...</Text>
        </View>
      ) : (
        <ScrollView style={styles.slotsScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.slotsGrid}>
            {activeSlots.map((slot, index) => {
              const isSelected = selectedSlotId === slot.id;
              const isAvailable = slot.availableCount > 0;
              return (
                <TouchableOpacity
                  key={slot.id || `slot-${index}`}
                  style={[
                    styles.slotCard,
                    isSelected ? styles.selectedSlotCard : styles.unselectedSlotCard,
                    !isAvailable && styles.disabledSlotCard,
                  ]}
                  onPress={() => {
                    if (isAvailable) {
                      setSelectedSlotId(slot.id);
                      setSelectedSlotTime(slot.timeSlot);
                    }
                  }}
                  disabled={!isAvailable}
                  activeOpacity={0.8}
                >
                  <Feather
                    name="clock"
                    size={16}
                    color={isSelected ? '#ffffff' : '#71717a'}
                    style={styles.slotIcon}
                  />
                  <Text style={[styles.slotText, isSelected && styles.selectedSlotText]}>
                    {slot.timeSlot}
                  </Text>
                  <Text style={[styles.slotAvailability, isSelected && styles.selectedAvailabilityText]}>
                    {isAvailable ? `${slot.availableCount} slots left` : 'Fully booked'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedSlotId || isSubmitting) && styles.disabledConfirmButton,
          ]}
          onPress={handleConfirm}
          disabled={!selectedSlotId || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#1a2b0c" />
          ) : (
            <>
              <Text style={styles.confirmText}>Book Appointment</Text>
              <Feather name="check" size={20} color="#1a2b0c" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8f3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Bold',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Bold',
    marginVertical: 12,
  },
  dateList: {
    maxHeight: 110,
    marginBottom: 16,
  },
  dateListContent: {
    gap: 12,
    paddingRight: 10,
  },
  dateCard: {
    width: 68,
    height: 96,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  selectedDateCard: {
    backgroundColor: '#95d03a',
    borderColor: '#95d03a',
  },
  unselectedDateCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
  },
  dayName: {
    fontSize: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    textTransform: 'uppercase',
  },
  dayNum: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Bold',
    marginVertical: 4,
  },
  monthLabel: {
    fontSize: 11,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  selectedDateText: {
    color: '#e6f0d8',
  },
  selectedDateNumText: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
  },
  slotsScroll: {
    flex: 1,
    marginBottom: 16,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  slotCard: {
    width: '48%',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 4,
    alignItems: 'center',
  },
  selectedSlotCard: {
    backgroundColor: '#95d03a',
    borderColor: '#95d03a',
  },
  unselectedSlotCard: {
    backgroundColor: '#ffffff',
    borderColor: '#e4e4e7',
  },
  disabledSlotCard: {
    backgroundColor: '#f1f1f4',
    borderColor: '#f1f1f4',
    opacity: 0.5,
  },
  slotIcon: {
    marginBottom: 6,
  },
  slotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1e',
    fontFamily: 'PlusJakartaSans-Medium',
    textAlign: 'center',
  },
  selectedSlotText: {
    color: '#ffffff',
  },
  slotAvailability: {
    fontSize: 10,
    color: '#71717a',
    fontFamily: 'PlusJakartaSans-Regular',
    marginTop: 4,
  },
  selectedAvailabilityText: {
    color: '#e6f0d8',
  },
  footer: {
    paddingVertical: 12,
  },
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#a2e52c',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#a2e52c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledConfirmButton: {
    backgroundColor: '#e4e4e7',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmText: {
    color: '#1a2b0c',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans-Bold',
    marginRight: 8,
  },
});
