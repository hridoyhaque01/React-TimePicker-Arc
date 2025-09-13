/* eslint-disable react-hooks/exhaustive-deps */
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import type {
  IClockPickerHookProps,
  IContainerPosition,
  IInputPosition,
} from "../types";
import {
  convertTimeToReturnType,
  detectReturnType,
  parseTimeFromValue,
} from "../utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function useClockPicker({
  align = "bottom",
  onTimeChange,
  value,
  returnType,
  setValue = (value: any) => value,
}: IClockPickerHookProps) {
  const actualReturnType = returnType || detectReturnType(value);
  const [internalValue, setInternalValue] = useState<string>(() =>
    parseTimeFromValue(value)
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const input = e.target.value.toUpperCase();
    let formatted = "";
    const numbers = input.replace(/[^0-9]/g, "");
    const hasPM = input.includes("P");

    if (numbers.length === 0) {
      setInternalValue("");
      const converted = convertTimeToReturnType(
        "",
        actualReturnType,
        originalValue
      );
      setValue(converted);
      onTimeChange?.("", false);
      return;
    }

    if (numbers.length >= 1) {
      const hour = numbers.substring(0, 2);
      if (numbers.length === 1) {
        formatted = hour;
      } else {
        let hourNum = parseInt(hour);
        if (hourNum > 12) hourNum = 12;
        if (hourNum === 0) hourNum = 1;
        formatted = hourNum.toString().padStart(2, "0");
      }
    }

    if (numbers.length >= 3) {
      formatted += ":";
      const minute = numbers.substring(2, 4);
      if (numbers.length === 3) {
        formatted += minute;
      } else {
        let minuteNum = parseInt(minute);
        if (minuteNum > 59) minuteNum = 59;
        formatted += minuteNum.toString().padStart(2, "0");
      }
    }

    if (numbers.length >= 4) {
      formatted += " ";
      if (hasPM) formatted += "PM";
      else formatted += "AM";
    }

    setInternalValue(formatted);
    const converted = convertTimeToReturnType(
      formatted,
      actualReturnType,
      originalValue
    );
    const isValid = isValidTime(formatted);
    setValue(converted);
    onTimeChange?.(formatted, isValid);
  };

  const isValidTime = (timeStr: string): boolean => {
    if (!timeStr) return false;
    const regex = new RegExp(`^(0[1-9]|1[0-2]):([0-5][0-9]) (AM|PM)$`);
    return regex.test(timeStr);
  };

  const handleClockFocus = () => {
    setIsFocused(!isFocused);
    if (!isFocused && inputRef.current) {
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
    setPosition({ x: positionX, y: positionY, width: inputRect.width });
  }, [align]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node) &&
      wrapperRef.current &&
      !wrapperRef.current.contains(event.target as Node)
    ) {
      setIsFocused(false);
    }
  };

  const handleCancel = () => {
    setInternalValue(prevValue || "");
    setValue(
      convertTimeToReturnType(prevValue || "", actualReturnType, originalValue)
    );
    onTimeChange?.("", false);
    setIsFocused(false);
    inputRef.current?.blur();
  };

  const handleTimeChange = (time: string) => {
    setInternalValue(time);
    const converted = convertTimeToReturnType(
      time,
      actualReturnType,
      originalValue
    );
    const isValid = isValidTime(time);
    onTimeChange?.(time, isValid);
    setValue(converted);
  };

  const handleOk = () => {
    if (onTimeChange) {
      const isValid = isValidTime(internalValue);
      onTimeChange(internalValue, isValid);
    }
    setIsFocused(false);
    setPrevValue(internalValue);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const parsedValue = parseTimeFromValue(value);
    if (parsedValue !== internalValue) {
      setInternalValue(parsedValue);
      setPrevValue(parsedValue);
      setOriginalValue(value);
    }
    if (inputRef.current) handleSetPosition();
    if (internalValue !== prevValue) setPrevValue(internalValue);
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return {
    inputRef,
    wrapperRef,
    containerRef,
    position,
    internalValue,
    isFocused,
    handleChange,
    handleClockFocus,
    handleCancel,
    handleOk,
    isValidTime,
    setInternalValue,
    handleTimeChange,
  };
}
