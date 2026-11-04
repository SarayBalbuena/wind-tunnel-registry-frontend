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
