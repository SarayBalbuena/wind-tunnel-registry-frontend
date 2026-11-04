import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Button, Link as ChakraLink, Heading, Icon } from '@chakra-ui/react';
import { EntryFormDialog } from '@components/Entries/EntryFormDialog/EntryFormDialog.tsx';
import { UserMenu } from '@components/UserMenu/UserMenu.tsx';
import { ColorModeButton } from '@components/ui/color-mode';
import { Toaster } from '@components/ui/toaster';
import { useAuth } from '@hooks/useAuth/useAuth.ts';
import { useDashboardData } from '@hooks/useDashboard/useDashboard.ts';
import { useDashboardShortcuts } from '@hooks/useDashboardShortcuts/useDashboardShortcuts.ts';
import { useDashboardUI } from '@hooks/useDashboardUI/useDashboardUI.ts';
import {
  type CreateEntryPayload,
  type UpdateEntryPayload,
} from '@services/entriesService/entries.service.types.ts';
import { LuPlus } from 'react-icons/lu';
import styles from './Layout.module.css';

export const Layout = () => {
  const { isAuthenticated } = useAuth();
  const { createEntry, updateEntry, isCreatingEntry, isUpdatingEntry } =
    useDashboardData();

  const {
    isEntryFormOpen,
    entryFormMode,
    selectedEntry,
    openCreateEntryModal,
    closeEntryFormModal,
  } = useDashboardUI();

  useDashboardShortcuts();

  const handleSubmit = async (
    payload: CreateEntryPayload | UpdateEntryPayload,
  ) => {
    if (entryFormMode === 'create') {
      await createEntry(payload as CreateEntryPayload);
      closeEntryFormModal();
      return;
    }

    if (!selectedEntry) return;

    await updateEntry({
      id: selectedEntry.id,
      payload: payload as UpdateEntryPayload,
    });
    closeEntryFormModal();
  };

  return (
    <div className={styles.layoutContainer}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <ChakraLink asChild variant="plain">
            <RouterLink to="/">
              <Heading size={{ base: 'xs', md: 'sm' }}>
                Wind Tunnel Logbook
              </Heading>
            </RouterLink>
          </ChakraLink>

          <div className={styles.navRight}>
            {isAuthenticated && (
              <Button
                colorPalette="blue"
                onClick={openCreateEntryModal}
                size="xs"
                px={{ base: 2, sm: 2.5 }}
                minW={{ base: '30px', sm: 'auto' }}
                h={{ base: '28px', md: '30px' }}
                aria-label="Create new entry"
                aria-keyshortcuts="N"
              >
                <Icon as={LuPlus} boxSize={{ base: 3.5, md: 4 }} />
                <span className={styles.createButtonText}>New entry</span>
                <kbd className={styles.shortcutHint}>N</kbd>
              </Button>
            )}

            {isAuthenticated ? <UserMenu /> : <ColorModeButton />}
          </div>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        <Outlet />
      </main>

      <Toaster />

      <EntryFormDialog
        open={isEntryFormOpen}
        mode={entryFormMode}
        entry={selectedEntry}
        onOpenChange={(details) => {
          if (!details.open) closeEntryFormModal();
        }}
        onSubmit={handleSubmit}
        isLoading={isCreatingEntry || isUpdatingEntry}
      />
    </div>
  );
};
