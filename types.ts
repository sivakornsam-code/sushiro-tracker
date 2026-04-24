import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  totalSpend: number;
  plateCounts: Record<string, number>;
  milestonesTriggered: number[];
  updatedAt?: Timestamp;
}

export interface PlateType {
  price: number;
  color: string;
  label: string;
  icon: string;
  bgClass: string;
  textClass: string;
}
