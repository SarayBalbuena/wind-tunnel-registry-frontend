export interface PreviewCard {
  type: 'total' | 'individual' | 'shared';
  label: string;
  hours: number;
  minutes: number;
}

export interface PreviewEntry {
  type: 'individual' | 'shared';
  label: string;
  duration: string;
}
