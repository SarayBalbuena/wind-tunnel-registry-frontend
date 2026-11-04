export interface MonthlyPoint {
  /** "2026-03" */
  key: string;
  /** "Mar" */
  label: string;
  /** "March 2026" */
  fullLabel: string;
  /** Year to show under the label (first column and every January) */
  year?: number;
  individual: number;
  shared: number;
  total: number;
}

export interface MonthMinutes {
  total: number;
  individual: number;
  shared: number;
}
