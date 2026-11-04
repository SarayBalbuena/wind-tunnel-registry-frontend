import { Entries } from '@components/Entries/Entries';
import { MonthlyChart } from '@components/MonthlyChart/MonthlyChart';
import { Reports } from '@components/Reports/Reports';

export const Dashboard = () => {
  return (
    <div data-testid="dashboard-page">
      <Reports />
      <MonthlyChart />
      <Entries />
    </div>
  );
};
