import { type KeyboardEvent } from 'react';
import {
  Button,
  Field,
  Flex,
  Input,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { FormDialog } from '@components/ui/form-dialog.tsx';
import { useEntryForm } from '@hooks/useEntryForm/useEntryForm.ts';
import { type EntryType } from '@services/entriesService/entries.service.types.ts';
import { Controller } from 'react-hook-form';
import {
  ENTRY_FORM_ID,
  entryFormRules,
  getLocalDateISO,
  MAX_MINUTES,
  MINUTES_INPUT_ID,
  MINUTES_PRESETS,
} from './EntryFormDialog.helpers.ts';
import {
  entryChipStyles,
  entryDialogBackdropStyles,
  entryDialogCancelButtonStyles,
  entryDialogContentStyles,
  entryDialogFooterStyles,
  entryDialogHeaderStyles,
  entryDialogSubmitButtonStyles,
  entryFieldStyles,
} from './EntryFormDialog.styles.ts';
import {
  type EntryFormDialogProps,
  type EntryFormValues,
} from './EntryFormDialog.types.ts';

const TYPE_OPTIONS: {
  value: EntryType;
  label: string;
  colorPalette: 'blue' | 'purple';
}[] = [
  { value: 'INDIVIDUAL', label: '1-on-1', colorPalette: 'blue' },
  { value: 'SHARED', label: 'Group', colorPalette: 'purple' },
];

const DAY_SHORTCUTS = [
  { label: 'Today', daysAgo: 0 },
  { label: 'Yesterday', daysAgo: 1 },
];

export const EntryFormDialog = ({
  open,
  mode,
  entry,
  isLoading = false,
  onSubmit,
  onOpenChange,
}: EntryFormDialogProps) => {
  const {
    control,
    register,
    watch,
    setValue,
    submitForm,
    lastEntryType,
    formState: { errors },
  } = useEntryForm({
    open,
    mode,
    entry,
    onSubmit,
  });

  const selectedMinutes = Number(watch('minutes'));
  const selectedDate = watch('date');

  const setFieldValue = (
    name: 'minutes' | 'date',
    value: EntryFormValues[typeof name],
  ) => {
    setValue(name, value as never, { shouldValidate: true, shouldDirty: true });
  };

  // Ctrl/Cmd + Enter saves from any field
  const handleFormKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submitForm();
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onCancel={() => onOpenChange({ open: false })}
      title={mode === 'create' ? 'Create entry' : 'Edit entry'}
      initialFocusEl={() => document.getElementById(MINUTES_INPUT_ID)}
      submitText={mode === 'create' ? 'Create' : 'Save'}
      cancelText="Cancel"
      isLoading={isLoading}
      isSubmitDisabled={false}
      submitFormId={ENTRY_FORM_ID}
      backdropProps={entryDialogBackdropStyles}
      contentProps={entryDialogContentStyles}
      headerProps={entryDialogHeaderStyles}
      footerProps={entryDialogFooterStyles}
      submitButtonProps={entryDialogSubmitButtonStyles}
      cancelButtonProps={entryDialogCancelButtonStyles}
    >
      <form
        id={ENTRY_FORM_ID}
        onSubmit={submitForm}
        onKeyDown={handleFormKeyDown}
      >
        <VStack gap="4" align="stretch">
          <Field.Root invalid={!!errors.type}>
            <Field.Label>Type</Field.Label>
            <Controller
              name="type"
              control={control}
              rules={entryFormRules.type}
              render={({ field }) => (
                <Flex gap="2" w="full" role="group" aria-label="Type">
                  {TYPE_OPTIONS.map((option) => {
                    const selected = field.value === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        flex="1"
                        justifyContent="flex-start"
                        borderRadius="xl"
                        colorPalette={option.colorPalette}
                        variant={selected ? 'subtle' : 'outline'}
                        aria-pressed={selected}
                        onClick={() => field.onChange(option.value)}
                      >
                        {option.label}
                        {mode === 'create' &&
                          lastEntryType === option.value && (
                            <Text
                              as="span"
                              ml="auto"
                              fontSize="xs"
                              fontWeight="normal"
                            >
                              last used
                            </Text>
                          )}
                      </Button>
                    );
                  })}
                </Flex>
              )}
            />
            {errors.type && (
              <Field.ErrorText>{errors.type.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.date}>
            <Field.Label>Date</Field.Label>
            <Flex gap="2" wrap="wrap" align="center">
              <Input
                type="date"
                w="auto"
                {...entryFieldStyles}
                {...register('date', entryFormRules.date)}
              />
              {DAY_SHORTCUTS.map((shortcut) => {
                const value = getLocalDateISO(shortcut.daysAgo);

                return (
                  <Button
                    key={shortcut.label}
                    type="button"
                    variant={selectedDate === value ? 'subtle' : 'outline'}
                    colorPalette="blue"
                    aria-pressed={selectedDate === value}
                    onClick={() => setFieldValue('date', value)}
                    {...entryChipStyles}
                  >
                    {shortcut.label}
                  </Button>
                );
              })}
            </Flex>
            {errors.date && (
              <Field.ErrorText>{errors.date.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root
            invalid={!!errors.minutes}
            ids={{ control: MINUTES_INPUT_ID }}
          >
            <Field.Label>
              Minutes
              <Text as="span" ml="2" fontWeight="normal" color="fg.muted">
                pick a common length or type your own
              </Text>
            </Field.Label>
            <Flex gap="2" wrap="wrap" align="center">
              {MINUTES_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={selectedMinutes === preset ? 'subtle' : 'outline'}
                  colorPalette="blue"
                  aria-pressed={selectedMinutes === preset}
                  onClick={() => setFieldValue('minutes', preset)}
                  {...entryChipStyles}
                >
                  {preset}
                </Button>
              ))}
              <Input
                type="number"
                min={1}
                max={MAX_MINUTES}
                inputMode="numeric"
                w="24"
                aria-label="Minutes"
                {...entryFieldStyles}
                {...register('minutes', entryFormRules.minutes)}
                onFocus={(event) => event.currentTarget.select()}
              />
            </Flex>
            {errors.minutes && (
              <Field.ErrorText>{errors.minutes.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.note}>
            <Field.Label>Note</Field.Label>
            <Textarea
              minH="100px"
              resize="vertical"
              {...entryFieldStyles}
              {...register('note', entryFormRules.note)}
            />
            {errors.note && (
              <Field.ErrorText>{errors.note.message}</Field.ErrorText>
            )}
          </Field.Root>
        </VStack>
      </form>
    </FormDialog>
  );
};
