import { useState, useEffect, useMemo } from "react";
import { fetchUserProfileApi, fetchCustomerOrdersApi } from "../api";
import { UserProfileData, OrderItem, OrderTabType } from "../types";
import Cookies from "js-cookie";

export function useProfileState() {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [activeTab, setActiveTab] = useState<OrderTabType>("Active Orders");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchUserProfileApi(), fetchCustomerOrdersApi()])
      .then(([userData, ordersData]) => {
        setProfile(userData);
        setOrders(ordersData);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeOrdersList = useMemo(() => {
    return orders.filter((o) => o.category === "ACTIVE");
  }, [orders]);

  const pastOrdersList = useMemo(() => {
    return orders.filter((o) => o.category === "PAST");
  }, [orders]);

  const returnsList = useMemo(() => {
    return orders.filter((o) => o.category === "RETURNS");
  }, [orders]);

  const displayedOrders = useMemo(() => {
    if (activeTab === "Active Orders") return activeOrdersList;
    if (activeTab === "Past Orders") return pastOrdersList;
    return returnsList;
  }, [activeTab, activeOrdersList, pastOrdersList, returnsList]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("accessToken");
    Cookies.remove("userRole");
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return {
    profile,
    orders,
    activeTab,
    setActiveTab,
    displayedOrders,
    loading,
    handleLogout,
  };
}
