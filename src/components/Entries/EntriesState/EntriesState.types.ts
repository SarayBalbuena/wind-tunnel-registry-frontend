export type EntriesStateVariant = 'empty' | 'noMatch' | 'error';

export interface EntriesStateProps {
  variant: EntriesStateVariant;
  onAction: () => void;
}
