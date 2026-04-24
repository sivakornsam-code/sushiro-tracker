import { PlateType } from './lib/types';

export const PLATES: PlateType[] = [
  { price: 30, color: 'white', label: 'White', icon: '⚪', bgClass: 'bg-white border-gray-200', textClass: 'text-gray-800' },
  { price: 40, color: 'red', label: 'Red', icon: '🔴', bgClass: 'bg-red-500 border-red-600', textClass: 'text-white' },
  { price: 60, color: 'silver', label: 'Silver', icon: '⚪', bgClass: 'bg-slate-300 border-slate-400 shadow-inner', textClass: 'text-slate-800' },
  { price: 80, color: 'gold', label: 'Gold', icon: '🟡', bgClass: 'bg-yellow-400 border-yellow-500 shadow-inner', textClass: 'text-yellow-900' },
  { price: 100, color: 'black', label: 'Black', icon: '⚫', bgClass: 'bg-gray-900 border-black', textClass: 'text-gray-100' },
];

export const PREDEFINED_USERS = ['Fon', 'Kong', 'Oat', 'Whai', 'Pim', 'Oui', 'Cinn'];

export const MILESTONES = [
  { value: 200, message: "You're getting started 🍣" },
  { value: 500, message: "Halfway there… strong performance 💪" },
  { value: 800, message: "This is getting serious 😳" },
  { value: 900, message: "Almost there… one more push 🔥" },
  { value: 1000, message: "🎉 1000 BAHT CLUB 🎉", celebration: true },
];
