import React, { ReactElement } from "react";
import { Dayjs } from "dayjs";

export const useTimeOptions = () => {
  const generateTimeOptions = (
    isEndTime = false,
    selectedStartTime?: string | Dayjs | null
  ): ReactElement[] => {
    const options: ReactElement[] = [];

    if (isEndTime && selectedStartTime) {
      let startTimeHour: number;
      let startTimeMinute: number;

      if (typeof selectedStartTime === "string") {
        const [startHourStr, startMinuteStr] = selectedStartTime.split(":");
        startTimeHour = parseInt(startHourStr);
        startTimeMinute = parseInt(startMinuteStr);
      } else if (selectedStartTime && typeof selectedStartTime === "object") {
        startTimeHour = selectedStartTime.hour();
        startTimeMinute = selectedStartTime.minute();
      } else {
        startTimeHour = 8;
        startTimeMinute = 0;
      }

      let minEndTimeHour = startTimeHour;
      let minEndTimeMinute = startTimeMinute + 30;

      if (minEndTimeMinute >= 60) {
        minEndTimeHour += 1;
        minEndTimeMinute = 0;
      }

      for (let hour = minEndTimeHour; hour <= 24; hour++) {
        for (const minute of [0, 30]) {
          if (hour === 24 && minute > 0) continue;
          if (hour === minEndTimeHour && minute < minEndTimeMinute) continue;

          const time = new Date();
          const displayHour = hour === 24 ? 0 : hour;
          time.setHours(displayHour, minute, 0);

          const timeStr = `${displayHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          const formattedTime = time.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });

          const optionElement = React.createElement(
            "option",
            { key: timeStr, value: timeStr },
            formattedTime
          );
          options.push(optionElement);
        }
      }
    } else {
      for (let hour = 8; hour <= 24; hour++) {
        for (const minute of [0, 30]) {
          if (hour === 24 && minute > 0) continue;

          const time = new Date();
          const displayHour = hour === 24 ? 0 : hour;
          time.setHours(displayHour, minute, 0);

          const timeStr = `${displayHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
          const formattedTime = time.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          });

          const optionElement = React.createElement(
            "option",
            { key: timeStr, value: timeStr },
            formattedTime
          );
          options.push(optionElement);
        }
      }
    }
    return options;
  };

  return { generateTimeOptions };
};