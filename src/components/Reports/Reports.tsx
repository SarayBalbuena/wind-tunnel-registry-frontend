import {
  formatMonthTrend,
  getMonthMinutes,
} from '@components/MonthlyChart/MonthlyChart.helpers.ts';
import { ReportsCard } from '@components/Reports/ReportsCard/ReportsCard.tsx';
import { ReportsError } from '@components/Reports/ReportsError/ReportsError.tsx';
import { ReportsLoading } from '@components/Reports/ReportsLoading/ReportsLoading.tsx';
import { useDashboardData } from '@hooks/useDashboard/useDashboard';
import { useEntriesFilters } from '@hooks/useEntriesFilters/useEntriesFilters.ts';
import styles from './Reports.module.css';

export const Reports = () => {
  const { reports, isReportsLoading, reportsError, allEntries } =
    useDashboardData();
  const { dateFilter } = useEntriesFilters();

  if (isReportsLoading) return <ReportsLoading />;

  if (reportsError) return <ReportsError />;

  // The trend is a month-to-date figure: hide it when the cards show one day
  const monthMinutes =
    allEntries && !dateFilter ? getMonthMinutes(allEntries, new Date()) : null;

  return (
    <div className={styles.reportsContainer}>
      {reports?.cards?.map((card) => (
        <ReportsCard
          key={card.label}
          {...card}
          trend={
            monthMinutes ? formatMonthTrend(monthMinutes[card.type]) : undefined
          }
        />
      ))}
    </div>
  );
};
