export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const HOURS = Array.from({ length: 11 }, (_, index) => index + 8);
export const CALENDAR_COLUMNS = "64px repeat(7, minmax(104px, 1fr))";

export const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export const getTodayDate = (value: Date = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getMonday = (value: Date) => {
  const date = new Date(value);
  const day = date.getDay();
  date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
};

export const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatTime = (value: Date | string) =>
  new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

export const isCancelled = (status: string) =>
  status.toLowerCase() === "cancelled";
