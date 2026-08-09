import React from 'react';
import { router } from 'expo-router';
import { cookieStore } from '../src/common/services/cookieStore';
import api from '../src/config/axios';
import { invalidateAuthMeCache } from '../src/common/services/authCache';
import { invalidateAllCache } from '../src/common/services/apiCache';
import { CustomerHomeScreen } from '../src/features/portal/dashboard/screens/CustomerHomeScreen';

export default function DashboardRoute() {
  React.useEffect(() => {
    const token = cookieStore.get("token") || cookieStore.get("accessToken");
    if (!token) {
      invalidateAuthMeCache();
      invalidateAllCache();
      try {
        router.replace('/');
      } catch (_e) {
        if (typeof window !== "undefined") {
          window.location.href = '/';
        }
      }
    }
  }, []);

  const handleSignOut = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_e) {}
    // Clear cookies/tokens
    cookieStore.remove("token");
    cookieStore.remove("accessToken");
    cookieStore.remove("userRole");
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
