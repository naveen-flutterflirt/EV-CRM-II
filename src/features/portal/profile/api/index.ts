import api from "../../../../config/axios";
import { getAuthMeCached, invalidateAuthMeCache } from "../../../../common/services/authCache";
import { fetchWithTtlCache, invalidateCacheKey } from "../../../../common/services/apiCache";
import {
  UserProfileData,
  EditProfilePayload,
  ServiceHistoryRecord,
  ServiceDetailData,
  SupportTicketItem,
  FaqItem,
} from "../types";

// Fetch user & customer profile from backend GET /auth/me and GET /customers/:id
export async function fetchUserProfileApi(forceRefresh = false): Promise<UserProfileData> {
  return fetchWithTtlCache("user_profile", async () => {
    try {
      const res = await getAuthMeCached(forceRefresh);
      const user = res.data?.data || res.data;
      if (user) {
        let customerData: any = {};
        if (user.customerId) {
          try {
            const custRes = await api.get(`/customers/${user.customerId}`);
            customerData = custRes.data?.data || custRes.data || {};
          } catch (_e) {
            // ignore
          }
        }

        const rawFullName = user.fullName || user.username || "User";
        const nameParts = rawFullName.trim().split(" ");
        const firstName = customerData.firstName || nameParts[0] || "User";
        const lastName = customerData.lastName || nameParts.slice(1).join(" ") || "";
        const fullName = `${firstName} ${lastName}`.trim();
        const phone = customerData.phone || user.phone || "";
        const email = customerData.email || user.email || "";
        const rawGender = customerData.gender || user.gender || "Male";
        const gender = rawGender ? rawGender.charAt(0).toUpperCase() + rawGender.slice(1).toLowerCase() : "Male";
        const addressLine1 = customerData.addressLine1 || "";
        const city = customerData.city || "";
        const pincode = customerData.pincode || "";

        return {
          id: user.id || user.customerId,
          firstName,
          lastName,
          name: fullName,
          phone,
          email,
          gender,
          addressLine1,
          city,
          pincode,
          location: city || "-",
          defaultAddress: addressLine1 || "--",
          avatarUrl: user.avatarUrl,
        };
      }
    } catch (err) {
      console.warn("⚠️ User Profile API Fallback:", err);
    }

    return {
      id: "",
      firstName: "",
      lastName: "",
      name: "",
      phone: "",
      email: "",
      gender: "",
      addressLine1: "",
      city: "",
      pincode: "",
      location: "",
      defaultAddress: "",
    };
  }, 180000, forceRefresh);
}

// Update customer profile via PATCH /api/customers/:id
export async function updateUserProfileApi(payload: EditProfilePayload): Promise<boolean> {
  try {
    const userRes = await getAuthMeCached();
    const user = userRes.data?.data || userRes.data;
    const customerId = user?.customerId;

    if (!customerId) {
      throw new Error("Customer ID not found for current user account.");
    }

    const updateBody: Record<string, any> = {};
    if (payload.firstName) updateBody.firstName = payload.firstName;
    if (payload.lastName !== undefined) updateBody.lastName = payload.lastName;
    if (payload.phone) updateBody.phone = payload.phone;
    if (payload.email !== undefined) updateBody.email = payload.email;
    if (payload.gender !== undefined) {
      updateBody.gender = payload.gender ? payload.gender.toLowerCase() : null;
    }
    if (payload.addressLine1 !== undefined) updateBody.addressLine1 = payload.addressLine1;
    if (payload.city !== undefined) updateBody.city = payload.city;
    if (payload.pincode !== undefined) updateBody.pincode = payload.pincode;

    await api.patch(`/customers/${customerId}`, updateBody);
    invalidateAuthMeCache();
    invalidateCacheKey("user_profile");
    invalidateCacheKey("customer_dashboard");

    return true;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || (Array.isArray(err.response?.data?.errors) ? err.response.data.errors.join(', ') : null) || err.message || "Failed to update customer profile";
    console.error("❌ Update Profile API Error:", errorMsg);
    throw new Error(errorMsg);
  }
}

// Fetch service history timeline from backend (Returns [] when no job cards exist)
export async function fetchServiceHistoryApi(): Promise<ServiceHistoryRecord[]> {
  try {
    const userRes = await getAuthMeCached();
    const user = userRes.data?.data || userRes.data;
    const customerId = user?.customerId;

    if (!customerId) {
      return [];
    }

    return fetchWithTtlCache(`service_history_${customerId}`, async () => {
      const res = await api.get(`/job-cards?customerId=${customerId}`);
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any, idx: number) => {
          const rawDate = item.openedAt || item.createdAt || item.completedAt;
          const dateObj = rawDate ? new Date(rawDate) : new Date();
          const year = dateObj.getFullYear().toString();
          const monthDay = dateObj.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase();
          return {
            id: item.id || item.jobCardId || `srv_${idx}`,
            dateStr: dateObj.toLocaleDateString(),
            year: year,
            monthDay: monthDay,
            title: item.serviceName || item.serviceType || item.title || "Vehicle Service",
            kilometers: item.kilometerReading || item.odometerKm || item.currentOdometer || 0,
            vehicleModel: item.vehicleModel || item.vehicle?.model?.modelName || item.vehicle?.modelName || "EV",
          };
        });
      }
      return [];
    }, 1000 * 60 * 5); // 5 minutes TTL
  } catch (err) {
    console.warn("⚠️ Service History API Error:", err);
    return [];
  }
}

export async function fetchServiceDetailApi(serviceId?: string): Promise<ServiceDetailData> {
  if (!serviceId) {
    return {
      id: "sh_empty",
      serviceType: "Vehicle Service",
      serviceDate: undefined,
      odometerKm: undefined,
      technicianName: undefined,
      technicianRating: undefined,
      laborItems: [],
      partsReplaced: [],
      technicianNotes: undefined,
      totalAmount: undefined,
    };
  }

  return fetchWithTtlCache(`service_detail_${serviceId}`, async () => {
    try {
      const res = await api.get(`/job-cards/${serviceId}`);
      const data = res.data?.data || res.data;
      if (data) {
        return {
          id: data.id || data.jobCardId || serviceId,
          serviceType: data.serviceType || data.jobType || data.serviceName || "Vehicle Service",
          serviceDate: data.createdAt || data.openedAt || data.completedAt
            ? new Date(data.createdAt || data.openedAt || data.completedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
            : undefined,
          odometerKm: data.odometerKm || data.kilometerReading || undefined,
          technicianName: data.technicianName || data.technician?.fullName || data.technician?.name || undefined,
          technicianRating: data.technicianRating || data.technician?.rating || undefined,
          laborItems: Array.isArray(data.services) ? data.services : (Array.isArray(data.laborItems) ? data.laborItems : []),
          partsReplaced: Array.isArray(data.parts) ? data.parts : (Array.isArray(data.partsReplaced) ? data.partsReplaced : []),
          technicianNotes: data.notes || data.technicianNotes || data.customerNotes || undefined,
          totalAmount: data.totalAmount !== undefined && data.totalAmount !== null && Number(data.totalAmount) > 0 ? Number(data.totalAmount) : undefined,
        };
      }
    } catch (err) {
      console.warn("⚠️ Service Detail API Warning:", err);
    }

    return {
      id: serviceId,
      serviceType: "Vehicle Service",
      serviceDate: undefined,
      odometerKm: undefined,
      technicianName: undefined,
      technicianRating: undefined,
      laborItems: [],
      partsReplaced: [],
      technicianNotes: undefined,
      totalAmount: undefined,
    };
  }, 1000 * 60 * 5); // 5 minutes TTL
}

// Support Tickets List (No /api/support/tickets endpoint exists in backend, return empty array directly)
export async function fetchSupportTicketsApi(): Promise<SupportTicketItem[]> {
  return [];
}

// Help Center FAQs List
export async function fetchFaqsApi(): Promise<FaqItem[]> {
  return [
    {
      id: "faq_1",
      question: "How do I verify my account?",
      answer: "To verify your identity, navigate to Settings > Verification. You'll need to upload a clear photo of your government-issued ID and a live selfie. Most accounts are reviewed within 24 hours.",
      category: "Getting Started",
    },
    {
      id: "faq_2",
      question: "Can I have multiple wallets?",
      answer: "Yes, you can link up to 3 payment methods and digital wallets under your main verified profile.",
      category: "Payments",
    },
    {
      id: "faq_3",
      question: "What are the transaction fees?",
      answer: "Standard service booking transactions have 0% platform fees. Express delivery or emergency RSA may incur nominal distance-based levies.",
      category: "Payments",
    },
    {
      id: "faq_4",
      question: "Is my data secure?",
      answer: "All communication and telemetry data are protected using 256-bit AES end-to-end encryption and compliance standards.",
      category: "Getting Started",
    },
    {
      id: "faq_5",
      question: "How do I reset my PIN?",
      answer: "Go to Settings > Security > Reset PIN. An OTP will be sent to your registered phone number to verify your identity.",
      category: "Getting Started",
    },
  ];
}

// Change Password / Security API
export async function changePasswordApi(oldPassword: string, newPassword: string): Promise<boolean> {
  try {
    const res = await api.post("/auth/change-password", { oldPassword, newPassword });
    return res.data?.success ?? true;
  } catch (err: any) {
    const errorMsg = err.response?.data?.message || err.message || "Failed to update password";
    console.warn("⚠️ Change Password API Error:", errorMsg);
    throw new Error(errorMsg);
  }
}
