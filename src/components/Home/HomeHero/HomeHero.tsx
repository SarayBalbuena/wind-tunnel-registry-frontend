import { Button } from '@chakra-ui/react';
import { DashboardButton } from '@components/DashboardButton/DashboardButton.tsx';
import { HomePreview } from '@components/Home/HomePreview/HomePreview.tsx';
import { LoginButton } from '@components/LoginButton/LoginButton.tsx';
import { useDashboardData } from '@hooks/useDashboard/useDashboard.ts';
import { useDashboardUI } from '@hooks/useDashboardUI/useDashboardUI.ts';
import { getClassNames } from '@services/utils/getClassNames.ts';
import { LuPlus } from 'react-icons/lu';
import styles from './HomeHero.module.css';
import { type HomeHeroProps } from './HomeHero.types.ts';

const Totals = () => {
  const { reports } = useDashboardData();

  if (!reports?.cards?.length) return null;

  return (
    <div className={styles.totals} data-testid="home-totals">
      {reports.cards.map((card) => (
        <div
          key={card.label}
          className={getClassNames({
            [styles.chip]: true,
            [styles[card.type]]: true,
          })}
        >
          <small>{card.label}</small>
          <b>
            {card.timeParts
              .map((part) => `${part.value} ${part.unit}`)
              .join(' ')}
          </b>
        </div>
      ))}
    </div>
  );
};

export const HomeHero = ({ isAuthenticated, loading }: HomeHeroProps) => {
  const { openCreateEntryModal } = useDashboardUI();

  return (
    <section className={styles.hero}>
      <svg
        className={styles.air}
        viewBox="0 0 1200 640"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M-20 120 C 260 60, 420 220, 700 150 S 1100 60, 1240 140" />
        <path d="M-20 260 C 220 330, 460 160, 720 270 S 1060 360, 1240 250" />
        <path d="M-20 420 C 300 360, 520 520, 800 430 S 1100 380, 1240 470" />
        <path d="M-20 540 C 260 600, 500 470, 760 560 S 1080 620, 1240 540" />
      </svg>

      <div className={styles.copy}>
        <span className={styles.eyebrow}>
          <i />
          Built for skydivers
        </span>
        <h1 className={styles.headline}>
          Every minute in the tunnel, <em>logged.</em>
        </h1>
        <p className={styles.lead}>
          Track your wind tunnel flight time, add individual sessions, shared
          sessions and stay updated on your progress.
        </p>

        {loading && <Button loading />}

        {!loading && isAuthenticated && (
          <>
            <Totals />
            <div className={styles.cta}>
              <DashboardButton />
              <Button
                variant="outline"
                size="lg"
                rounded="md"
                onClick={openCreateEntryModal}
              >
                <LuPlus /> New entry
              </Button>
            </div>
          </>
        )}

        {!loading && !isAuthenticated && (
          <>
            <div className={styles.cta}>
              <LoginButton />
            </div>
            <p className={styles.fine}>
              Free to use. Sign in with Google, no password to remember.
            </p>
          </>
        )}
      </div>

      <HomePreview />
    </section>
  );
};
