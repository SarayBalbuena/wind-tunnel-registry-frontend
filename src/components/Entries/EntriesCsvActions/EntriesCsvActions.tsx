import { type ChangeEvent, useRef, useState } from 'react';
import { ImportEntriesDialog } from '@components/Entries/ImportEntriesDialog/ImportEntriesDialog.tsx';
import { toaster } from '@components/ui/toaster.tsx';
import { useDashboardData } from '@hooks/useDashboard/useDashboard.ts';
import {
  entriesToCsv,
  parseEntriesCsv,
} from '@services/entriesService/entries.csv.ts';
import { type ParsedEntriesCsv } from '@services/entriesService/entries.csv.types.ts';
import { type CreateEntryPayload } from '@services/entriesService/entries.service.types.ts';
import { ApiError } from '@services/utils/apiFetch.ts';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { downloadCsv, getExportFileName } from './EntriesCsvActions.helpers.ts';
import styles from './EntriesCsvActions.module.css';

interface PendingImport {
  fileName: string;
  parsed: ParsedEntriesCsv;
}

export const EntriesCsvActions = () => {
  const { allEntries, importEntries, isImportingEntries } = useDashboardData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingImport | null>(null);

  const handleExport = () => {
    if (!allEntries?.length) return;
    downloadCsv(entriesToCsv(allEntries), getExportFileName());
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Reset so choosing the same file again still fires `change`
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      setPending({ fileName: file.name, parsed: parseEntriesCsv(text) });
    } catch {
      toaster.create({
        type: 'error',
        title: 'Could not read the file',
        closable: true,
      });
    }
  };

  const handleConfirm = async (entries: CreateEntryPayload[]) => {
    try {
      await importEntries(entries);
      setPending(null);
      toaster.create({
        type: 'success',
        title: 'Import complete',
        description: `${entries.length} ${entries.length === 1 ? 'flight' : 'flights'} added to your log.`,
        closable: true,
      });
    } catch (error) {
      const reason =
        error instanceof ApiError
          ? `${error.status}${error.details ? ` · ${error.details}` : ''}. `
          : error instanceof Error
            ? `${error.message}. `
            : '';
      toaster.create({
        type: 'error',
        title: 'Import failed',
        description: `${reason}Some flights may have been saved. Import the file again: flights already in your log are skipped.`,
        closable: true,
      });
    }
  };

  return (
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.button}
        disabled={!allEntries?.length}
        onClick={handleExport}
      >
        <LuDownload aria-hidden="true" className={styles.iconDown} />
        Export CSV
      </button>

      <button
        type="button"
        className={styles.button}
        disabled={!allEntries}
        onClick={() => fileInputRef.current?.click()}
      >
        <LuUpload aria-hidden="true" className={styles.iconUp} />
        Import CSV
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className={styles.fileInput}
        aria-label="CSV file to import"
        tabIndex={-1}
        onChange={handleFileChange}
      />

      {pending && allEntries && (
        <ImportEntriesDialog
          open
          fileName={pending.fileName}
          parsed={pending.parsed}
          existing={allEntries}
          isLoading={isImportingEntries}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
};
