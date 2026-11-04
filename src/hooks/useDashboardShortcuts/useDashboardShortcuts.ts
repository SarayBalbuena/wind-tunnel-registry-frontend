import { useEffect } from 'react';
import { useAuth } from '@hooks/useAuth/useAuth.ts';
import { useDashboardUI } from '@hooks/useDashboardUI/useDashboardUI.ts';

/** `id` of the flight log search input, focused by the `/` shortcut. */
export const ENTRIES_SEARCH_ID = 'entries-search';

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    // Menus and dialogs handle their own keys (typeahead, focus trap)
    target.closest('[role="menu"], [role="dialog"]') !== null
  );
};

/**
 * Global dashboard shortcuts: `N` opens the new entry form and `/` focuses the
 * note search. They do nothing while the user is typing or a dialog is open.
 */
export const useDashboardShortcuts = () => {
  const { isAuthenticated } = useAuth();
  const { isEntryFormOpen, openCreateEntryModal } = useDashboardUI();

  useEffect(() => {
    if (!isAuthenticated) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEntryFormOpen || isTypingTarget(event.target)) return;

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        openCreateEntryModal();
      }

      if (event.key === '/') {
        const search = document.getElementById(ENTRIES_SEARCH_ID);
        if (!search) return;

        event.preventDefault();
        search.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isAuthenticated, isEntryFormOpen, openCreateEntryModal]);
};
