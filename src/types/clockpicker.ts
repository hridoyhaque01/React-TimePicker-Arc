/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import type { TReturnType } from "./common";

interface IClockPickerProps {
  showButtons?: boolean;
  align?: "bottom" | "top" | "left" | "right" | "center";
  onTimeChange?: (time: string, isValid: boolean) => void;
  placeholder?: string;
  className?: string;
  value?: string | number | Date | null | undefined;
  returnType?: TReturnType;
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
  clockClassNames?: {
    wrapper?: string;
    modeWrapper: string;
    modeButtons: string;
    modeButtonHour: string;
    modeButton: string;
    modeButtonMinute: string;
    formatButtons: string;
    formatButton: string;
    formatActiveButton: string;
    contentWrapper: string;
    content: string;
    times: string;
    time: string;
    timeActive: string;
    timesCenter: string;
    timesCenterPoint: string;
    handle: string;
    modeDivider: string;
  };
  id?: string;
  icon?: ReactNode;
  cancelButtonText?: string;
  confirmButtonText?: string;
  setValue?: (value: any) => void;
}

interface IClockProps {
  value?: string | number | Date | null | undefined;
  returnType?: TReturnType; // New prop to specify return type
  classNames?: {
    wrapper?: string;
    modeWrapper: string;
    modeButtons: string;
    modeButtonHour: string;
    modeButton: string;
    modeButtonMinute: string;
    formatButtons: string;
    formatButton: string;
    formatActiveButton: string;
    contentWrapper: string;
    content: string;
    times: string;
    time: string;
    timeActive: string;
    timesCenter: string;
    timesCenterPoint: string;
    handle: string;
    modeDivider: string;
  };
  id?: string;
  icon?: ReactNode;
  cancelButtonText?: string;
  confirmButtonText?: string;
  onTimeChange?: (time: any, isValid: boolean) => void;
  setValue?: (value: any) => void;
}

interface IClockHookProps {
  value?: string | number | Date | null | undefined;
  returnType?: TReturnType; // New prop to specify return type
  onTimeChange?: (time: any, isValid: boolean) => void;
  setValue?: (value: any) => void;
}

interface IClockPickerHookProps {
  align?: "bottom" | "top" | "left" | "right" | "center";
  onTimeChange?: (time: string, isValid: boolean) => void;
  value?: string | number | Date | null | undefined;
  returnType?: TReturnType;
  setValue?: (value: any) => void;
}

export type {
  IClockHookProps,
  IClockPickerHookProps,
  IClockPickerProps,
  IClockProps,
};
