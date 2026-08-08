import { useQuery, useMutation } from '@tanstack/react-query';
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
} from '../api';
import { JobCard, Appointment, RsaRequest } from '../types';

export function useActiveJobCard(customerId?: string) {
  return useQuery<JobCard[]>({
    queryKey: ['portal', 'jobCards', customerId],
    queryFn: () => fetchCustomerJobCardsApi(customerId || ''),
    enabled: !!customerId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useJobCardHistory(jobCardId?: string) {
  return useQuery({
    queryKey: ['portal', 'jobCardHistory', jobCardId],
    queryFn: () => fetchJobCardHistoryApi(jobCardId || ''),
    enabled: !!jobCardId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useJobCardInspections(jobCardId?: string) {
  return useQuery({
    queryKey: ['portal', 'jobCardInspections', jobCardId],
    queryFn: () => fetchJobInspectionsApi(jobCardId || ''),
    enabled: !!jobCardId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useJobCardServices(jobCardId?: string) {
  return useQuery({
    queryKey: ['portal', 'jobCardServices', jobCardId],
    queryFn: () => fetchJobServicesApi(jobCardId || ''),
    enabled: !!jobCardId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useJobCardParts(jobCardId?: string) {
  return useQuery({
    queryKey: ['portal', 'jobCardParts', jobCardId],
    queryFn: () => fetchJobPartsApi(jobCardId || ''),
    enabled: !!jobCardId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useJobCardInvoice(jobCardId?: string) {
  return useQuery({
    queryKey: ['portal', 'jobCardInvoice', jobCardId],
    queryFn: () => fetchJobCardInvoiceApi(jobCardId || ''),
    enabled: !!jobCardId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useCustomerAppointments(customerId?: string) {
  return useQuery<Appointment[]>({
    queryKey: ['portal', 'appointments', customerId],
    queryFn: () => fetchCustomerAppointmentsApi(customerId || ''),
    enabled: !!customerId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useCustomerRsaRequests(customerId?: string) {
  return useQuery<RsaRequest[]>({
    queryKey: ['portal', 'rsaRequests', customerId],
    queryFn: () => fetchCustomerRsaRequestsApi(customerId || ''),
    enabled: !!customerId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useRsaRequestDetails(requestId?: string) {
  return useQuery<RsaRequest>({
    queryKey: ['portal', 'rsaRequestDetails', requestId],
    queryFn: () => fetchRsaRequestDetailsApi(requestId || ''),
    enabled: !!requestId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useCreateSosRequest() {
  return useMutation({
    mutationFn: (payload: any) => createSosRequestApi(payload),
  });
}
