import { useCallback, useReducer, useState } from 'react';

import type { SittingBooking, SittingClient } from '@/lib/sitting-api';

type BookingCreateFormState = {
  selectedClient: SittingClient | null;
  bookingDate: Date;
  expectedAmount: string;
  amount: string;
  contactMethod: string | null;
};

type BookingCreateFormAction =
  | {
      type: 'set';
      field: keyof BookingCreateFormState;
      value: BookingCreateFormState[keyof BookingCreateFormState];
    }
  | {
      type: 'update-selected-client';
      updater: (prev: SittingClient | null) => SittingClient | null;
    }
  | { type: 'hydrate'; payload: BookingCreateFormState };

type BookingEditFormState = {
  editBookingDate: Date;
  editExpectedAmount: string;
  editAmount: string;
  editContactMethod: string | null;
  editEntryNote: string;
};

type BookingEditFormAction =
  | {
      type: 'set';
      field: keyof BookingEditFormState;
      value: BookingEditFormState[keyof BookingEditFormState];
    }
  | { type: 'hydrate'; payload: BookingEditFormState };

const createInitialBookingCreateForm = (): BookingCreateFormState => ({
  selectedClient: null,
  bookingDate: new Date(),
  expectedAmount: '',
  amount: '',
  contactMethod: '카톡',
});

const createInitialBookingEditForm = (): BookingEditFormState => ({
  editBookingDate: new Date(),
  editExpectedAmount: '',
  editAmount: '',
  editContactMethod: '카톡',
  editEntryNote: '',
});

const bookingCreateFormReducer = (
  state: BookingCreateFormState,
  action: BookingCreateFormAction,
): BookingCreateFormState => {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'update-selected-client':
      return { ...state, selectedClient: action.updater(state.selectedClient) };
    case 'hydrate':
      return { ...action.payload };
    default:
      return state;
  }
};

const bookingEditFormReducer = (
  state: BookingEditFormState,
  action: BookingEditFormAction,
): BookingEditFormState => {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'hydrate':
      return { ...action.payload };
    default:
      return state;
  }
};

const useAdminBookingState = () => {
  const [bookings, setBookings] = useState<SittingBooking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [bookingQuery, setBookingQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<
    'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  >('ALL');
  const [bookingClientFilter, setBookingClientFilter] = useState<SittingClient | null>(null);
  const [isSavingBooking, setIsSavingBooking] = useState(false);
  const [showBookingCreateModal, setShowBookingCreateModal] = useState(false);
  const [showClientCreateModal, setShowClientCreateModal] = useState(false);
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [clientPickerTarget, setClientPickerTarget] = useState<
    'booking-create' | 'booking-filter' | null
  >(null);
  const [editingBooking, setEditingBooking] = useState<SittingBooking | null>(null);
  const [isUpdatingBooking, setIsUpdatingBooking] = useState(false);
  const [showBookingEditModal, setShowBookingEditModal] = useState(false);
  const [showContactMethodPicker, setShowContactMethodPicker] = useState(false);
  const [contactMethodTarget, setContactMethodTarget] = useState<'create' | 'edit' | null>(
    null,
  );
  const [showBookingDatePicker, setShowBookingDatePicker] = useState(false);
  const [showBookingTimePicker, setShowBookingTimePicker] = useState(false);
  const [bookingPickerTarget, setBookingPickerTarget] = useState<'create' | 'edit' | null>(
    null,
  );
  const [pendingBookingCreateOpen, setPendingBookingCreateOpen] = useState(false);
  const [pendingBookingEditOpen, setPendingBookingEditOpen] = useState(false);

  const [bookingCreateForm, dispatchBookingCreateForm] = useReducer(
    bookingCreateFormReducer,
    undefined,
    createInitialBookingCreateForm,
  );

  const [bookingEditForm, dispatchBookingEditForm] = useReducer(
    bookingEditFormReducer,
    undefined,
    createInitialBookingEditForm,
  );

  const setSelectedClient = useCallback(
    (
      value:
        | SittingClient
        | null
        | ((prev: SittingClient | null) => SittingClient | null),
    ) => {
      if (typeof value === 'function') {
        dispatchBookingCreateForm({
          type: 'update-selected-client',
          updater: value,
        });
        return;
      }
      dispatchBookingCreateForm({ type: 'set', field: 'selectedClient', value });
    },
    [],
  );

  const setBookingDate = useCallback((value: Date) => {
    dispatchBookingCreateForm({ type: 'set', field: 'bookingDate', value });
  }, []);

  const setExpectedAmount = useCallback((value: string) => {
    dispatchBookingCreateForm({ type: 'set', field: 'expectedAmount', value });
  }, []);

  const setAmount = useCallback((value: string) => {
    dispatchBookingCreateForm({ type: 'set', field: 'amount', value });
  }, []);

  const setContactMethod = useCallback((value: string | null) => {
    dispatchBookingCreateForm({ type: 'set', field: 'contactMethod', value });
  }, []);

  const setEditBookingDate = useCallback((value: Date) => {
    dispatchBookingEditForm({ type: 'set', field: 'editBookingDate', value });
  }, []);

  const setEditExpectedAmount = useCallback((value: string) => {
    dispatchBookingEditForm({ type: 'set', field: 'editExpectedAmount', value });
  }, []);

  const setEditAmount = useCallback((value: string) => {
    dispatchBookingEditForm({ type: 'set', field: 'editAmount', value });
  }, []);

  const setEditContactMethod = useCallback((value: string | null) => {
    dispatchBookingEditForm({ type: 'set', field: 'editContactMethod', value });
  }, []);

  const setEditEntryNote = useCallback((value: string) => {
    dispatchBookingEditForm({ type: 'set', field: 'editEntryNote', value });
  }, []);

  const hydrateBookingEditForm = useCallback((payload: BookingEditFormState) => {
    dispatchBookingEditForm({ type: 'hydrate', payload });
  }, []);

  return {
    bookings,
    setBookings,
    isLoadingBookings,
    setIsLoadingBookings,
    bookingQuery,
    setBookingQuery,
    bookingStatusFilter,
    setBookingStatusFilter,
    bookingClientFilter,
    setBookingClientFilter,
    selectedClient: bookingCreateForm.selectedClient,
    setSelectedClient,
    bookingDate: bookingCreateForm.bookingDate,
    setBookingDate,
    expectedAmount: bookingCreateForm.expectedAmount,
    setExpectedAmount,
    amount: bookingCreateForm.amount,
    setAmount,
    contactMethod: bookingCreateForm.contactMethod,
    setContactMethod,
    isSavingBooking,
    setIsSavingBooking,
    showBookingCreateModal,
    setShowBookingCreateModal,
    showClientCreateModal,
    setShowClientCreateModal,
    showClientPicker,
    setShowClientPicker,
    clientPickerTarget,
    setClientPickerTarget,
    editingBooking,
    setEditingBooking,
    editBookingDate: bookingEditForm.editBookingDate,
    setEditBookingDate,
    editExpectedAmount: bookingEditForm.editExpectedAmount,
    setEditExpectedAmount,
    editAmount: bookingEditForm.editAmount,
    setEditAmount,
    editContactMethod: bookingEditForm.editContactMethod,
    setEditContactMethod,
    editEntryNote: bookingEditForm.editEntryNote,
    setEditEntryNote,
    hydrateBookingEditForm,
    isUpdatingBooking,
    setIsUpdatingBooking,
    showBookingEditModal,
    setShowBookingEditModal,
    showContactMethodPicker,
    setShowContactMethodPicker,
    contactMethodTarget,
    setContactMethodTarget,
    showBookingDatePicker,
    setShowBookingDatePicker,
    showBookingTimePicker,
    setShowBookingTimePicker,
    bookingPickerTarget,
    setBookingPickerTarget,
    pendingBookingCreateOpen,
    setPendingBookingCreateOpen,
    pendingBookingEditOpen,
    setPendingBookingEditOpen,
  };
};

export default useAdminBookingState;