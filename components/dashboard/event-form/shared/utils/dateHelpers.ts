import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const LOCAL_TIMEZONE = "America/New_York";

export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  const date = dayjs.tz(dateString, LOCAL_TIMEZONE);
  return date.format("YYYY-MM-DD");
};

export const prepareDateForSubmit = (dateString: string): Date | null => {
  if (!dateString) return null;
  // Parse the date string in the local timezone at start of day
  return dayjs.tz(dateString, LOCAL_TIMEZONE).startOf("day").toDate();
};

export const prepareDateForSubmitAsISO = (dateString: string): string => {
  if (!dateString) return "";
  // Parse the date string in the local timezone at start of day
  return dayjs.tz(dateString, LOCAL_TIMEZONE).startOf("day").toISOString();
};