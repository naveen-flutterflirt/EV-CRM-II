import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomerJobCardsApi,
  fetchJobCardHistoryApi,
  fetchJobInspectionsApi,
  fetchJobServicesApi,
  fetchJobPartsApi,
  fetchJobCardInvoiceApi,
  fetchCustomerAppointmentsApi,
  fetchCustomerRsaRequestsApi,
  fetchRsaRequestDetailsApi,
  createSosRequestApi,
  fetchJobCardEstimateApi,
  approveJobCardEstimateApi,
  fetchRsaInvoiceApi,
} from '../api';
import { JobCard, Appointment, RsaRequest, Estimate, Invoice } from '../types';

const DEFAULT_STALE_TIME = 1000 * 60 * 2; // 2 minutes cache TTL

export function useActiveJobCard(customerId?: string) {
  return useQuery<JobCard[]>({
    queryKey: ['portal', 'jobCards', customerId],
    queryFn: () => fetchCustomerJobCardsApi(customerId || ''),
    enabled: !!customerId,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useJobCardHistory(jobCardId?: string, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'jobCardHistory', jobCardId],
    queryFn: () => fetchJobCardHistoryApi(jobCardId || ''),
    enabled: Boolean(jobCardId) && enabled,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useJobCardInspections(jobCardId?: string, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'jobCardInspections', jobCardId],
    queryFn: () => fetchJobInspectionsApi(jobCardId || ''),
    enabled: Boolean(jobCardId) && enabled,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useJobCardServices(jobCardId?: string, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'jobCardServices', jobCardId],
    queryFn: () => fetchJobServicesApi(jobCardId || ''),
    enabled: Boolean(jobCardId) && enabled,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useJobCardParts(jobCardId?: string, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'jobCardParts', jobCardId],
    queryFn: () => fetchJobPartsApi(jobCardId || ''),
    enabled: Boolean(jobCardId) && enabled,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useJobCardInvoice(jobCardId?: string, enabled = true) {
  return useQuery({
    queryKey: ['portal', 'jobCardInvoice', jobCardId],
    queryFn: () => fetchJobCardInvoiceApi(jobCardId || ''),
    enabled: Boolean(jobCardId) && enabled,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useCustomerAppointments(customerId?: string) {
  return useQuery<Appointment[]>({
    queryKey: ['portal', 'appointments', customerId],
    queryFn: () => fetchCustomerAppointmentsApi(customerId || ''),
    enabled: !!customerId,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useCustomerRsaRequests(customerId?: string) {
  return useQuery<RsaRequest[]>({
    queryKey: ['portal', 'rsaRequests', customerId],
    queryFn: () => fetchCustomerRsaRequestsApi(customerId || ''),
    enabled: !!customerId,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useRsaRequestDetails(requestId?: string) {
  return useQuery<RsaRequest>({
    queryKey: ['portal', 'rsaRequestDetails', requestId],
    queryFn: () => fetchRsaRequestDetailsApi(requestId || ''),
    enabled: !!requestId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCreateSosRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createSosRequestApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'rsaRequests'] });
      queryClient.invalidateQueries({ queryKey: ['portal', 'customer', 'dashboard'] });
    },
  });
}

export function useJobCardEstimate(jobCardId?: string, enabled = true) {
  return useQuery<Estimate | null>({
    queryKey: ['portal', 'jobCardEstimate', jobCardId],
    queryFn: () => fetchJobCardEstimateApi(jobCardId || ''),
    enabled: Boolean(jobCardId) && enabled,
    staleTime: DEFAULT_STALE_TIME,
  });
}

export function useApproveJobCardEstimate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: { jobCardId: string; estimateId?: string }) =>
      approveJobCardEstimateApi(variables.jobCardId, variables.estimateId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'jobCards'] });
      queryClient.invalidateQueries({ queryKey: ['portal', 'jobCardHistory', variables.jobCardId] });
      queryClient.invalidateQueries({ queryKey: ['portal', 'jobCardEstimate', variables.jobCardId] });
    },
  });
}

export function useRsaInvoice(requestId?: string, enabled = true) {
  return useQuery<Invoice | null>({
    queryKey: ['portal', 'rsaInvoice', requestId],
    queryFn: () => fetchRsaInvoiceApi(requestId || ''),
    enabled: Boolean(requestId) && enabled,
    staleTime: DEFAULT_STALE_TIME,
  });
}
