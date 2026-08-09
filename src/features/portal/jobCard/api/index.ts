import api from '../../../../config/axios';
import { fetchWithTtlCache, invalidateCacheKey } from '../../../../common/services/apiCache';
import { JobCard, JobStatusHistory, JobInspection, JobService, JobPart, Invoice, Appointment, RsaRequest } from '../types';

export async function fetchCustomerJobCardsApi(customerId: string): Promise<JobCard[]> {
  return fetchWithTtlCache(`customer_job_cards_${customerId}`, async () => {
    const res = await api.get(`/job-cards?customerId=${customerId}`);
    const rawData = res.data?.data || res.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, 1000 * 60 * 5); // 5 minutes cache TTL
}

export async function fetchJobCardHistoryApi(jobCardId: string): Promise<JobStatusHistory[]> {
  return fetchWithTtlCache(`job_card_history_${jobCardId}`, async () => {
    const res = await api.get(`/job-cards/${jobCardId}/history`);
    return res.data?.data || res.data || [];
  }, 1000 * 60 * 5);
}

export async function fetchJobInspectionsApi(jobCardId: string): Promise<JobInspection[]> {
  return fetchWithTtlCache(`job_inspections_${jobCardId}`, async () => {
    const res = await api.get(`/job-inspections?jobCardId=${jobCardId}`);
    const rawData = res.data?.data || res.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, 1000 * 60 * 5);
}

export async function fetchJobServicesApi(jobCardId: string): Promise<JobService[]> {
  return fetchWithTtlCache(`job_services_${jobCardId}`, async () => {
    const res = await api.get(`/job-services?jobCardId=${jobCardId}`);
    const rawData = res.data?.data || res.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, 1000 * 60 * 5);
}

export async function fetchJobPartsApi(jobCardId: string): Promise<JobPart[]> {
  return fetchWithTtlCache(`job_parts_${jobCardId}`, async () => {
    const res = await api.get(`/job-parts?jobCardId=${jobCardId}`);
    const rawData = res.data?.data || res.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, 1000 * 60 * 5);
}

export async function fetchJobCardInvoiceApi(jobCardId: string): Promise<Invoice | null> {
  return fetchWithTtlCache(`job_invoice_${jobCardId}`, async () => {
    const res = await api.get(`/invoices?jobCardId=${jobCardId}`);
    const rawData = res.data?.data || res.data;
    if (Array.isArray(rawData) && rawData.length > 0) return rawData[0];
    if (rawData && Array.isArray(rawData.data) && rawData.data.length > 0) return rawData.data[0];
    if (rawData && !Array.isArray(rawData) && typeof rawData === 'object') return rawData;
    return null;
  }, 1000 * 60 * 5);
}

export async function fetchCustomerAppointmentsApi(customerId: string): Promise<Appointment[]> {
  return fetchWithTtlCache(`customer_appointments_${customerId}`, async () => {
    const res = await api.get(`/appointments?customerId=${customerId}`);
    const rawData = res.data?.data || res.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, 1000 * 60 * 5);
}

export async function fetchCustomerRsaRequestsApi(customerId: string): Promise<RsaRequest[]> {
  return fetchWithTtlCache(`customer_rsa_${customerId}`, async () => {
    const res = await api.get(`/rsa/requests?customerId=${customerId}`);
    const rawData = res.data?.data || res.data;
    if (Array.isArray(rawData)) return rawData;
    if (rawData && Array.isArray(rawData.data)) return rawData.data;
    return [];
  }, 1000 * 60 * 3); // 3 minutes TTL
}

export async function fetchRsaRequestDetailsApi(requestId: string): Promise<RsaRequest> {
  return fetchWithTtlCache(`rsa_details_${requestId}`, async () => {
    const res = await api.get(`/rsa/requests/${requestId}`);
    return res.data?.data || res.data;
  }, 1000 * 30); // 30 seconds TTL
}

export async function createSosRequestApi(payload: any): Promise<RsaRequest> {
  const res = await api.post(`/rsa/requests/sos`, payload);
  invalidateCacheKey("customer_dashboard");
  if (payload?.customerId) {
    invalidateCacheKey(`customer_rsa_${payload.customerId}`);
  }
  return res.data?.data || res.data;
}
