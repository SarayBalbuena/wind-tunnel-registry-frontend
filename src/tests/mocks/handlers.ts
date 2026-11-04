import { CHECK_SESSION_MOCK } from '@tests/mocks/checkSession/checkSessionMock.ts';
import { ENTRIES_MOCK } from '@tests/mocks/entries/entriesMock.ts';
import { LOGOUT_MOCK } from '@tests/mocks/logout/checkSessionMock.ts';
import { REPORTS_MOCK } from '@tests/mocks/reports/reportsMock.ts';
import { HttpResponse, http } from 'msw';

export const handlers = [
  http.get(`${API_URL}/auth/session`, () => {
    return HttpResponse.json(CHECK_SESSION_MOCK, { status: 200 });
  }),
  http.get(`${API_URL}/auth/logout`, () => {
    return HttpResponse.json(LOGOUT_MOCK, { status: 200 });
  }),
  http.get(`${API_URL}/reports/total-by-type`, () => {
    return HttpResponse.json(REPORTS_MOCK, { status: 200 });
  }),
  // Mirrors the backend: exact `type` and exact `date` filters
  http.get(`${API_URL}/entries`, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const type = params.get('type');
    const date = params.get('date');

    const entries = ENTRIES_MOCK.filter(
      (entry) =>
        (!type || entry.type === type) && (!date || entry.date === date),
    );

    return HttpResponse.json(entries, { status: 200 });
  }),
];
