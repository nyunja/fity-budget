import React, { createContext, useContext, useMemo, useState } from 'react';

export type Period = 'day' | 'week' | 'month' | 'year';

interface PeriodContextValue {
  period: Period;
  setPeriod: (period: Period) => void;
  startDate: string;
  endDate: string;
}

const PeriodContext = createContext<PeriodContextValue | undefined>(undefined);

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const computeRange = (period: Period): { startDate: string; endDate: string } => {
  const now = new Date();

  switch (period) {
    case 'day': {
      const iso = toISODate(now);
      return { startDate: iso, endDate: iso };
    }
    case 'week': {
      const start = new Date(now);
      const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
      start.setDate(now.getDate() - dayOfWeek);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
    case 'year':
      return {
        startDate: `${now.getFullYear()}-01-01`,
        endDate: `${now.getFullYear()}-12-31`,
      };
    case 'month':
    default: {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { startDate: toISODate(start), endDate: toISODate(end) };
    }
  }
};

export const PeriodProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [period, setPeriod] = useState<Period>('month');

  const value = useMemo(
    () => ({ period, setPeriod, ...computeRange(period) }),
    [period]
  );

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
};

export const usePeriod = (): PeriodContextValue => {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error('usePeriod must be used within a PeriodProvider');
  }
  return context;
};
