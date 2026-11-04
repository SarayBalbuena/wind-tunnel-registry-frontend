import { useState } from 'react';
import {
  buildEntryGroups,
  filterEntriesByNote,
  formatMinutes,
} from '@components/Entries/Entries.helpers.ts';
import { EntriesCard } from '@components/Entries/EntriesCard/EntriesCard.tsx';
import { EntriesFilters } from '@components/Entries/EntriesFilters/EntriesFilters.tsx';
import { EntriesList } from '@components/Entries/EntriesList/EntriesList.tsx';
import { EntriesMonth } from '@components/Entries/EntriesMonth/EntriesMonth.tsx';
import { EntriesSkeleton } from '@components/Entries/EntriesSkeleton/EntriesSkeleton.tsx';
import { EntriesState } from '@components/Entries/EntriesState/EntriesState.tsx';
import { ConfirmDialog } from '@components/ui/confirm-dialog.tsx';
import { useDashboardData } from '@hooks/useDashboard/useDashboard.ts';
import { useDashboardUI } from '@hooks/useDashboardUI/useDashboardUI.ts';
import { useEntriesFilters } from '@hooks/useEntriesFilters/useEntriesFilters.ts';
import { type Entry } from '@services/entriesService/entries.service.types.ts';

export const Entries = () => {
  const {
    entries,
    entriesError,
    refetchEntries,
    deleteEntry,
    isDeletingEntry,
  } = useDashboardData();

  const { openEditEntryModal, openCreateEntryModal } = useDashboardUI();

  const {
    typeFilter,
    dateFilter,
    search,
    sort,
    hasActiveFilters,
    setTypeFilter,
    setDateFilter,
    setSearch,
    setSort,
    clearFilters,
  } = useEntriesFilters();

  const [entryToDelete, setEntryToDelete] = useState<Entry | null>(null);

  const closeDeleteDialog = () => {
    setEntryToDelete(null);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    await deleteEntry(entryToDelete.id);
    closeDeleteDialog();
  };

  // No data yet and no error: still loading (or waiting for the session)
  if (!entries && !entriesError) {
    return <EntriesSkeleton />;
  }

  const toolbar = (
    <EntriesFilters
      typeFilter={typeFilter}
      dateFilter={dateFilter}
      search={search}
      sort={sort}
      hasActiveFilters={hasActiveFilters}
      onTypeChange={setTypeFilter}
      onDateChange={setDateFilter}
      onSearchChange={setSearch}
      onSortChange={setSort}
      onClear={clearFilters}
    />
  );

  if (entriesError && !entries) {
    return (
      <EntriesList toolbar={toolbar}>
        <EntriesState variant="error" onAction={() => refetchEntries()} />
      </EntriesList>
    );
  }

  const groups = buildEntryGroups(
    filterEntriesByNote(entries ?? [], search),
    sort,
  );

  if (!groups.length) {
    return (
      <EntriesList toolbar={toolbar}>
        {hasActiveFilters ? (
          <EntriesState variant="noMatch" onAction={clearFilters} />
        ) : (
          <EntriesState variant="empty" onAction={openCreateEntryModal} />
        )}
      </EntriesList>
    );
  }

  return (
    <>
      <EntriesList toolbar={toolbar}>
        {groups.map((group) => (
          <EntriesMonth
            key={group.key}
            label={group.label}
            summary={`${formatMinutes(group.totalMinutes)} · ${group.entries.length} ${group.entries.length === 1 ? 'flight' : 'flights'}`}
          >
            {group.entries.map((entry) => (
              <EntriesCard key={entry.id}>
                <EntriesCard.Header>
                  <EntriesCard.Type type={entry.type} />
                  <EntriesCard.Date date={entry.date} />
                </EntriesCard.Header>

                <EntriesCard.Content>
                  <EntriesCard.Minutes minutes={entry.minutes} />
                  <EntriesCard.Actions
                    onEdit={() => openEditEntryModal(entry)}
                    onDelete={() => setEntryToDelete(entry)}
                    date={entry.date}
                  />
                </EntriesCard.Content>

                <EntriesCard.Note note={entry.note ?? ''} />
              </EntriesCard>
            ))}
          </EntriesMonth>
        ))}
      </EntriesList>

      <ConfirmDialog
        open={!!entryToDelete}
        onOpenChange={(details) => {
          if (!details.open) closeDeleteDialog();
        }}
        title="Delete entry"
        description="Are you sure you want to delete this entry? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
        isLoading={isDeletingEntry}
        colorPalette="red"
      />
    </>
  );
};
