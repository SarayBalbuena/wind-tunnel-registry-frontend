import { getMappedReportsData } from '@services/reportsService/utils/reports.utils.ts';
import { apiFetch } from '@services/utils/apiFetch';
import {
  type FlightDetailsResponse,
  type MappedFlightDetailsResponse,
} from './reports.service.types.ts';

export const getFlightDetails = async (
  date?: string,
): Promise<MappedFlightDetailsResponse> => {
  const path = date
    ? `/reports/total-by-type?date=${encodeURIComponent(date)}`
    : '/reports/total-by-type';
  const response: FlightDetailsResponse = await apiFetch(path);

  return {
    ...response,
    ...getMappedReportsData(response.totalMinutes, response.flightDetails),
  };
};
