import { useState, useEffect } from "react";
import {
  fetchUserProfileApi,
  updateUserProfileApi,
  fetchServiceHistoryApi,
  fetchServiceDetailApi,
  fetchSupportTicketsApi,
  fetchFaqsApi,
} from "../api";
import {
  UserProfileData,
  EditProfilePayload,
  ServiceHistoryRecord,
  ServiceDetailData,
  SupportTicketItem,
  FaqItem,
  LanguageOption,
  ProfileSubView,
} from "../types";
import { cookieStore } from "../../../../common/services/cookieStore";
import { router } from "expo-router";
import api from "../../../../config/axios";
import { invalidateAuthMeCache } from "../../../../common/services/authCache";
import { invalidateAllCache } from "../../../../common/services/apiCache";

export function useProfileState() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistoryRecord[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [serviceDetail, setServiceDetail] = useState<ServiceDetailData | null>(null);
  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  const [subView, setSubView] = useState<ProfileSubView>('ACCOUNT');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>('English');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState<'Getting Started' | 'Payments'>('Getting Started');
  const [expandedFaqId, setExpandedFaqId] = useState<string>('faq_1');

  useEffect(() => {
    Promise.all([
      fetchUserProfileApi(),
      fetchServiceHistoryApi(),
      fetchSupportTicketsApi(),
      fetchFaqsApi(),
    ])
      .then(([userData, historyData, ticketsData, faqsData]) => {
        setProfile(userData);
        setServiceHistory(historyData);
        setSupportTickets(ticketsData);
        setFaqs(faqsData);
      })
      .finally(() => setLoading(false));
  }, []);

  const openServiceDetail = (record: ServiceHistoryRecord) => {
    setSelectedServiceId(record.id);
    fetchServiceDetailApi(record.id).then((detail) => {
      setServiceDetail(detail);
      setSubView('SERVICE_DETAIL');
    });
  };

  const handleSaveProfile = async (payload: EditProfilePayload) => {
    setSaving(true);
    try {
      await updateUserProfileApi(payload);
      const freshUser = await fetchUserProfileApi();
      setProfile(freshUser);
      setSubView('ACCOUNT');
    } catch (err: any) {
      console.error("❌ Save Profile error:", err.message || err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (_e) {}
    cookieStore.remove("token");
    cookieStore.remove("accessToken");
    cookieStore.remove("userRole");
    invalidateAuthMeCache();
    invalidateAllCache();
    try {
      router.replace("/");
    } catch (_e) {
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  return {
    profile,
    serviceHistory,
    selectedServiceId,
    serviceDetail,
    supportTickets,
    faqs,
    subView,
    setSubView,
    loading,
    saving,
    pushNotificationsEnabled,
    setPushNotificationsEnabled,
    selectedLanguage,
    setSelectedLanguage,
    faqCategoryFilter,
    setFaqCategoryFilter,
    expandedFaqId,
    setExpandedFaqId,
    openServiceDetail,
    handleSaveProfile,
    handleLogout,
  };
}
