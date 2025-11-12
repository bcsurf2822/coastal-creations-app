export interface DayHours {
  open: string;
  close: string;
}

export interface DaySchedule {
  isClosed: boolean;
  hours?: DayHours;
}

export interface HoursOfOperation {
  _id?: string;
  _type?: string;
  _createdAt?: string;
  _updatedAt?: string;
  _rev?: string;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

// Generate time options from 7:00 AM to 10:00 PM
export const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  const hours = ["7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
  const minutes = ["00", "30"];
  const periods = ["AM", "PM"];

  hours.forEach((hour, index) => {
    const period = index < 5 ? periods[0] : periods[1];
    minutes.forEach((minute) => {
      options.push(`${hour}:${minute} ${period}`);
    });
  });

  return options;
};
