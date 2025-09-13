/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import type { TReturnType } from "./common";

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
  returnType?: TReturnType; // New prop to specify return type
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

interface ITimePickerHookProps {
  showSeconds?: boolean;
  is12HourFormat?: boolean;
  showAMPM?: boolean;
  align?: "bottom" | "top" | "left" | "right" | "center";
  onTimeChange?: (time: string, isValid: boolean) => void;
  placeholder?: string;
  value?: string | number | Date | null | undefined;
  returnType?: TReturnType; // New prop to specify return type
  setValue?: (value: any) => void;
}

export type { ITimePickerHookProps, ITimePickerProps };
