import React from 'react';
import { router } from 'expo-router';
import Cookies from 'js-cookie';
import api from '../src/config/axios';
import { invalidateAuthMeCache } from '../src/common/services/authCache';
import { invalidateAllCache } from '../src/common/services/apiCache';
import { CustomerHomeScreen } from '../src/features/portal/dashboard/screens/CustomerHomeScreen';

export default function DashboardRoute() {
  const handleSignOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_e) {}
    // Clear cookies/tokens
    Cookies.remove("token");
    Cookies.remove("accessToken");
    Cookies.remove("userRole");
    invalidateAuthMeCache();
    invalidateAllCache();
    
    // Redirect to login/home screen
    router.replace('/');
  };

  return (
    <CustomerHomeScreen
      onProfilePress={handleSignOut}
      onBookService={() => {}}
      onTrackService={() => {}}
      onSpareParts={() => {}}
    />
  );
}
