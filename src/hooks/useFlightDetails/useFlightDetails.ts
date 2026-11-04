import { useAuth } from '@hooks/useAuth/useAuth.ts';
import { getFlightDetails } from '@services/reportsService/reports.service.ts';
import useSWR from 'swr';

export const FLIGHT_DETAILS_KEY = 'flight-details';

/** Matches every cached reports query, whatever its date. */
export const isFlightDetailsKey = (key: unknown) =>
  Array.isArray(key) && key[0] === FLIGHT_DETAILS_KEY;

export const useFlightDetails = (date?: string) => {
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error, mutate } = useSWR(
    isAuthenticated ? ([FLIGHT_DETAILS_KEY, date ?? ''] as const) : null,
    ([, keyDate]) => getFlightDetails(keyDate || undefined),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    },
  );

  return {
    data,
    isLoading,
    error,
    mutateReports: mutate,
  };
};
