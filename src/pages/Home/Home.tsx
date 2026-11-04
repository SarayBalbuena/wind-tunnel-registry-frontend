import { HomeFeatures } from '@components/Home/HomeFeatures/HomeFeatures.tsx';
import { HomeHero } from '@components/Home/HomeHero/HomeHero.tsx';
import { useAuth } from '@hooks/useAuth/useAuth.ts';
import styles from './Home.module.css';

export const Home = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className={styles.homeContainer}>
      <HomeHero isAuthenticated={isAuthenticated} loading={loading} />
      <HomeFeatures />
    </div>
  );
};
