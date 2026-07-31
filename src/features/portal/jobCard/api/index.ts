import api from '../../../../config/axios';
import { JobCard, JobStatusHistory, JobInspection, JobService, JobPart, Invoice, Appointment } from '../types';

export async function fetchCustomerJobCardsApi(customerId: string): Promise<JobCard[]> {
  const res = await api.get(`/job-cards?customerId=${customerId}`);
  const rawData = res.data?.data || res.data;
  // If it's a paginated structure (e.g. has rows/data as array)
  if (Array.isArray(rawData)) return rawData;
  if (rawData && Array.isArray(rawData.data)) return rawData.data;
  return [];
}

export async function fetchJobCardHistoryApi(jobCardId: string): Promise<JobStatusHistory[]> {
  const res = await api.get(`/job-cards/${jobCardId}/history`);
  return res.data?.data || res.data || [];
}

export async function fetchJobInspectionsApi(jobCardId: string): Promise<JobInspection[]> {
  const res = await api.get(`/job-inspections?jobCardId=${jobCardId}`);
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData && Array.isArray(rawData.data)) return rawData.data;
  return [];
}

export async function fetchJobServicesApi(jobCardId: string): Promise<JobService[]> {
  const res = await api.get(`/job-services?jobCardId=${jobCardId}`);
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData && Array.isArray(rawData.data)) return rawData.data;
  return [];
}

export async function fetchJobPartsApi(jobCardId: string): Promise<JobPart[]> {
  const res = await api.get(`/job-parts?jobCardId=${jobCardId}`);
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData && Array.isArray(rawData.data)) return rawData.data;
  return [];
}

export async function fetchJobCardInvoiceApi(jobCardId: string): Promise<Invoice | null> {
  const res = await api.get(`/invoices?jobCardId=${jobCardId}`);
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData) && rawData.length > 0) return rawData[0];
  if (rawData && Array.isArray(rawData.data) && rawData.data.length > 0) return rawData.data[0];
  if (rawData && !Array.isArray(rawData) && typeof rawData === 'object') return rawData;
  return null;
}

export async function fetchCustomerAppointmentsApi(customerId: string): Promise<Appointment[]> {
  const res = await api.get(`/appointments?customerId=${customerId}`);
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData && Array.isArray(rawData.data)) return rawData.data;
  return [];
}
