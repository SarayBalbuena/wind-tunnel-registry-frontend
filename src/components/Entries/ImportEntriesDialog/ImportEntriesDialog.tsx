import { useState } from 'react';
import { Button, Flex } from '@chakra-ui/react';
import { formatMinutes } from '@components/Entries/Entries.helpers.ts';
import {
  entryDialogBackdropStyles,
  entryDialogCancelButtonStyles,
  entryDialogContentStyles,
  entryDialogFooterStyles,
  entryDialogHeaderStyles,
  entryDialogSubmitButtonStyles,
} from '@components/Entries/EntryFormDialog/EntryFormDialog.styles.ts';
import { FormDialog } from '@components/ui/form-dialog.tsx';
import { splitNewEntries } from '@services/entriesService/entries.csv.ts';
import { type EntryType } from '@services/entriesService/entries.service.types.ts';
import styles from './ImportEntriesDialog.module.css';
import { type ImportEntriesDialogProps } from './ImportEntriesDialog.types.ts';

const MAX_LISTED_ERRORS = 50;

const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: 'INDIVIDUAL', label: '1-on-1' },
  { value: 'SHARED', label: 'Group' },
];

const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const ImportEntriesDialog = ({
  open,
  fileName,
  parsed,
  existing,
  isLoading = false,
  onConfirm,
  onClose,
}: ImportEntriesDialogProps) => {
  const [defaultType, setDefaultType] = useState<EntryType>('INDIVIDUAL');

  const needsDefaultType = parsed.entries.some((entry) => !entry.type);

  const { fresh, duplicates } = splitNewEntries(
    parsed.entries.map(({ line: _line, type, ...entry }) => ({
      ...entry,
      type: type ?? defaultType,
    })),
    existing,
  );

  const totalMinutes = fresh.reduce((sum, entry) => sum + entry.minutes, 0);
  const listedErrors = parsed.errors.slice(0, MAX_LISTED_ERRORS);
  const hiddenErrors = parsed.errors.length - listedErrors.length;

  return (
    <FormDialog
      open={open}
      onOpenChange={(details) => {
        if (!details.open && !isLoading) onClose();
      }}
      onCancel={onClose}
      title="Import flights"
      submitText={
        fresh.length > 0
          ? `Import ${plural(fresh.length, 'flight', 'flights')}`
          : 'Import'
      }
      cancelText="Cancel"
      isLoading={isLoading}
      isSubmitDisabled={fresh.length === 0 || !!parsed.fatalError}
      backdropProps={entryDialogBackdropStyles}
      contentProps={entryDialogContentStyles}
      headerProps={entryDialogHeaderStyles}
      footerProps={entryDialogFooterStyles}
      submitButtonProps={{
        ...entryDialogSubmitButtonStyles,
        onClick: () => onConfirm(fresh),
      }}
      cancelButtonProps={entryDialogCancelButtonStyles}
    >
      <p className={styles.fileName}>{fileName}</p>

      {parsed.fatalError ? (
        <p className={styles.fatal} role="alert">
          {parsed.fatalError}
        </p>
      ) : (
        <>
          {needsDefaultType && (
            <div className={styles.typeRow}>
              <span>Rows without a type are imported as</span>
              <Flex gap="2" role="group" aria-label="Default type">
                {TYPE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    size="xs"
                    borderRadius="full"
                    colorPalette="blue"
                    variant={
                      defaultType === option.value ? 'subtle' : 'outline'
                    }
                    aria-pressed={defaultType === option.value}
                    onClick={() => setDefaultType(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </Flex>
            </div>
          )}

          <ul className={styles.summary}>
            <li>
              <strong>{plural(fresh.length, 'flight', 'flights')}</strong> to
              import
              {fresh.length > 0 && (
                <span className={styles.muted}>
                  {' '}
                  · {formatMinutes(totalMinutes)}
                </span>
              )}
            </li>
            {duplicates.length > 0 && (
              <li className={styles.muted}>
                {plural(duplicates.length, 'flight', 'flights')} already in your
                log, skipped
              </li>
            )}
            {parsed.errors.length > 0 && (
              <li>
                {plural(parsed.errors.length, 'row', 'rows')} with errors,
                skipped
              </li>
            )}
          </ul>

          {listedErrors.length > 0 && (
            <ul className={styles.errors} aria-label="Rows with errors">
              {listedErrors.map((error) => (
                <li key={error.line}>
                  Line {error.line}: {error.message}
                </li>
              ))}
              {hiddenErrors > 0 && <li>…and {hiddenErrors} more</li>}
            </ul>
          )}

          {fresh.length === 0 && parsed.errors.length === 0 && (
            <p className={styles.hint}>There is nothing new to import.</p>
          )}
        </>
      )}
    </FormDialog>
  );
};
