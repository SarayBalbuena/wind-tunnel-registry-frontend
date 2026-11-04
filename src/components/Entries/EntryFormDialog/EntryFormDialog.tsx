import {
  createListCollection,
  Field,
  Input,
  Portal,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { FormDialog } from '@components/ui/form-dialog.tsx';
import { useEntryForm } from '@hooks/useEntryForm/useEntryForm.ts';
import { Controller } from 'react-hook-form';
import { ENTRY_FORM_ID, entryFormRules } from './EntryFormDialog.helpers.ts';
import {
  entryDialogBackdropStyles,
  entryDialogCancelButtonStyles,
  entryDialogContentStyles,
  entryDialogFooterStyles,
  entryDialogHeaderStyles,
  entryDialogSubmitButtonStyles,
  entryFieldStyles,
  entrySelectContentStyles,
} from './EntryFormDialog.styles.ts';
import {
  type EntryFormDialogProps,
  type EntryFormValues,
} from './EntryFormDialog.types.ts';

const entryTypeCollection = createListCollection({
  items: [
    { label: '1-on-1', value: 'INDIVIDUAL' },
    { label: 'Group', value: 'SHARED' },
  ],
});

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
    submitForm,
    formState: { errors },
  } = useEntryForm({
    open,
    mode,
    entry,
    onSubmit,
  });

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      onCancel={() => onOpenChange({ open: false })}
      title={mode === 'create' ? 'Create entry' : 'Edit entry'}
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
      <form id={ENTRY_FORM_ID} onSubmit={submitForm}>
        <VStack gap="4" align="stretch">
          <Field.Root invalid={!!errors.type}>
            <Field.Label>Type</Field.Label>
            <Controller
              name="type"
              control={control}
              rules={entryFormRules.type}
              render={({ field }) => (
                <Select.Root
                  collection={entryTypeCollection}
                  value={field.value ? [field.value] : []}
                  onValueChange={({ value }) =>
                    field.onChange(value[0] as EntryFormValues['type'])
                  }
                >
                  <Select.HiddenSelect name={field.name} />
                  <Select.Control>
                    <Select.Trigger {...entryFieldStyles}>
                      <Select.ValueText placeholder="Select type" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>

                  <Portal>
                    <Select.Positioner>
                      <Select.Content {...entrySelectContentStyles}>
                        {entryTypeCollection.items.map((item) => (
                          <Select.Item item={item} key={item.value}>
                            {item.label}
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              )}
            />
            {errors.type && (
              <Field.ErrorText>{errors.type.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.date}>
            <Field.Label>Date</Field.Label>
            <Input
              type="date"
              {...entryFieldStyles}
              {...register('date', entryFormRules.date)}
            />
            {errors.date && (
              <Field.ErrorText>{errors.date.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.minutes}>
            <Field.Label>Minutes</Field.Label>
            <Input
              type="number"
              min={1}
              {...entryFieldStyles}
              {...register('minutes', entryFormRules.minutes)}
            />
            {errors.minutes && (
              <Field.ErrorText>{errors.minutes.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.note}>
            <Field.Label>Note</Field.Label>
            <Textarea
              minH="120px"
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
