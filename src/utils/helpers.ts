/* eslint-disable @typescript-eslint/no-explicit-any */

import type { DebouncedFunction, TReturnType } from "../types";

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 300
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };

  // Add a cancel method
  (debouncedFn as DebouncedFunction<T>).cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debouncedFn as DebouncedFunction<T>;
}

// picker common helpers

// Function to detect the return type from the original value
export const detectReturnType = (
  value: string | number | Date | null | undefined
): TReturnType => {
  if (value === null || value === undefined) return "time-string";

  if (typeof value === "number") {
    // Check if it's unix seconds (10 digits) or milliseconds (13 digits)
    return value.toString().length === 10
      ? "unix-seconds"
      : "unix-milliseconds";
  }

  if (value instanceof Date) {
    return "date-object";
  }

  if (typeof value === "string") {
    if (value.trim() === "") return "time-string";

    // Check for ISO string format
    if (value.includes("T") && value.includes("-")) {
      return "iso-string";
    }

    // Check for datetime string format (MM/DD/YYYY HH:MM:SS AM/PM)
    if (
      value.includes("/") &&
      (value.includes("AM") || value.includes("PM") || value.includes(":"))
    ) {
      return "datetime-string";
    }

    // Default to time-string for other string formats
    return "time-string";
  }

  return "time-string";
};

// Enhanced function to parse various time formats
export const parseTimeFromValue = (
  value: string | number | Date | null | undefined,
  showSeconds: boolean = false,
  is12HourFormat: boolean = true
): string => {
  if (value === null || value === undefined || value === "") return "";

  let date: Date;

  try {
    if (typeof value === "number") {
      const timestamp = value.toString().length === 10 ? value * 1000 : value;
      date = new Date(timestamp);
    } else if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      if (value.trim() === "") return "";

      // If it's in HH:mm[:ss][ AM|PM] format, parse manually instead of returning raw
      const timeOnlyRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?$/i;
      const match = value.trim().match(timeOnlyRegex);
      if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const seconds = match[3] ? parseInt(match[3], 10) : 0;
        let period = match[4] ? match[4].toUpperCase() : "";

        // If no AM/PM provided, assume 24h input and convert if needed
        if (!period) {
          if (is12HourFormat) {
            period = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            if (hours === 0) hours = 12;
          }
        } else {
          // Adjust hours if AM/PM is explicitly provided
          if (period === "PM" && hours < 12) hours += 12;
          if (period === "AM" && hours === 12) hours = 0;
        }

        // Reconstruct a Date (for consistency)
        date = new Date();
        date.setHours(hours, minutes, seconds, 0);
      } else {
        date = new Date(value);
      }
    } else {
      return "";
    }

    if (isNaN(date.getTime())) return "";

    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    let period = "";

    if (is12HourFormat) {
      period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;
    }

    let timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    if (showSeconds) {
      timeString += `:${seconds.toString().padStart(2, "0")}`;
    }

    if (is12HourFormat) {
      timeString += ` ${period}`;
    }

    return timeString;
  } catch (error) {
    console.warn("Failed to parse time value:", value, error);
    return "";
  }
};

// Enhanced function to convert time string to specified return type
export const convertTimeToReturnType = (
  timeString: string,
  returnType: TReturnType,
  originalValue?: string | number | Date | null | undefined
): any => {
  // Handle empty time string
  if (!timeString) {
    switch (returnType) {
      case "time-string":
      case "iso-string":
      case "datetime-string":
        return "";
      case "unix-seconds":
      case "unix-milliseconds":
        return 0;
      case "date-object":
        return null;
      default:
        return "";
    }
  }

  try {
    // Parse the time string to get hours and minutes
    const [time, period] = timeString.includes(" ")
      ? timeString.split(" ")
      : [timeString, ""];
    const [hours, minutes, seconds = "0"] = time.split(":");

    let hour = parseInt(hours);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    const today = new Date();
    const timeDate = new Date(today);
    timeDate.setHours(hour, parseInt(minutes), parseInt(seconds), 0);

    switch (returnType) {
      case "time-string":
        return timeString;

      case "iso-string": {
        // If we have an original ISO string, preserve the date part
        if (
          originalValue &&
          typeof originalValue === "string" &&
          originalValue.includes("T")
        ) {
          const originalDate = new Date(originalValue);
          const newDate = new Date(originalDate);
          newDate.setHours(hour, parseInt(minutes), parseInt(seconds), 0);
          return newDate.toISOString();
        }
        // Otherwise use today's date
        return timeDate.toISOString();
      }

      case "datetime-string": {
        // Format as MM/DD/YYYY HH:MM:SS AM/PM
        if (
          originalValue &&
          typeof originalValue === "string" &&
          originalValue.includes("/")
        ) {
          // Try to preserve the original date part
          const datePart = originalValue.split(" ")[0];
          return `${datePart} ${timeString}`;
        }

        // Use today's date
        const month = (timeDate.getMonth() + 1).toString().padStart(2, "0");
        const day = timeDate.getDate().toString().padStart(2, "0");
        const year = timeDate.getFullYear();
        return `${month}/${day}/${year} ${timeString}`;
      }

      case "unix-seconds":
        return Math.floor(timeDate.getTime() / 1000);

      case "unix-milliseconds":
        return timeDate.getTime();

      case "date-object": {
        // If we have an original date, preserve the date part
        if (originalValue instanceof Date) {
          const newDate = new Date(originalValue);
          newDate.setHours(hour, parseInt(minutes), parseInt(seconds), 0);
          return newDate;
        }
        return timeDate;
      }

      default:
        return timeString;
    }
  } catch (error) {
    console.warn("Failed to convert time to return type:", error);
    return timeString;
  }
};

export const getTimes = (time: string, showSeconds: boolean = false) => {
  let hour: string = "";
  let minute: string = "";
  let second: string = "";
  let period: string = "";

  if (showSeconds) {
    const [splitHour, splitMinute, splitSecond, splitPeriod] =
      time.split(/[:\s]/);
    hour = splitHour || "";
    minute = splitMinute || "";
    second = splitSecond || "";
    period = splitPeriod ? splitPeriod.toUpperCase() : "";
  } else {
    const [splitHour, splitMinute, splitPeriod] = time.split(/[:\s]/);
    hour = splitHour || "";
    minute = splitMinute || "";
    period = splitPeriod ? splitPeriod.toUpperCase() : "";
  }

  return { hour, minute, second, period };
};

// Enhanced function to parse various time formats
export const parseClockTimeFromValue = (
  value: string | number | Date | null | undefined
): { hour: number; minute: number; period: string } => {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === "") {
    return { hour: 12, minute: 0, period: "AM" };
  }

  let date: Date;

  try {
    if (typeof value === "number") {
      // Unix timestamp (milliseconds or seconds)
      const timestamp = value.toString().length === 10 ? value * 1000 : value;
      date = new Date(timestamp);
    } else if (value instanceof Date) {
      date = value;
    } else if (typeof value === "string") {
      // Handle empty string
      if (value.trim() === "") return { hour: 12, minute: 0, period: "AM" };

      // Check if it's already in time format (HH:MM AM/PM or HH:MM:SS AM/PM)
      const timeOnlyRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?$/i;
      const match = value.trim().match(timeOnlyRegex);

      if (match) {
        let hour = parseInt(match[1]);
        const minute = parseInt(match[2]);
        const period = match[4] ? match[4].toUpperCase() : "AM";

        // Convert 24-hour to 12-hour if no AM/PM specified
        if (!match[4]) {
          if (hour === 0) {
            hour = 12;
          } else if (hour > 12) {
            hour = hour - 12;
          }
        }

        return { hour, minute, period };
      }

      // Try to parse various ISO formats and other date strings
      if (value.includes("T") || value.includes("-") || value.includes("/")) {
        date = new Date(value);
      } else {
        // Fallback: try to parse as a general date string
        date = new Date(value);
      }
    } else {
      return { hour: 12, minute: 0, period: "AM" };
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return { hour: 12, minute: 0, period: "AM" };
    }

    // Extract hour, minute, and determine period
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return { hour: hours, minute: minutes, period };
  } catch (error) {
    console.warn("Failed to parse time value:", value, error);
    return { hour: 12, minute: 0, period: "AM" };
  }
};

// Enhanced function to convert time to specified return type
export const convertClockTimeToReturnType = (
  hour: number,
  minute: number,
  period: string,
  returnType: TReturnType,
  originalValue?: string | number | Date | null | undefined
): any => {
  try {
    // Convert to 24-hour format for calculations
    let hour24 = hour;
    if (period === "PM" && hour !== 12) hour24 += 12;
    if (period === "AM" && hour === 12) hour24 = 0;

    const today = new Date();
    const timeDate = new Date(today);
    timeDate.setHours(hour24, minute, 0, 0);

    // Format time string
    const timeString = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;

    switch (returnType) {
      case "time-string":
        return timeString;

      case "iso-string": {
        // If we have an original ISO string, preserve the date part
        if (
          originalValue &&
          typeof originalValue === "string" &&
          originalValue.includes("T")
        ) {
          const originalDate = new Date(originalValue);
          const newDate = new Date(originalDate);
          newDate.setHours(hour24, minute, 0, 0);
          return newDate.toISOString();
        }
        // Otherwise use today's date
        return timeDate.toISOString();
      }

      case "datetime-string": {
        // Format as MM/DD/YYYY HH:MM:SS AM/PM
        if (
          originalValue &&
          typeof originalValue === "string" &&
          originalValue.includes("/")
        ) {
          // Try to preserve the original date part
          const datePart = originalValue.split(" ")[0];
          return `${datePart} ${timeString}`;
        }

        // Use today's date
        const month = (timeDate.getMonth() + 1).toString().padStart(2, "0");
        const day = timeDate.getDate().toString().padStart(2, "0");
        const year = timeDate.getFullYear();
        return `${month}/${day}/${year} ${timeString}`;
      }

      case "unix-seconds":
        return Math.floor(timeDate.getTime() / 1000);

      case "unix-milliseconds":
        return timeDate.getTime();

      case "date-object": {
        // If we have an original date, preserve the date part
        if (originalValue instanceof Date) {
          const newDate = new Date(originalValue);
          newDate.setHours(hour24, minute, 0, 0);
          return newDate;
        }
        return timeDate;
      }

      default:
        return timeString;
    }
  } catch (error) {
    console.warn("Failed to convert time to return type:", error);
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")} ${period}`;
  }
};
