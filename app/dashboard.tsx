import React from 'react';
import { router } from 'expo-router';
import Cookies from 'js-cookie';
import { Alert, Platform } from 'react-native';
import { CustomerHomeScreen } from '../src/features/portal/dashboard/screens/CustomerHomeScreen';

export default function DashboardRoute() {
  const handleSignOut = () => {
    // Clear cookies/tokens
    Cookies.remove("token");
    Cookies.remove("accessToken");
    Cookies.remove("userRole");
    
    // Redirect to login/home screen
    router.replace('/');
  };

  const handleProfilePress = () => {
    if (Platform.OS === 'web') {
      const confirmSignOut = window.confirm("Are you sure you want to sign out?");
      if (confirmSignOut) {
        handleSignOut();
      }
    } else {
      Alert.alert(
        "Sign Out",
        "Are you sure you want to sign out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign Out", onPress: handleSignOut, style: "destructive" }
        ]
      );
    }
  };

  return (
    <CustomerHomeScreen
      onProfilePress={handleProfilePress}
      onBookService={() => {
        if (Platform.OS === 'web') {
          window.alert("Interactive Booking: Coming soon!");
        } else {
          Alert.alert("Booking", "Service booking features coming soon!");
        }
      }}
      onTrackService={() => {
        if (Platform.OS === 'web') {
          window.alert("Service Tracking: Coming soon!");
        } else {
          Alert.alert("Tracking", "Live tracking features coming soon!");
        }
      }}
      onSpareParts={() => {
        if (Platform.OS === 'web') {
          window.alert("Spare Parts Catalog: Coming soon!");
        } else {
          Alert.alert("Store", "Spare parts store features coming soon!");
        }
      }}
      onNotificationPress={() => {
        if (Platform.OS === 'web') {
          window.alert("Notifications: No new alerts.");
        } else {
          Alert.alert("Notifications", "No new alerts.");
        }
      }}
    />
  );
}
