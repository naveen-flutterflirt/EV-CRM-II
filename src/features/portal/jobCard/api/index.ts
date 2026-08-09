import api from '../../../../config/axios';
import { JobCard, JobStatusHistory, JobInspection, JobService, JobPart, Invoice, Appointment, RsaRequest, Estimate } from '../types';

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

export async function fetchCustomerRsaRequestsApi(customerId: string): Promise<RsaRequest[]> {
  const res = await api.get(`/rsa/requests?customerId=${customerId}`);
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData)) return rawData;
  if (rawData && Array.isArray(rawData.data)) return rawData.data;
  return [];
}

export async function fetchRsaRequestDetailsApi(requestId: string): Promise<RsaRequest> {
  const res = await api.get(`/rsa/requests/${requestId}`);
  return res.data?.data || res.data;
}

export async function createSosRequestApi(payload: any): Promise<RsaRequest> {
  const res = await api.post(`/rsa/requests/sos`, payload);
  return res.data?.data || res.data;
}

export async function fetchJobCardEstimateApi(jobCardId: string): Promise<Estimate | null> {
  const res = await api.get(`/estimates?jobCardId=${jobCardId}`);
  const rawData = res.data?.data || res.data;
  if (Array.isArray(rawData) && rawData.length > 0) return rawData[0];
  if (rawData && Array.isArray(rawData.data) && rawData.data.length > 0) return rawData.data[0];
  if (rawData && !Array.isArray(rawData) && typeof rawData === 'object') return rawData;
  return null;
}

export async function approveJobCardEstimateApi(jobCardId: string, estimateId?: string): Promise<any> {
  let finalEstId = estimateId;
  
  if (!finalEstId) {
    const res = await api.get(`/estimates?jobCardId=${jobCardId}`);
    const rawData = res.data?.data || res.data;
    const list = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    if (list.length > 0) {
      finalEstId = list[0].estimateId || list[0].id;
    } else {
      const createRes = await api.post(`/estimates`, { jobCardId });
      const created = createRes.data?.data || createRes.data;
      finalEstId = created?.estimateId || created?.id;
    }
  }

  if (!finalEstId) {
    throw new Error('No estimate found or could be created');
  }

  // 1. Approve estimate
  await api.patch(`/estimates/${finalEstId}`, { isApproved: true });

  // 2. Update job card status
  await api.patch(`/job-cards/${jobCardId}`, {
    status: 'in_progress',
    statusRemarks: 'Estimate approved by customer'
  });

  // 3. Create job status history
  await api.post(`/job-status-histories`, {
    jobCardId,
    oldStatus: 'awaiting_approval',
    newStatus: 'in_progress',
    remarks: 'Estimate approved by customer'
  });
}
