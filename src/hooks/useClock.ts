/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import type { IClockHookProps, IContainerPosition } from "../types";
import {
  convertClockTimeToReturnType,
  detectReturnType,
  parseClockTimeFromValue,
} from "../utils";

export function useClock({
  returnType,
  value,
  setValue = (value: any) => value,
  onTimeChange,
}: IClockHookProps) {
  const times = Array.from({ length: 12 }, (_, i) => i + 1);
  const ref = useRef<HTMLDivElement>(null);

  // Determine the return type (either specified or auto-detected)
  const actualReturnType = returnType || detectReturnType(value);

  // Parse initial value
  const initialTime = parseClockTimeFromValue(value);

  const [clockRect, setClockRect] = useState<IContainerPosition | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedHour, setSelectedHour] = useState(initialTime.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.minute);
  const [mode, setMode] = useState<"hour" | "minute">("hour");
  const [formatedTime, setFormatedTime] = useState(initialTime.period);
  const [originalValue, setOriginalValue] = useState<
    string | number | Date | null | undefined
  >(value);

  // Helper function to notify parent component of changes
  const notifyTimeChange = (hour: number, minute: number, period: string) => {
    const convertedValue = convertClockTimeToReturnType(
      hour,
      minute,
      period,
      actualReturnType,
      originalValue
    );

    setValue(convertedValue);

    if (onTimeChange) {
      const isValid = hour >= 1 && hour <= 12 && minute >= 0 && minute < 60;
      onTimeChange(convertedValue, isValid);
    }
  };

  // Helper function to calculate shortest rotation path
  const getShortestAngle = (from: number, to: number) => {
    const diff = ((to - from + 180 + 360) % 360) - 180;
    return from + diff;
  };

  const getPosition = (time: number) => {
    if (!clockRect?.width) return { x: 0, y: 0 };
    const angle = time * 30 - 90;
    const radian = (angle * Math.PI) / 180;
    const radius = clockRect?.width / 2;

    return {
      x: radius + radius * Math.cos(radian),
      y: radius + radius * Math.sin(radian),
    };
  };

  const getTime = (time: number, type: "hour" | "minute" | "second") => {
    if (type === "hour") {
      return time % 12 || 12;
    } else if (type === "minute" || type === "second") {
      const newTime = time * 5;
      return newTime < 10
        ? `0${newTime}`
        : newTime === 60
        ? "00"
        : newTime.toString();
    }
    return time;
  };

  const handleClockClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!clockRect) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clickX = event.clientX - centerX;
    const clickY = event.clientY - centerY;

    // Calculate angle from center
    let angle = Math.atan2(clickY, clickX) * (180 / Math.PI);
    angle = (angle + 90 + 360) % 360; // Normalize to 0-360, starting from 12 o'clock

    if (mode === "hour") {
      // For hours: divide by 30 degrees per hour
      const hour = Math.round(angle / 30) || 12;
      setSelectedHour(hour);
      notifyTimeChange(hour, selectedMinute, formatedTime);

      // Calculate the shortest rotation path
      const targetAngle = (hour % 12) * 30;
      const shortestAngle = getShortestAngle(currentTime, targetAngle);
      setCurrentTime(shortestAngle);
    } else {
      // For minutes: divide by 6 degrees per minute
      const minute = Math.round(angle / 6) % 60;
      setSelectedMinute(minute);
      notifyTimeChange(selectedHour, minute, formatedTime);

      // Calculate the shortest rotation path
      const targetAngle = (minute * 6) % 360;
      const shortestAngle = getShortestAngle(currentTime, targetAngle);
      setCurrentTime(shortestAngle);
    }
  };

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setClockRect({
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    }

    const handleResize = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setClockRect({
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
      }
    };
    const parsedTime = parseClockTimeFromValue(value);
    setSelectedHour(parsedTime.hour);
    setSelectedMinute(parsedTime.minute);
    setFormatedTime(parsedTime.period);
    setOriginalValue(value);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update handle position when mode changes
  useEffect(() => {
    if (value) {
      const parsedTime = parseClockTimeFromValue(value);
      setSelectedHour(parsedTime.hour);
      setSelectedMinute(parsedTime.minute);
      setFormatedTime(parsedTime.period);
      setOriginalValue(value);
      if (mode === "minute") {
        const targetAngle = (parsedTime.minute * 6) % 360;
        const shortestAngle = getShortestAngle(currentTime, targetAngle);
        setCurrentTime(shortestAngle);
      } else {
        const targetAngle = (parsedTime.hour % 12) * 30;
        const shortestAngle = getShortestAngle(currentTime, targetAngle);
        setCurrentTime(shortestAngle);
      }
    } else {
      setSelectedHour(initialTime.hour);
      setSelectedMinute(initialTime.minute);
      setFormatedTime(initialTime.period);
      setOriginalValue(value);
      setCurrentTime(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, mode]);

  const handleHourInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseInt(inputValue, 10);
    if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= 12) {
      setSelectedHour(numericValue);
      notifyTimeChange(numericValue, selectedMinute, formatedTime);
      const targetAngle = (numericValue % 12) * 30;
      const shortestAngle = getShortestAngle(currentTime, targetAngle);
      setCurrentTime(shortestAngle);
    } else if (inputValue === "") {
      setSelectedHour(0);
    }
  };

  const handleMinuteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const numericValue = parseInt(inputValue, 10);
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue < 60) {
      setSelectedMinute(numericValue);
      notifyTimeChange(selectedHour, numericValue, formatedTime);
      const targetAngle = (numericValue * 6) % 360;
      const shortestAngle = getShortestAngle(currentTime, targetAngle);
      setCurrentTime(shortestAngle);
    } else if (inputValue === "") {
      setSelectedMinute(0);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setFormatedTime(newPeriod);
    notifyTimeChange(selectedHour, selectedMinute, newPeriod);
  };

  return {
    ref,
    times,
    currentTime,
    mode,
    selectedHour,
    selectedMinute,
    formatedTime,
    getPosition,
    getTime,
    setMode,
    handleClockClick,
    handleHourInputChange,
    handleMinuteInputChange,
    handlePeriodChange,
  };
}
