import type { Transaction } from '@/types';

export interface DailySummary {
  income: number;
  expense: number;
  net: number;
}

export interface WeeklySummary extends DailySummary {
  startDate: string;
  endDate: string;
}

function sameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** 计算指定日期的今日收支 */
export function getDailySummary(transactions: Transaction[], date: string): DailySummary {
  const target = new Date(date);
  return transactions.reduce(
    (acc, tx) => {
      const txDate = new Date(tx.date);
      if (!sameDay(txDate, target)) return acc;
      if (tx.type === 'income') acc.income += tx.amount;
      else acc.expense += Math.abs(tx.amount);
      return acc;
    },
    { income: 0, expense: 0, net: 0 }
  );
}

/** 计算本周一至今的累计收支（包含 today） */
export function getWeeklySummary(transactions: Transaction[], today: string): WeeklySummary {
  const todayDate = new Date(today);
  const day = todayDate.getDay(); // 0=周日,1=周一...
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(todayDate);
  monday.setDate(todayDate.getDate() + mondayOffset);

  const summary = transactions.reduce(
    (acc, tx) => {
      const txDate = new Date(tx.date);
      if (txDate < monday || txDate > todayDate) return acc;
      if (tx.type === 'income') acc.income += tx.amount;
      else acc.expense += Math.abs(tx.amount);
      return acc;
    },
    { income: 0, expense: 0, net: 0 }
  );

  return {
    ...summary,
    net: summary.income - summary.expense,
    startDate: toISODate(monday),
    endDate: today,
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('ja-JP');
}
