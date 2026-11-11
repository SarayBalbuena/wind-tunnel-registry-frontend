import {
  buildEntryGroups,
  filterEntriesByNote,
  formatEntryDate,
  formatMinutes,
  UNDO_DURATION_MS,
} from '@components/Entries/Entries.helpers.ts';
import { EntriesCard } from '@components/Entries/EntriesCard/EntriesCard.tsx';
import { EntriesCsvActions } from '@components/Entries/EntriesCsvActions/EntriesCsvActions.tsx';
import { EntriesCsvHelp } from '@components/Entries/EntriesCsvActions/EntriesCsvHelp.tsx';
import { EntriesFilters } from '@components/Entries/EntriesFilters/EntriesFilters.tsx';
import { EntriesList } from '@components/Entries/EntriesList/EntriesList.tsx';
import { EntriesMonth } from '@components/Entries/EntriesMonth/EntriesMonth.tsx';
import { EntriesSkeleton } from '@components/Entries/EntriesSkeleton/EntriesSkeleton.tsx';
import { EntriesState } from '@components/Entries/EntriesState/EntriesState.tsx';
import { toaster } from '@components/ui/toaster.tsx';
import { useDashboardData } from '@hooks/useDashboard/useDashboard.ts';
import { useDashboardUI } from '@hooks/useDashboardUI/useDashboardUI.ts';
import { useEntriesFilters } from '@hooks/useEntriesFilters/useEntriesFilters.ts';
import { type Entry } from '@services/entriesService/entries.service.types.ts';

export const Entries = () => {
  const { entries, entriesError, refetchEntries, deleteEntry, createEntry } =
    useDashboardData();

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

  // Delete right away and offer an undo, which creates the entry again
  const handleDelete = async (entry: Entry) => {
    await deleteEntry(entry.id);

    toaster.create({
      title: 'Entry deleted',
      description: `${formatMinutes(entry.minutes)} · ${formatEntryDate(entry.date)}`,
      duration: UNDO_DURATION_MS,
      closable: true,
      action: {
        label: 'Undo',
        onClick: () => {
          void createEntry({
            type: entry.type,
            date: entry.date,
            minutes: entry.minutes,
            note: entry.note,
          });
        },
      },
    });
  };

  // No data yet and no error: still loading (or waiting for the session)
  if (!entries && !entriesError) {
    return <EntriesSkeleton />;
  }

  const actions = <EntriesCsvActions />;
  const help = <EntriesCsvHelp />;

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
      <EntriesList toolbar={toolbar} actions={actions} help={help}>
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
      <EntriesList toolbar={toolbar} actions={actions} help={help}>
        {hasActiveFilters ? (
          <EntriesState variant="noMatch" onAction={clearFilters} />
        ) : (
          <EntriesState variant="empty" onAction={openCreateEntryModal} />
        )}
      </EntriesList>
    );
  }

  return (
    <EntriesList toolbar={toolbar} actions={actions} help={help}>
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
                  onDelete={() => handleDelete(entry)}
                  date={entry.date}
                />
              </EntriesCard.Content>

              <EntriesCard.Note note={entry.note ?? ''} />
            </EntriesCard>
          ))}
        </EntriesMonth>
      ))}
    </EntriesList>
  );
};
