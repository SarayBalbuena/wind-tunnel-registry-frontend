import { apiFetch } from '@services/utils/apiFetch';
import {
  type CreateEntryPayload,
  type EntriesQuery,
  type EntriesResponse,
  type Entry,
  type UpdateEntryPayload,
} from './entries.service.types';

export const getEntries = async (
  query: EntriesQuery = {},
): Promise<EntriesResponse> => {
  const params = new URLSearchParams();
  if (query.type) params.set('type', query.type);
  if (query.date) params.set('date', query.date);
  const queryString = params.toString();

  return await apiFetch(`/entries${queryString ? `?${queryString}` : ''}`);
};

export const createEntry = async (
  payload: CreateEntryPayload,
): Promise<Entry> => {
  return await apiFetch('/entries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const updateEntry = async (
  id: string,
  payload: UpdateEntryPayload,
): Promise<Entry> => {
  return await apiFetch(`/entries/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
};

export const deleteEntry = async (id: string): Promise<void> => {
  return await apiFetch(`/entries/${id}`, {
    method: 'DELETE',
  });
};

/** Keeps each request well under the backend's JSON body limit. */
export const IMPORT_CHUNK_SIZE = 200;

/**
 * Creates many entries through `POST /entries/import`, in sequential chunks.
 * A chunk is all-or-nothing on the backend, so a failure can leave earlier
 * chunks saved: re-importing the same file skips them (see `splitNewEntries`).
 */
export const importEntries = async (
  entries: CreateEntryPayload[],
): Promise<Entry[]> => {
  const imported: Entry[] = [];

  for (let i = 0; i < entries.length; i += IMPORT_CHUNK_SIZE) {
    const chunk = entries.slice(i, i + IMPORT_CHUNK_SIZE);
    const created: Entry[] = await apiFetch('/entries/import', {
      method: 'POST',
      body: JSON.stringify({ entries: chunk }),
    });
    imported.push(...created);
  }

  return imported;
};
