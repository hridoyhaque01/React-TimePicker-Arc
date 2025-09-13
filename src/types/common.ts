/* eslint-disable @typescript-eslint/no-explicit-any */

// Define the return types
type TReturnType =
  | "time-string" // "11:30 PM"
  | "iso-string" // "2022-04-17T15:30:45"
  | "datetime-string" // "04/17/2022 3:30:45 PM"
  | "unix-seconds" // 1650207045
  | "unix-milliseconds" // 1650207045000
  | "date-object"; // new Date()

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
  height?: number;
}

// debounce.ts
type Procedure<T extends (...args: any[]) => void> = (
  ...args: Parameters<T>
) => void;

type DebouncedFunction<T extends (...args: any[]) => void> = Procedure<T> & {
  cancel: () => void;
};

// svg props

interface ISvgProps {
  className?: string;
  [x: string]: any;
}

export type {
  DebouncedFunction,
  IContainerPosition,
  IInputPosition,
  ISvgProps,
  TReturnType,
};
