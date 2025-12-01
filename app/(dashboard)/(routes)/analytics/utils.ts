// app/(dashboard)/(routes)/analytics/utils.ts

export type DateRangeKey = '24hrs' | 'today' | 'last_week' | '30_days' | 'last_month' | '6_months' | 'last_year';

export const calculateDateRange = (key: DateRangeKey): { startDate: string; endDate: string } => {
  const now = new Date();
  const startDate = new Date();

  switch (key) {
    case '24hrs':
      startDate.setTime(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'last_week':
      startDate.setTime(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'last_month':
    case '30_days':
      startDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '6_months':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case 'last_year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setTime(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString(),
  };
};