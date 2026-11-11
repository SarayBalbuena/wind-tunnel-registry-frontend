import { getLocalDateISO } from '@components/Entries/EntryFormDialog/EntryFormDialog.helpers.ts';

export const getExportFileName = () =>
  `wind-tunnel-logbook-${getLocalDateISO()}.csv`;

/** Starts a browser download of `content`; the BOM makes Excel read UTF-8. */
export const downloadCsv = (content: string, fileName: string) => {
  const blob = new Blob([`﻿${content}`], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
