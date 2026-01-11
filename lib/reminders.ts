import { SAVING_CHALLENGE_DATA } from '@/lib/constants';

const WEEK_IN_MS = 1000 * 60 * 60 * 24 * 7;
const MIN_WEEK = 1;
const MAX_WEEK = SAVING_CHALLENGE_DATA.length;

export const REMINDER_DAYS = [5, 6, 0] as const; // Fri, Sat, Sun
const reminderSet = new Set(REMINDER_DAYS);

const clampWeekNumber = (week: number) =>
  Math.min(Math.max(week, MIN_WEEK), MAX_WEEK);

export const getCurrentWeekNumber = (date: Date) => {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  return clampWeekNumber(Math.floor(diff / WEEK_IN_MS) + 1);
};

export const getDateKey = (date: Date) => {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const isReminderDay = (date: Date) => reminderSet.has(date.getDay() as 0 | 5 | 6);

export const isSameDay = (first: Date, second: Date) =>
  getDateKey(first) === getDateKey(second);
