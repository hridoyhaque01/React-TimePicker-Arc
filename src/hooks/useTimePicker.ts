/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";
import type {
  IContainerPosition,
  IInputPosition,
  ITimePickerHookProps,
} from "../types";
import {
  convertTimeToReturnType,
  detectReturnType,
  getTimes,
  parseTimeFromValue,
} from "../utils";

export function useTimePicker({
  showSeconds = false,
  is12HourFormat = true,
  showAMPM = true,
  align = "bottom",
  placeholder,
  onTimeChange,
  value,
  returnType, // If not provided, will be auto-detected
  setValue = (value: any) => value,
}: ITimePickerHookProps) {
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

    let positionY = inputRect.top;
    let positionX = inputRect.left;
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
    if (onTimeChange) onTimeChange("", false);
    setIsFocused(false);
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
    if (inputRef.current) {
      handleSetPosition();
    }
    if (internalValue !== prevValue) {
      setPrevValue(internalValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    hours,
    minutes,
    seconds,
    amPm,
    hour,
    minute,
    second,
    period,
    internalValue,
    isFocused,
    inputRef,
    wrapperRef,
    containerRef,
    position,
    getPlaceholder,
    getMaxLength,
    handleHourClick,
    handleMinuteClick,
    handleSecondClick,
    handlePeriodClick,
    handleChange,
    handleFocus,
    handleBlur,
    handleCancel,
    handleOk,
    isValidTime,
  };
}
