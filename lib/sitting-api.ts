import axios from 'axios';

import { getApiBaseUrl } from './auth-api';

// ==================== TYPES ====================

export type SittingClient = {
  id: string;
  appId: string;
  userId: string;
  clientName: string;
  catName: string;
  address: string;
  entryNote: string | null;
  requirements: string | null;
  catPic: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SittingBooking = {
  id: string;
  appId: string;
  clientId: string;
  reservationDate: string;
  catName: string;
  bookingStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  expectedAmount: number;
  amount: number;
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  contactMethod: string | null;
  addressSnapshot: string;
  entryNoteSnapshot: string | null;
  createdAt: string;
  updatedAt: string;
  client?: SittingClient;
  cares?: SittingCare[];
};

export type SittingCare = {
  id: string;
  appId: string;
  bookingId: string;
  careTime: string;
  completedAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  booking?: {
    id: string;
    catName: string;
    addressSnapshot: string;
    client: {
      id: string;
      clientName: string;
      catName: string;
      address: string;
    };
  };
};

export type CreateCareInput = {
  bookingId: string;
  careTimeKst: string;
  note?: string;
};

export type UpdateCareInput = {
  careTimeKst?: string;
  note?: string;
};

export type CreateClientInput = {
  clientName: string;
  catName: string;
  address: string;
  entryNote?: string;
  requirements?: string;
  catPic?: string;
};

export type UpdateClientInput = {
  clientName?: string;
  catName?: string;
  address?: string;
  entryNote?: string;
  requirements?: string;
  catPic?: string;
};

export type CreateBookingInput = {
  clientId: string;
  reservationKst: string;
  expectedAmount: number;
  amount: number;
  contactMethod?: string;
  entryNoteSnapshotOverride?: string;
  addressSnapshotOverride?: string;
  catNameOverride?: string;
};

export type UpdateBookingInput = {
  reservationKst?: string;
  expectedAmount?: number;
  amount?: number;
  contactMethod?: string;
  entryNoteSnapshot?: string;
  catName?: string;
  addressSnapshot?: string;
};

// ==================== API CLIENT ====================

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

const authHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ==================== CALENDAR ====================

export const getCaresForCalendar = async (
  token: string,
  from: string,
  to: string,
): Promise<SittingCare[]> => {
  const response = await api.get('/sitting/calendar/cares', {
    ...authHeaders(token),
    params: { from, to },
  });
  return response.data;
};

// ==================== CLIENTS ====================

export const createClient = async (
  token: string,
  data: CreateClientInput,
): Promise<SittingClient> => {
  const response = await api.post('/sitting/clients', data, authHeaders(token));
  return response.data;
};

export const updateClient = async (
  token: string,
  clientId: string,
  data: UpdateClientInput,
): Promise<SittingClient> => {
  const response = await api.patch(
    `/sitting/clients/${clientId}`,
    data,
    authHeaders(token),
  );
  return response.data;
};

export const deleteClient = async (token: string, clientId: string): Promise<void> => {
  await api.delete(`/sitting/clients/${clientId}`, authHeaders(token));
};

export const getClients = async (token: string): Promise<SittingClient[]> => {
  const response = await api.get('/sitting/clients', authHeaders(token));
  return response.data;
};

export const getClient = async (token: string, clientId: string): Promise<SittingClient> => {
  const response = await api.get(`/sitting/clients/${clientId}`, authHeaders(token));
  return response.data;
};

// ==================== BOOKINGS ====================

export const createBooking = async (
  token: string,
  data: CreateBookingInput,
): Promise<SittingBooking> => {
  const response = await api.post('/sitting/bookings', data, authHeaders(token));
  return response.data;
};

export const updateBooking = async (
  token: string,
  bookingId: string,
  data: UpdateBookingInput,
): Promise<SittingBooking> => {
  const response = await api.patch(
    `/sitting/bookings/${bookingId}`,
    data,
    authHeaders(token),
  );
  return response.data;
};

export const updateBookingStatus = async (
  token: string,
  bookingId: string,
  bookingStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED',
): Promise<SittingBooking> => {
  const response = await api.patch(
    `/sitting/bookings/${bookingId}/status`,
    { bookingStatus },
    authHeaders(token),
  );
  return response.data;
};

export const getBookings = async (
  token: string,
  params?: { clientId?: string; status?: string },
): Promise<SittingBooking[]> => {
  const response = await api.get('/sitting/bookings', {
    ...authHeaders(token),
    params,
  });
  return response.data;
};

export const getBooking = async (token: string, bookingId: string): Promise<SittingBooking> => {
  const response = await api.get(`/sitting/bookings/${bookingId}`, authHeaders(token));
  return response.data;
};

// ==================== CARES ====================

export const getCare = async (token: string, careId: string): Promise<SittingCare> => {
  const response = await api.get(`/sitting/cares/${careId}`, authHeaders(token));
  return response.data;
};

export const createCare = async (token: string, data: CreateCareInput): Promise<SittingCare> => {
  const response = await api.post('/sitting/cares', data, authHeaders(token));
  return response.data;
};

export const updateCare = async (
  token: string,
  careId: string,
  data: UpdateCareInput,
): Promise<SittingCare> => {
  const response = await api.patch(`/sitting/cares/${careId}`, data, authHeaders(token));
  return response.data;
};

export const deleteCare = async (token: string, careId: string): Promise<void> => {
  await api.delete(`/sitting/cares/${careId}`, authHeaders(token));
};

export const toggleCareComplete = async (token: string, careId: string): Promise<SittingCare> => {
  const response = await api.patch(
    `/sitting/cares/${careId}/toggle-complete`,
    {},
    authHeaders(token),
  );
  return response.data;
};
