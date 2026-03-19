// Date helper functions for history management

export const dateKey = (d: Date = new Date()): string => {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
};

export const weekKey = (d: Date = new Date()): string => {
  const start = new Date(d);
  start.setDate(start.getDate() - start.getDay());
  return 'w' + start.toISOString().slice(0, 10);
};

export const monthKey = (d: Date = new Date()): string => {
  return d.toISOString().slice(0, 7); // YYYY-MM
};

export const yearKey = (d: Date = new Date()): string => {
  return d.getFullYear().toString();
};

export const formatDate = (dateString: string, locale: string = 'en'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getWeekRange = (weekKey: string): string => {
  const dateStr = weekKey.replace('w', '');
  const start = new Date(dateStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('en', { month: 'short' })}`;
};
