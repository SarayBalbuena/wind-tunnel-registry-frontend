import { type IconType } from 'react-icons';

export interface Feature {
  title: string;
  description: string;
  icon: IconType;
  type: 'individual' | 'shared' | 'total';
}

export interface Step {
  title: string;
  description: string;
}
