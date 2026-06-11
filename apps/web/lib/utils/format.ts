import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number | string): string {
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
}

export function formatBloodGroup(bg: string): string {
  return bg.replace('_POS', '+').replace('_NEG', '-');
}

export function formatShift(shift: string): string {
  const map: Record<string, string> = {
    MORNING: 'Morning (6AM–2PM)',
    AFTERNOON: 'Afternoon (2PM–10PM)',
    EVENING: 'Evening (4PM–12AM)',
    NIGHT: 'Night (10PM–6AM)',
    FULL_DAY: 'Full Day',
  };
  return map[shift] ?? shift;
}
