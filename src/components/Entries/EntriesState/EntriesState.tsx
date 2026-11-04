import { Button } from '@chakra-ui/react';
import { getClassNames } from '@services/utils/getClassNames.ts';
import { LuPlus } from 'react-icons/lu';
import styles from './EntriesState.module.css';
import {
  type EntriesStateProps,
  type EntriesStateVariant,
} from './EntriesState.types.ts';

const CONTENT: Record<
  EntriesStateVariant,
  { title: string; text: string; action: string }
> = {
  empty: {
    title: 'No flights registered yet.',
    text: 'Log your first session and your totals will start to fill in.',
    action: 'Log your first flight',
  },
  noMatch: {
    title: 'No flights found',
    text: 'Nothing matches the current filters.',
    action: 'Show all flights',
  },
  error: {
    title: 'Error loading entries',
    text: 'Check your connection and try again.',
    action: 'Try again',
  },
};

export const EntriesState = ({ variant, onAction }: EntriesStateProps) => {
  const content = CONTENT[variant];

  return (
    <div
      className={getClassNames({
        [styles.state]: true,
        [styles.error]: variant === 'error',
      })}
      role={variant === 'error' ? 'alert' : undefined}
    >
      <svg
        className={styles.art}
        viewBox="0 0 88 64"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M2 14 C 24 4, 40 24, 60 14 S 80 10, 86 16" />
        <path d="M2 32 C 22 44, 44 20, 64 32 S 80 40, 86 30" />
        <path d="M2 50 C 26 42, 40 58, 62 48 S 80 46, 86 52" />
      </svg>
      <h3 className={styles.title}>{content.title}</h3>
      <p className={styles.text}>{content.text}</p>
      <Button
        size="sm"
        colorPalette={variant === 'error' ? 'red' : 'blue'}
        variant={variant === 'noMatch' ? 'outline' : 'solid'}
        onClick={onAction}
      >
        {variant === 'empty' && <LuPlus />}
        {content.action}
      </Button>
    </div>
  );
};
