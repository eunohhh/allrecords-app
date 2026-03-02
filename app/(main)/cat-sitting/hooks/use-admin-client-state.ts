import { useCallback, useReducer, useState } from 'react';

import type { SittingClient } from '@/lib/sitting-api';

type ClientFormState = {
  clientName: string;
  clientCatName: string;
  clientAddress: string;
  clientEntryNote: string;
  clientRequirements: string;
};

type ClientFormAction =
  | { type: 'set'; field: keyof ClientFormState; value: string }
  | { type: 'reset' }
  | { type: 'hydrate'; payload: ClientFormState };

const createInitialClientForm = (): ClientFormState => ({
  clientName: '',
  clientCatName: '',
  clientAddress: '',
  clientEntryNote: '',
  clientRequirements: '',
});

const clientFormReducer = (state: ClientFormState, action: ClientFormAction): ClientFormState => {
  switch (action.type) {
    case 'set':
      return { ...state, [action.field]: action.value };
    case 'hydrate':
      return { ...action.payload };
    case 'reset':
      return createInitialClientForm();
    default:
      return state;
  }
};

const useAdminClientState = () => {
  const [clients, setClients] = useState<SittingClient[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [clientQuery, setClientQuery] = useState('');
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<SittingClient | null>(null);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [clientForm, dispatchClientForm] = useReducer(
    clientFormReducer,
    undefined,
    createInitialClientForm,
  );

  const setClientName = useCallback((value: string) => {
    dispatchClientForm({ type: 'set', field: 'clientName', value });
  }, []);

  const setClientCatName = useCallback((value: string) => {
    dispatchClientForm({ type: 'set', field: 'clientCatName', value });
  }, []);

  const setClientAddress = useCallback((value: string) => {
    dispatchClientForm({ type: 'set', field: 'clientAddress', value });
  }, []);

  const setClientEntryNote = useCallback((value: string) => {
    dispatchClientForm({ type: 'set', field: 'clientEntryNote', value });
  }, []);

  const setClientRequirements = useCallback((value: string) => {
    dispatchClientForm({ type: 'set', field: 'clientRequirements', value });
  }, []);

  const resetClientForm = useCallback(() => {
    dispatchClientForm({ type: 'reset' });
  }, []);

  const hydrateClientForm = useCallback((payload: ClientFormState) => {
    dispatchClientForm({ type: 'hydrate', payload });
  }, []);

  return {
    clients,
    setClients,
    isLoadingClients,
    setIsLoadingClients,
    clientQuery,
    setClientQuery,
    clientModalVisible,
    setClientModalVisible,
    editingClient,
    setEditingClient,
    clientName: clientForm.clientName,
    setClientName,
    clientCatName: clientForm.clientCatName,
    setClientCatName,
    clientAddress: clientForm.clientAddress,
    setClientAddress,
    clientEntryNote: clientForm.clientEntryNote,
    setClientEntryNote,
    clientRequirements: clientForm.clientRequirements,
    setClientRequirements,
    resetClientForm,
    hydrateClientForm,
    isSavingClient,
    setIsSavingClient,
  };
};

export default useAdminClientState;