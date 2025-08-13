/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from "react";
import "./TimePicker.css";
// Define the return types
type TimePickerReturnType =
  | "time-string" // "11:30 PM"
  | "iso-string" // "2022-04-17T15:30:45"
  | "datetime-string" // "04/17/2022 3:30:45 PM"
  | "unix-seconds" // 1650207045
  | "unix-milliseconds" // 1650207045000
  | "date-object"; // new Date()

interface ITimePickerProps {
  showSeconds?: boolean;
  showButtons?: boolean;
  is12HourFormat?: boolean;
  showAMPM?: boolean;
  align?: "bottom" | "top" | "left" | "right" | "center";
  onTimeChange?: (time: string, isValid: boolean) => void;
  placeholder?: string;
  className?: string;
  value?: string | number | Date | null | undefined;
  returnType?: TimePickerReturnType; // New prop to specify return type
  classNames?: {
    wrapper?: string;
    inputWrapper?: string;
    input?: string;
    icon?: string;
    listsMainWrapper?: string;
    listsWrapper?: string;
    lists?: string;
    list?: string;
    listSelected?: string;
    buttons?: string;
    button?: string;
    buttonCancel?: string;
    buttonConfirm?: string;
  };
  id?: string;
  icon?: ReactNode;
  cancelButtonText?: string;
  confirmButtonText?: string;
  setValue?: (value: any) => void;
}

interface IInputPosition {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}

interface IContainerPosition {
  x: number;
  y: number;
  width: number;
}

// Function to detect the return type from the original value
const detectReturnType = (
  value: string | number | Date | null | undefined
): TimePickerReturnType => {
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
const parseTimeFromValue = (
  value: string | number | Date | null | undefined,
  showSeconds: boolean = false,
  is12HourFormat: boolean = true
): string => {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === "") return "";

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
      if (value.trim() === "") return "";

      // Check if it's already in the expected format
      const timeOnlyRegex = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(AM|PM)?$/i;
      if (timeOnlyRegex.test(value.trim())) {
        return value.trim();
      }

      // Try to parse various ISO formats and other date strings
      if (value.includes("T") || value.includes("-") || value.includes("/")) {
        date = new Date(value);
      } else {
        // Fallback: try to parse as a general date string
        date = new Date(value);
      }
    } else {
      return "";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "";
    }

    // Format the time according to component settings
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
const convertTimeToReturnType = (
  timeString: string,
  returnType: TimePickerReturnType,
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

const getTimes = (time: string, showSeconds: boolean = false) => {
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

function TimePicker({
  showSeconds = false,
  is12HourFormat = true,
  showAMPM = true,
  showButtons = true,
  align = "bottom",
  onTimeChange,
  placeholder,
  className = "",
  value,
  returnType, // If not provided, will be auto-detected
  icon,
  cancelButtonText = "Cancel",
  confirmButtonText = "OK",
  id = "arc_timepicker",
  classNames = {
    wrapper: "",
    inputWrapper: "",
    input: "",
    icon: "",
    listsMainWrapper: "",
    listsWrapper: "",
    lists: "",
    list: "",
    listSelected: "",
    buttons: "",
    button: "",
    buttonCancel: "",
    buttonConfirm: "",
  },
  setValue = (value: any) => value,
}: ITimePickerProps) {
  // Determine the return type (either specified or auto-detected)
  const actualReturnType = returnType || detectReturnType(value);

  // Parse the initial value and convert it to the expected string format
  const [internalValue, setInternalValue] = useState<string>(() =>
    parseTimeFromValue(value, showSeconds, is12HourFormat && showAMPM)
  );

  const [prevValue, setPrevValue] = useState<string>(internalValue);
  const [originalValue, setOriginalValue] = useState<
    string | number | Date | null | undefined
  >(value);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLLabelElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<IContainerPosition | null>(null);

  // Update internal value when external value changes
  useEffect(() => {
    const parsedValue = parseTimeFromValue(
      value,
      showSeconds,
      is12HourFormat && showAMPM
    );
    if (parsedValue !== internalValue) {
      setInternalValue(parsedValue);
      setPrevValue(parsedValue);
      setOriginalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, showSeconds, is12HourFormat, showAMPM]);

  // Generate arrays based on format
  const hours = is12HourFormat
    ? Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
    : Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));

  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const seconds = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const amPm = ["AM", "PM"];

  const { hour, minute, second, period } = getTimes(internalValue, showSeconds);

  const getPlaceholder = () => {
    if (placeholder) return placeholder;

    let format = "--:--";
    if (showSeconds) format += ":--";
    if (showAMPM) format += " --";
    return format;
  };

  const getMaxLength = () => {
    let length = 5; // HH:MM
    if (showSeconds) length += 3; // :SS
    if (showAMPM) length += 3; // " AM"
    return length;
  };

  // Function to update time parts
  const updateTime = (
    newHour?: string,
    newMinute?: string,
    newSecond?: string,
    newPeriod?: string
  ) => {
    const currentParts = getTimes(internalValue, showSeconds);

    const updatedHour = newHour || currentParts.hour || "00";
    const updatedMinute = newMinute || currentParts.minute || "00";
    const updatedSecond = showSeconds
      ? newSecond || currentParts.second || "00"
      : "";
    const updatedPeriod = showAMPM
      ? newPeriod || currentParts.period || "AM"
      : "";

    let newTime = `${updatedHour}:${updatedMinute}`;
    if (showSeconds) {
      newTime += `:${updatedSecond}`;
    }
    if (showAMPM) {
      newTime += ` ${updatedPeriod}`;
    }

    setInternalValue(newTime);

    // Convert to the specified return type and call setValue
    const convertedValue = convertTimeToReturnType(
      newTime,
      actualReturnType,
      originalValue
    );
    setValue(convertedValue);

    if (onTimeChange) {
      const isValid = isValidTime(newTime);
      onTimeChange(newTime, isValid);
    }
  };

  // Click handlers for each time part
  const handleHourClick = (selectedHour: string) => {
    updateTime(selectedHour);
  };

  const handleMinuteClick = (selectedMinute: string) => {
    updateTime(undefined, selectedMinute);
  };

  const handleSecondClick = (selectedSecond: string) => {
    updateTime(undefined, undefined, selectedSecond);
  };

  const handlePeriodClick = (selectedPeriod: string) => {
    updateTime(undefined, undefined, undefined, selectedPeriod);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const input = e.target.value.toUpperCase();
    let formatted = "";
    const numbers = input.replace(/[^0-9]/g, "");

    // If user types letters, try to detect AM/PM
    const hasAM = input.includes("A");
    const hasPM = input.includes("P");

    if (numbers.length === 0) {
      setInternalValue("");
      setValue(convertTimeToReturnType("", actualReturnType, originalValue));
      if (onTimeChange) onTimeChange("", false);
      return;
    }

    // Format based on how many digits we have
    if (numbers.length >= 1) {
      // Hour formatting
      let hour = numbers.substring(0, 2);
      if (numbers.length === 1) {
        formatted = hour;
      } else {
        // Validate hour based on format
        const hourNum = parseInt(hour);
        const maxHour = is12HourFormat ? 12 : 23;
        if (hourNum > maxHour) {
          hour = String(maxHour);
        } else if (is12HourFormat && hourNum === 0) {
          hour = "01";
        }
        formatted = hour.padStart(2, "0");
      }
    }

    if (numbers.length >= 3) {
      // Minute formatting
      formatted += ":";
      let minute = numbers.substring(2, 4);
      if (numbers.length === 3) {
        formatted += minute;
      } else {
        // Validate minute (0-59)
        const minuteNum = parseInt(minute);
        if (minuteNum > 59) {
          minute = "59";
        }
        formatted += minute.padStart(2, "0");
      }
    }

    if (showSeconds && numbers.length >= 5) {
      // Second formatting
      formatted += ":";
      let second = numbers.substring(4, 6);
      if (numbers.length === 5) {
        formatted += second;
      } else {
        // Validate second (0-59)
        const secondNum = parseInt(second);
        if (secondNum > 59) {
          second = "59";
        }
        formatted += second.padStart(2, "0");
      }
    }

    // Add AM/PM if enabled
    if (showAMPM) {
      const minLength = showSeconds ? 6 : 4;
      if (numbers.length >= minLength) {
        formatted += " ";
        if (hasPM) {
          formatted += "PM";
        } else if (hasAM || (!hasAM && !hasPM)) {
          formatted += "AM";
        }
      }
    }

    setInternalValue(formatted);
    setValue(
      convertTimeToReturnType(formatted, actualReturnType, originalValue)
    );

    if (onTimeChange) {
      const isValid = isValidTime(formatted);
      onTimeChange(formatted, isValid);
    }
  };

  // Validate complete time based on current settings
  const isValidTime = (timeStr: string): boolean => {
    if (!timeStr) return false;

    let pattern = "";

    if (is12HourFormat) {
      // 12-hour format: 01-12
      pattern += "(0[1-9]|1[0-2])";
    } else {
      // 24-hour format: 00-23
      pattern += "([01]?[0-9]|2[0-3])";
    }

    // Minutes: 00-59
    pattern += ":([0-5][0-9])";

    // Seconds (optional)
    if (showSeconds) {
      pattern += ":([0-5][0-9])";
    }

    // AM/PM (optional)
    if (showAMPM) {
      pattern += " (AM|PM)";
    }

    const regex = new RegExp(`^${pattern}$`);
    return regex.test(timeStr);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (inputRef.current) {
      handleSetPosition();
      inputRef.current.select();
    }
  };

  const handleSetPosition = useCallback(() => {
    const inputRect =
      wrapperRef.current?.getBoundingClientRect() as IInputPosition;
    const screenRect = window.document.documentElement.getBoundingClientRect();
    const containerRect =
      containerRef.current?.getBoundingClientRect() as IInputPosition;
    const contentHeight = containerRect.height;
    const contentHalfHeight = Math.ceil(contentHeight / 2);
    const screenBottom = screenRect.height - inputRect.bottom - contentHeight;
    const screenTop = inputRect.top - contentHeight - 4;
    const screenLeft = inputRect.left - inputRect.width - 4;
    const screenRight = screenRect.width - inputRect.right - inputRect.width;
    const isEnoughSpace =
      screenRect.width >= inputRect.width && screenRect.height >= contentHeight;

    let positionY = inputRect.top;
    let positionX = inputRect.left;
    if (!isEnoughSpace) {
      if (align === "bottom") {
        positionY = inputRect.bottom + 4;
      } else if (align === "top") {
        positionY = screenTop;
      } else if (align === "left") {
        positionX = screenLeft;
      } else if (align === "right") {
        positionX = inputRect.right + 4;
      } else {
        positionY = inputRect.top - contentHalfHeight;
        positionX = inputRect.left;
      }
    } else {
      if (align === "bottom") {
        positionY =
          screenBottom > 0
            ? inputRect.bottom + 4
            : screenTop > 0
            ? screenTop
            : inputRect.top - contentHalfHeight;
      } else if (align === "top") {
        positionY =
          screenTop > 0
            ? screenTop
            : screenBottom > 0
            ? inputRect.bottom
            : inputRect.top - contentHalfHeight;
      } else if (align === "left") {
        positionX = screenLeft > 0 ? screenLeft : inputRect.right + 4;
      } else if (align === "right") {
        positionX = screenRight > 0 ? inputRect.right + 4 : screenLeft;
      } else {
        positionY = inputRect.top - contentHalfHeight;
        positionX = inputRect.left;
      }
    }
    setPosition({
      x: positionX,
      y: positionY,
      width: inputRect.width,
    });
  }, [align]);

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsFocused(false);
    }
  };

  const handleCancel = () => {
    setInternalValue(prevValue || "");
    setValue(
      convertTimeToReturnType(prevValue || "", actualReturnType, originalValue)
    );
    setIsFocused(false);
    if (onTimeChange) onTimeChange("", false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleOk = () => {
    if (onTimeChange) {
      const isValid = isValidTime(internalValue);
      onTimeChange(internalValue, isValid);
    }
    setIsFocused(false);
    setPrevValue(internalValue);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      handleSetPosition();
    }
    if (internalValue !== prevValue) {
      setPrevValue(internalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSetPosition]);

  return (
    <div
      className={`arc_wrapper${className ? ` ${className}` : ""}${
        classNames.wrapper ? ` ${classNames.wrapper}` : ""
      }`}
    >
      <label
        ref={wrapperRef}
        className={`arc_tmc_wrapper${
          internalValue && !isValidTime(internalValue)
            ? " arc_tmc_wrapper__invalid"
            : ""
        }${classNames.inputWrapper ? ` ${classNames.inputWrapper}` : ""}`}
        htmlFor={id}
      >
        <input
          id={id}
          type="text"
          placeholder={getPlaceholder()}
          className={`arc_tmc_input${
            classNames.input ? ` ${classNames.input}` : ""
          }`}
          name="timepicker"
          autoComplete="off"
          aria-label="Time Picker"
          ref={inputRef}
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={getMaxLength()}
        />
        {icon ? (
          icon
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={`arc_tmc_icon${
              classNames.icon ? ` ${classNames.icon}` : ""
            }`}
          >
            <path
              d="M12.3845 20.1595C7.89646 20.1595 4.27246 16.5115 4.27246 12.0475C4.27246 7.55955 7.92046 3.93555 12.3845 3.93555C16.8485 3.93555 20.4965 7.58355 20.4965 12.0475C20.4965 16.5115 16.8725 20.1595 12.3845 20.1595ZM12.3845 4.79955C8.40046 4.79955 5.13646 8.03955 5.13646 12.0235C5.13646 16.0075 8.37646 19.2715 12.3845 19.2715C16.3925 19.2715 19.6325 16.0315 19.6325 12.0235C19.6325 8.03955 16.3685 4.79955 12.3845 4.79955Z"
              fill="currentColor"
            />
            <path
              d="M15.2641 15.3359C15.1441 15.3359 15.0481 15.2879 14.9521 15.2159L12.0721 12.3359C12.0001 12.2639 11.9521 12.1439 11.9521 12.0239V6.76794C11.9521 6.52794 12.1441 6.33594 12.3841 6.33594C12.6241 6.33594 12.8161 6.52794 12.8161 6.76794V11.8559L15.5521 14.5919C15.7201 14.7599 15.7201 15.0479 15.5521 15.2159C15.4801 15.2879 15.3601 15.3359 15.2641 15.3359Z"
              fill="currentColor"
            />
          </svg>
        )}
      </label>
      <div
        className={`arc_tmc_lists_wrapper${
          isFocused ? " arc_tmc_lists_wrapper__focused" : ""
        }${
          classNames.listsMainWrapper ? ` ${classNames.listsMainWrapper}` : ""
        }`}
        onMouseDown={(e) => e.preventDefault()}
        ref={containerRef}
        style={{
          top: position ? position.y : 0,
          left: position ? position.x : 0,
          width: position ? position.width : "max-content",
        }}
      >
        <div
          className={`arc_tmc_lists${
            classNames.listsWrapper ? ` ${classNames.listsWrapper}` : ""
          }`}
        >
          <ul
            className={`arc_tmc_list arc_tmc_list__hours${
              classNames.lists ? ` ${classNames.lists}` : ""
            }`}
          >
            {hours.map((iHour, index) => (
              <li
                key={index}
                className={`${
                  iHour == hour
                    ? "arc_tmc_list__selected" +
                      `${
                        classNames.listSelected
                          ? ` ${classNames.listSelected}`
                          : ""
                      }`
                    : ""
                }${classNames?.list ? ` ${classNames.list}` : ""}`}
                onClick={() => handleHourClick(iHour)}
                style={{ cursor: "pointer" }}
              >
                {iHour}
              </li>
            ))}
          </ul>
          <ul
            className={`arc_tmc_list arc_tmc_list__minutes${
              classNames.lists ? ` ${classNames.lists}` : ""
            }`}
          >
            {minutes.map((iMinute, index) => (
              <li
                key={index}
                className={`${
                  iMinute == minute
                    ? "arc_tmc_list__selected" +
                      `${
                        classNames.listSelected
                          ? ` ${classNames.listSelected}`
                          : ""
                      }`
                    : ""
                }${classNames?.list ? ` ${classNames.list}` : ""}`}
                onClick={() => handleMinuteClick(iMinute)}
                style={{ cursor: "pointer" }}
              >
                {iMinute}
              </li>
            ))}
          </ul>
          {showSeconds && (
            <ul
              className={`arc_tmc_list arc_tmc_list__seconds${
                classNames.lists ? ` ${classNames.lists}` : ""
              }`}
            >
              {seconds.map((iSecond, index) => (
                <li
                  key={index}
                  className={`${
                    iSecond == second
                      ? "arc_tmc_list__selected" +
                        `${
                          classNames.listSelected
                            ? ` ${classNames.listSelected}`
                            : ""
                        }`
                      : ""
                  }${classNames?.list ? ` ${classNames.list}` : ""}`}
                  onClick={() => handleSecondClick(iSecond)}
                  style={{ cursor: "pointer" }}
                >
                  {iSecond}
                </li>
              ))}
            </ul>
          )}
          {showAMPM && (
            <ul className="arc_tmc_list arc_tmc_list__ampm">
              {amPm.map((iPeriod, index) => (
                <li
                  key={index}
                  className={`${
                    iPeriod == period
                      ? "arc_tmc_list__selected" +
                        `${
                          classNames.listSelected
                            ? ` ${classNames.listSelected}`
                            : ""
                        }`
                      : ""
                  }${classNames?.list ? ` ${classNames.list}` : ""}`}
                  onClick={() => handlePeriodClick(iPeriod)}
                  style={{ cursor: "pointer" }}
                >
                  {iPeriod}
                </li>
              ))}
            </ul>
          )}
        </div>
        {showButtons && (
          <div
            className={`arc_tmc_buttons${
              classNames.buttons ? ` ${classNames.buttons}` : ""
            }`}
          >
            <button
              type="button"
              className={`arc_tmc_button arc_tmc_button__cancel${
                classNames.button ? ` ${classNames.button}` : ""
              }${classNames.buttonCancel ? ` ${classNames.buttonCancel}` : ""}`}
              onClick={handleCancel}
            >
              {cancelButtonText ? cancelButtonText : "Cancel"}
            </button>
            <button
              type="button"
              className={`arc_tmc_button arc_tmc_button__ok${
                classNames.button ? ` ${classNames.button}` : ""
              }${
                classNames.buttonConfirm ? ` ${classNames.buttonConfirm}` : ""
              }`}
              onClick={handleOk}
            >
              {confirmButtonText ? confirmButtonText : "OK"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TimePicker;
export type { TimePickerReturnType };
