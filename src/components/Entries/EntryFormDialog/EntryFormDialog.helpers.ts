import {
  type Entry,
  type EntryType,
} from '@services/entriesService/entries.service.types.ts';
import { type EntryFormValues } from './EntryFormDialog.types.ts';

export const ENTRY_FORM_ID = 'entry-form';
export const MINUTES_INPUT_ID = 'entry-form-minutes';

export const LAST_ENTRY_TYPE_KEY = 'wind-tunnel-logbook:last-entry-type';

/** Common session lengths offered as one-tap chips. */
export const MINUTES_PRESETS = [15, 20, 30, 45, 60] as const;

export const MAX_MINUTES = 24 * 60;

/** Local date as YYYY-MM-DD, `daysAgo` days before today. */
export const getLocalDateISO = (daysAgo = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

/** The type used for the previous new entry, if the browser remembers it. */
export const readLastEntryType = (): EntryType | null => {
  try {
    const value = window.localStorage.getItem(LAST_ENTRY_TYPE_KEY);
    return value === 'INDIVIDUAL' || value === 'SHARED' ? value : null;
  } catch {
    return null;
  }
};

export const saveLastEntryType = (type: EntryType) => {
  try {
    window.localStorage.setItem(LAST_ENTRY_TYPE_KEY, type);
  } catch {
    // Storage can be unavailable (private mode, quota): remembering is optional
  }
};

/** Values for a new entry: today, 15 min and the last type used. */
export const getDefaultEntryFormValues = (
  type: EntryType = 'INDIVIDUAL',
): EntryFormValues => ({
  type,
  date: getLocalDateISO(),
  minutes: 15,
  note: '',
});

export const getEntryFormValues = (
  entry: Entry | null,
  lastType: EntryType = 'INDIVIDUAL',
): EntryFormValues => {
  if (!entry) return getDefaultEntryFormValues(lastType);

  return {
    type: entry.type,
    date: entry.date,
    minutes: entry.minutes,
    note: entry.note ?? '',
  };
};

export const buildEntryPayload = (values: EntryFormValues) => ({
  type: values.type,
  date: values.date,
  minutes: Number(values.minutes),
  note: values.note.trim(),
});

export const entryFormRules = {
  type: {
    required: 'Type is required',
  },
  date: {
    required: 'Date is required',
  },
  minutes: {
    required: 'Minutes is required',
    valueAsNumber: true,
    min: {
      value: 1,
      message: 'Minutes must be greater than 0',
    },
    max: {
      value: MAX_MINUTES,
      message: `Minutes cannot exceed ${MAX_MINUTES}`,
    },
  },
  note: {
    maxLength: {
      value: 300,
      message: 'Note cannot exceed 300 characters',
    },
  },
} as const;
