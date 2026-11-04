export interface ReportsCardProps {
  label: string;
  description?: string;
  value: number;
  type?: 'individual' | 'shared' | 'total';
  timeParts: { value: number; unit: string }[];
  /** e.g. "+45 min this month" */
  trend?: string;
}
