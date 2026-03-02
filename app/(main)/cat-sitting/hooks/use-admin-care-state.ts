import { useCallback, useReducer, useState } from 'react';

import type { SittingCare } from '@/lib/sitting-api';

type CareEditFormState = {
  editCareDate: Date;
  editCareNote: string;
};

type CareEditFormAction =
  | {
      type: 'set';
      field: keyof CareEditFormState;
      value: CareEditFormState[keyof CareEditFormState];
    }
  | { type: 'hydrate'; payload: CareEditFormState };

const createInitialCareEditForm = (): CareEditFormState => ({
  editCareDate: new Date(),
  editCareNote: '',
});

const careEditFormReducer = (
  state: CareEditFormState,
  action: CareEditFormAction,
): CareEditFormState => {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'hydrate':
      return { ...action.payload };
    default:
      return state;
  }
};

const useAdminCareState = () => {
  const [cares, setCares] = useState<SittingCare[]>([]);
  const [isLoadingCares, setIsLoadingCares] = useState(false);
  const [careQuery, setCareQuery] = useState('');
  const [careFilterFrom, setCareFilterFrom] = useState<Date | null>(null);
  const [careFilterTo, setCareFilterTo] = useState<Date | null>(null);
  const [showCareFilterDatePicker, setShowCareFilterDatePicker] = useState(false);
  const [careFilterDateTarget, setCareFilterDateTarget] = useState<'from' | 'to' | null>(
    null,
  );
  const [careMonth, setCareMonth] = useState(new Date());
  const [showCareCreateModal, setShowCareCreateModal] = useState(false);
  const [showCareEditModal, setShowCareEditModal] = useState(false);
  const [editingCare, setEditingCare] = useState<SittingCare | null>(null);
  const [isUpdatingCare, setIsUpdatingCare] = useState(false);
  const [showCareDatePicker, setShowCareDatePicker] = useState(false);
  const [showCareTimePicker, setShowCareTimePicker] = useState(false);
  const [pendingCareEditOpen, setPendingCareEditOpen] = useState(false);

  const [careEditForm, dispatchCareEditForm] = useReducer(
    careEditFormReducer,
    undefined,
    createInitialCareEditForm,
  );

  const setEditCareDate = useCallback((value: Date) => {
    dispatchCareEditForm({ type: 'set', field: 'editCareDate', value });
  }, []);

  const setEditCareNote = useCallback((value: string) => {
    dispatchCareEditForm({ type: 'set', field: 'editCareNote', value });
  }, []);

  const hydrateCareEditForm = useCallback((payload: CareEditFormState) => {
    dispatchCareEditForm({ type: 'hydrate', payload });
  }, []);

  return {
    cares,
    setCares,
    isLoadingCares,
    setIsLoadingCares,
    careQuery,
    setCareQuery,
    careFilterFrom,
    setCareFilterFrom,
    careFilterTo,
    setCareFilterTo,
    showCareFilterDatePicker,
    setShowCareFilterDatePicker,
    careFilterDateTarget,
    setCareFilterDateTarget,
    careMonth,
    setCareMonth,
    showCareCreateModal,
    setShowCareCreateModal,
    showCareEditModal,
    setShowCareEditModal,
    editingCare,
    setEditingCare,
    editCareDate: careEditForm.editCareDate,
    setEditCareDate,
    editCareNote: careEditForm.editCareNote,
    setEditCareNote,
    hydrateCareEditForm,
    isUpdatingCare,
    setIsUpdatingCare,
    showCareDatePicker,
    setShowCareDatePicker,
    showCareTimePicker,
    setShowCareTimePicker,
    pendingCareEditOpen,
    setPendingCareEditOpen,
  };
};

export default useAdminCareState;