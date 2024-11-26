export function formatDate (date: Date): string {
  return date.toLocaleTimeString([], { hour12: false });
};

export function getDuration(date1: Date, date2: Date): number {
  return date1.getTime() - date2.getTime();
};
