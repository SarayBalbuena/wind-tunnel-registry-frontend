import { act } from '@testing-library/react';
import { renderHook } from '@tests/testing.tsx';
import { describe, expect, it } from 'vitest';
import { useEntriesFilters } from './useEntriesFilters.ts';

describe('useEntriesFilters', () => {
  describe('when the URL has no filters', () => {
    it('should return the defaults', () => {
      const { result } = renderHook(() => useEntriesFilters());

      expect(result.current).toMatchObject({
        typeFilter: 'ALL',
        dateFilter: '',
        search: '',
        sort: 'newest',
        hasActiveFilters: false,
      });
    });
  });

  describe('when the URL has filters', () => {
    it('should read them', () => {
      const { result } = renderHook(() => useEntriesFilters(), {
        route: '/dashboard?type=SHARED&date=2026-03-09&q=sit&sort=oldest',
      });

      expect(result.current).toMatchObject({
        typeFilter: 'SHARED',
        dateFilter: '2026-03-09',
        search: 'sit',
        sort: 'oldest',
        hasActiveFilters: true,
      });
    });

    it('should fall back to the defaults for invalid values', () => {
      const { result } = renderHook(() => useEntriesFilters(), {
        route: '/dashboard?type=NOPE&date=yesterday&sort=random',
      });

      expect(result.current).toMatchObject({
        typeFilter: 'ALL',
        dateFilter: '',
        sort: 'newest',
        hasActiveFilters: false,
      });
    });
  });

  describe('when changing the filters', () => {
    it('should update the values and clear them again', () => {
      const { result } = renderHook(() => useEntriesFilters());

      act(() => result.current.setTypeFilter('INDIVIDUAL'));
      act(() => result.current.setDateFilter('2026-03-09'));
      act(() => result.current.setSearch('sit'));
      act(() => result.current.setSort('longest'));

      expect(result.current).toMatchObject({
        typeFilter: 'INDIVIDUAL',
        dateFilter: '2026-03-09',
        search: 'sit',
        sort: 'longest',
      });

      act(() => result.current.clearFilters());

      expect(result.current).toMatchObject({
        typeFilter: 'ALL',
        dateFilter: '',
        search: '',
        sort: 'longest',
        hasActiveFilters: false,
      });
    });
  });
});
