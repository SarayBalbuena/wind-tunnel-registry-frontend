import React from 'react';
import { Badge, Flex, Icon, IconButton } from '@chakra-ui/react';
import { formatEntryDate } from '@components/Entries/Entries.helpers.ts';
import {
  type EntriesCardActionsProps,
  type EntriesCardContentProps,
  type EntriesCardDateProps,
  type EntriesCardHeaderProps,
  type EntriesCardMinutesProps,
  type EntriesCardNoteProps,
  type EntriesCardProps,
  type EntriesCardTypeProps,
} from '@components/Entries/EntriesCard/EntriesCard.types.ts';
import { getTimeParts } from '@services/reportsService/utils/reports.utils.ts';
import { getClassNames } from '@services/utils/getClassNames.ts';
import {
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineUser,
  HiOutlineUsers,
} from 'react-icons/hi2';
import styles from './EntriesCard.module.css';

export const EntriesCard = ({ children, className }: EntriesCardProps) => {
  const entriesContainerClasses = getClassNames({
    [styles.entriesCard]: true,
    [className ?? '']: !!className,
  });
  return <div className={entriesContainerClasses}>{children}</div>;
};

const Header = ({ children }: EntriesCardHeaderProps) => (
  <div className={styles.header}>{children}</div>
);

const EntryDate = ({ date }: EntriesCardDateProps) => (
  <time className={styles.date} dateTime={date}>
    {formatEntryDate(date)}
  </time>
);

const TYPE_CONFIG: Record<
  string,
  {
    icon: typeof HiOutlineUser;
    label: string;
    className: string;
  }
> = {
  INDIVIDUAL: {
    icon: HiOutlineUser,
    label: '1-on-1',
    className: styles.individualBadge,
  },
  DEFAULT: {
    icon: HiOutlineUsers,
    label: 'group',
    className: styles.sharedBadge,
  },
};

const Type = ({ type }: EntriesCardTypeProps) => {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.DEFAULT;

  return (
    <Badge
      className={config.className}
      aria-label={`Session type: ${config.label}`}
      display="flex"
      alignItems="center"
      gap="1"
      px="2"
      py="0.5"
      borderRadius="full"
    >
      <Icon as={config.icon} />
      {config.label}
    </Badge>
  );
};

const Content = ({ children }: EntriesCardContentProps) => (
  <div className={styles.content}>{children}</div>
);

const Minutes = ({ minutes }: EntriesCardMinutesProps) => {
  const timeParts = getTimeParts(minutes);
  return (
    <div className={styles.timeValues}>
      {timeParts.map((part) => (
        <React.Fragment key={`${part.value}-${part.unit}`}>
          <span className={styles.minutesValue}>{part.value}</span>
          <span className={styles.minutesUnit}>{part.unit}</span>
        </React.Fragment>
      ))}
    </div>
  );
};

const Note = ({ note }: EntriesCardNoteProps) => {
  if (!note) return null;
  return <p className={styles.note}>{note}</p>;
};

// Rounded tinted icon buttons that lift slightly on hover
const actionButtonStyles = {
  borderRadius: 'lg',
  transition: 'transform 150ms ease, background 150ms ease',
  _hover: { transform: 'translateY(-1px)' },
  _active: { transform: 'translateY(0)' },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
    _hover: { transform: 'none' },
  },
};

// Hidden until hover or keyboard focus on pointer devices (see the CSS module)
const Actions = ({ onEdit, onDelete, date }: EntriesCardActionsProps) => (
  <Flex gap="1" className={styles.actions}>
    <IconButton
      variant="subtle"
      colorPalette="blue"
      onClick={onEdit}
      aria-label={`Edit flight from ${date}`}
      size="sm"
      {...actionButtonStyles}
    >
      <HiOutlinePencil />
    </IconButton>
    <IconButton
      variant="subtle"
      colorPalette="red"
      onClick={onDelete}
      aria-label={`Delete flight from ${date}`}
      size="sm"
      {...actionButtonStyles}
    >
      <HiOutlineTrash />
    </IconButton>
  </Flex>
);

EntriesCard.Header = Header;
EntriesCard.Date = EntryDate;
EntriesCard.Type = Type;
EntriesCard.Content = Content;
EntriesCard.Minutes = Minutes;
EntriesCard.Note = Note;
EntriesCard.Actions = Actions;
