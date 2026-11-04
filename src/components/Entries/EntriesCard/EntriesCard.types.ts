import { type ReactNode } from 'react';
import { type EntryType } from '@services/entriesService/entries.service.types.ts';

export interface EntriesCardProps {
  children: ReactNode;
  className?: string;
}

export interface EntriesCardHeaderProps {
  children: ReactNode;
}

export interface EntriesCardDateProps {
  date: string;
}

export interface EntriesCardTypeProps {
  type: EntryType;
}

export interface EntriesCardContentProps {
  children: ReactNode;
}

export interface EntriesCardMinutesProps {
  minutes: number;
}

export interface EntriesCardNoteProps {
  note: string;
}

export interface EntriesCardActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  date: string;
}
