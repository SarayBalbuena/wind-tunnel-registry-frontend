import { useEffect, useState } from 'react';
import {
  buildEntryPayload,
  getDefaultEntryFormValues,
  getEntryFormValues,
  readLastEntryType,
  saveLastEntryType,
} from '@components/Entries/EntryFormDialog/EntryFormDialog.helpers.ts';
import { type EntryFormValues } from '@components/Entries/EntryFormDialog/EntryFormDialog.types.ts';
import {
  type Entry,
  type EntryType,
} from '@services/entriesService/entries.service.types.ts';
import { useForm } from 'react-hook-form';
import { type EntryFormMode } from '@/context/DashboardUIContext/DashboardUIContext.types.ts';

type UseEntryFormParams = {
  open: boolean;
  mode: EntryFormMode;
  entry: Entry | null;
  onSubmit: (payload: ReturnType<typeof buildEntryPayload>) => Promise<void>;
};

export const useEntryForm = ({
  open,
  mode,
  entry,
  onSubmit,
}: UseEntryFormParams) => {
  const form = useForm<EntryFormValues>({
    defaultValues: getDefaultEntryFormValues(),
    mode: 'onChange',
  });

  // The type used for the previous new entry, read each time the form opens
  const [lastEntryType, setLastEntryType] = useState<EntryType | null>(null);

  const { reset, handleSubmit, trigger } = form;

  useEffect(() => {
    if (!open) return;

    const lastType = readLastEntryType();
    setLastEntryType(lastType);

    reset(
      getEntryFormValues(mode === 'edit' ? entry : null, lastType ?? undefined),
    );

    void trigger();
  }, [open, mode, entry, reset, trigger]);

  const submitForm = handleSubmit(async (values) => {
    const payload = buildEntryPayload(values);
    await onSubmit(payload);

    if (mode === 'create') saveLastEntryType(payload.type);
  });

  return {
    ...form,
    submitForm,
    lastEntryType,
  };
};
