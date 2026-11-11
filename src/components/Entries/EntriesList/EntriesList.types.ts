import { type ReactNode } from 'react';

export interface EntriesListProps {
  toolbar?: ReactNode;
  actions?: ReactNode;
  help?: ReactNode;
  children: ReactNode;
}
