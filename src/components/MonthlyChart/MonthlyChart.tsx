import { Skeleton } from '@chakra-ui/react';
import { formatMinutes } from '@components/Entries/Entries.helpers.ts';
import { useDashboardData } from '@hooks/useDashboard/useDashboard.ts';
import { buildMonthlySeries, getAxisMaxHours } from './MonthlyChart.helpers.ts';
import styles from './MonthlyChart.module.css';

const BAR_VIEWBOX = 100;

export const MonthlyChart = () => {
  const { allEntries, allEntriesError } = useDashboardData();

  if (allEntriesError) return null;

  if (!allEntries) {
    return (
      <div className={styles.chart} data-testid="monthly-chart-loading">
        <Skeleton height="20px" width="160px" />
        <Skeleton height="180px" />
      </div>
    );
  }

  const series = buildMonthlySeries(allEntries, new Date());
  const hasFlights = series.some((point) => point.total > 0);
  const axisMaxHours = getAxisMaxHours(series);
  const axisMaxMinutes = axisMaxHours * 60;
  const ticks = [axisMaxHours, axisMaxHours / 2, 0];

  return (
    <section
      className={styles.chart}
      aria-labelledby="monthly-chart-title"
      data-testid="monthly-chart"
    >
      <div className={styles.header}>
        <h2 id="monthly-chart-title" className={styles.title}>
          Hours per month
        </h2>
        <ul className={styles.legend} aria-label="Legend">
          <li className={styles.legendIndividual}>1-on-1</li>
          <li className={styles.legendShared}>Group</li>
        </ul>
      </div>

      {!hasFlights ? (
        <p className={styles.empty}>No flights in the last 12 months.</p>
      ) : (
        <div className={styles.plot}>
          <div className={styles.yAxis} aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick}>{tick} h</span>
            ))}
          </div>

          <div className={styles.columnsArea}>
            <div className={styles.grid} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <ul
              className={styles.columns}
              aria-label="Hours per month, by month"
            >
              {series.map((point) => {
                const individualHeight =
                  (point.individual / axisMaxMinutes) * BAR_VIEWBOX;
                const sharedHeight =
                  (point.shared / axisMaxMinutes) * BAR_VIEWBOX;

                return (
                  <li key={point.key} className={styles.column}>
                    <div
                      className={styles.barArea}
                      role="img"
                      aria-label={`${point.fullLabel}: ${formatMinutes(point.total)} (1-on-1 ${formatMinutes(point.individual)}, group ${formatMinutes(point.shared)})`}
                    >
                      <svg
                        className={styles.bar}
                        viewBox={`0 0 ${BAR_VIEWBOX} ${BAR_VIEWBOX}`}
                        preserveAspectRatio="none"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <rect
                          className={styles.shared}
                          x="0"
                          y={BAR_VIEWBOX - individualHeight - sharedHeight}
                          width={BAR_VIEWBOX}
                          height={sharedHeight}
                        />
                        <rect
                          className={styles.individual}
                          x="0"
                          y={BAR_VIEWBOX - individualHeight}
                          width={BAR_VIEWBOX}
                          height={individualHeight}
                        />
                      </svg>

                      <div className={styles.tooltip} aria-hidden="true">
                        <b>{point.fullLabel}</b>
                        <span>Total {formatMinutes(point.total)}</span>
                        <span>1-on-1 {formatMinutes(point.individual)}</span>
                        <span>Group {formatMinutes(point.shared)}</span>
                      </div>
                    </div>

                    <span className={styles.label} aria-hidden="true">
                      {point.label}
                      {point.year && (
                        <small className={styles.year}>{point.year}</small>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
};
