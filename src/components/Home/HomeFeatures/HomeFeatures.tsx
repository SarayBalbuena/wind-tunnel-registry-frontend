import { Icon } from '@chakra-ui/react';
import { getClassNames } from '@services/utils/getClassNames.ts';
import { LuClock, LuPencil, LuPlus } from 'react-icons/lu';
import styles from './HomeFeatures.module.css';
import { type Feature, type Step } from './HomeFeatures.types.ts';

const FEATURES: Feature[] = [
  {
    title: 'Log sessions',
    description:
      'Record 1-on-1 or group flights with a date, the minutes flown and an optional note.',
    icon: LuPlus,
    type: 'individual',
  },
  {
    title: 'See your totals',
    description:
      'Total, 1-on-1 and group time, always up to date as you add entries.',
    icon: LuClock,
    type: 'total',
  },
  {
    title: 'Fix mistakes anytime',
    description:
      'Edit or delete any past entry, and your totals update right away.',
    icon: LuPencil,
    type: 'shared',
  },
];

const STEPS: Step[] = [
  { title: 'Sign in', description: 'Use your Google account.' },
  { title: 'Add a flight', description: 'Pick the type, date and minutes.' },
  {
    title: 'Watch it grow',
    description: 'Your totals and flight log update.',
  },
];

export const HomeFeatures = () => (
  <>
    <section className={styles.section} aria-labelledby="home-features-title">
      <h2 id="home-features-title" className={styles.title}>
        Everything you need to track your time
      </h2>
      <p className={styles.subtitle}>
        Add a flight in seconds and see exactly how much time you have in the
        tunnel.
      </p>
      <div className={styles.tiles}>
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className={getClassNames({
              [styles.tile]: true,
              [styles[feature.type]]: true,
            })}
          >
            <div className={styles.iconChip}>
              <Icon as={feature.icon} boxSize="5" />
            </div>
            <h3 className={styles.tileTitle}>{feature.title}</h3>
            <p className={styles.tileText}>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>

    <section className={styles.section} aria-labelledby="home-steps-title">
      <h2 id="home-steps-title" className={styles.title}>
        How it works
      </h2>
      <p className={styles.subtitle}>Three steps, and you are set.</p>
      <ol className={styles.steps}>
        {STEPS.map((step) => (
          <li key={step.title} className={styles.step}>
            <div>
              <b>{step.title}</b>
              <span>{step.description}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  </>
);
