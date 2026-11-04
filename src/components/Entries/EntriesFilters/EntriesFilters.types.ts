import { type EntriesSort } from '@hooks/useEntriesFilters/useEntriesFilters.ts';
import { type EntryTypeFilter } from '@services/entriesService/entries.service.types.ts';

export interface EntriesFiltersProps {
  typeFilter: EntryTypeFilter;
  dateFilter: string;
  search: string;
  sort: EntriesSort;
  hasActiveFilters: boolean;
  onTypeChange: (type: EntryTypeFilter) => void;
  onDateChange: (date: string) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sort: EntriesSort) => void;
  onClear: () => void;
}
