import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

export const formatBrazilianTime = (date: Date | string, formatString: string = 'dd/MM/yyyy HH:mm:ss') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const zonedDate = toZonedTime(dateObj, BRAZIL_TIMEZONE);
  return format(zonedDate, formatString);
};

export const formatBrazilianDateTime = (date: Date | string) => {
  return formatBrazilianTime(date, 'dd/MM/yyyy HH:mm');
};

export const formatBrazilianDate = (date: Date | string) => {
  return formatBrazilianTime(date, 'dd/MM/yyyy');
};

export const formatBrazilianTimeOnly = (date: Date | string) => {
  return formatBrazilianTime(date, 'HH:mm:ss');
};

export const getCurrentBrazilianTime = () => {
  const now = new Date();
  return toZonedTime(now, BRAZIL_TIMEZONE);
};

export const getCurrentBrazilianTimeString = (formatString?: string) => {
  const now = getCurrentBrazilianTime();
  return formatBrazilianTime(now, formatString);
};