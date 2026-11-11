import { createContext, type ReactNode, useMemo, useReducer } from 'react';
import { type Entry } from '@services/entriesService/entries.service.types.ts';
import {
  dashboardUIReducer,
  initialDashboardUIState,
} from '@/context/DashboardUIContext/DashboardUIContext.reducer.ts';
import { type DashboardUIContextType } from '@/context/DashboardUIContext/DashboardUIContext.types.ts';

export const DashboardUIContext = createContext<
  DashboardUIContextType | undefined
>(undefined);

export const DashboardUIProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(
    dashboardUIReducer,
    initialDashboardUIState,
  );

  const openCreateEntryModal = () => {
    dispatch({ type: 'OPEN_CREATE_ENTRY' });
  };

  const openEditEntryModal = (entry: Entry) => {
    dispatch({ type: 'OPEN_EDIT_ENTRY', payload: entry });
  };

  const closeEntryFormModal = () => {
    dispatch({ type: 'CLOSE_ENTRY_FORM' });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the open/close callbacks only dispatch, so `state` is the sole real dependency
  const value = useMemo<DashboardUIContextType>(
    () => ({
      isEntryFormOpen: state.isEntryFormOpen,
      entryFormMode: state.entryFormMode,
      selectedEntry: state.selectedEntry,
      openCreateEntryModal,
      openEditEntryModal,
      closeEntryFormModal,
    }),
    [state],
  );

  return (
    <DashboardUIContext.Provider value={value}>
      {children}
    </DashboardUIContext.Provider>
  );
};
