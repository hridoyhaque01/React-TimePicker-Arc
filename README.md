# React Timepicker Arc (RTA)

A flexible and customizable **React TimePicker** and **ClockPicker** component with multiple format support, TypeScript support, and extensive customization options.

[![Documentation](https://img.shields.io/badge/Docs-Open-blue)](https://your-vercel-docs-url.vercel.app)

---

## ✨ Features

- 🕐 Multiple time formats (12/24 hour)
- ⏱️ **Optional seconds display (TimePicker only)**
- 🌅 AM/PM toggle
- 📝 Multiple return types (time-string, iso-string, datetime-string, unix-seconds, unix-milliseconds, date-object)
- 🎨 Customizable styling through `classNames` prop
- 📍 Positioning options (top, bottom, left, right, center)
- ✅ Built-in validation and error handling
- 🖼️ Custom icons support
- 🔘 Customizable buttons
- 📦 TypeScript support
- 🌳 Tree-shaking friendly

> **Note:** ClockPicker does **not** include a seconds selector. Seconds are supported only in TimePicker.

---

## 📦 Installation

```bash
npm install react-timepicker-arc
```

## 🔧 Usage

### Basic Usage – TimePicker

```jsx
import { TimePicker } from "react-timepicker-arc";
import "react-timepicker-arc/dist/index.css";
import { useState } from "react";

export default function App() {
  const [time, setTime] = useState("");

  return (
    <TimePicker
      value={time}
      setValue={setTime}
      onTimeChange={(time, isValid) => {
        console.log("Time:", time, "Valid:", isValid);
      }}
      showSeconds={true} // optional in TimePicker only
    />
  );
}
```

### Basic Usage – ClockPicker

```jsx
import { ClockPicker } from "react-timepicker-arc";
import "react-timepicker-arc/dist/index.css";
import { useState } from "react";

export default function App() {
  const [time, setTime] = useState("");

  return (
    <ClockPicker
      value={time}
      setValue={setTime}
      onTimeChange={(time, isValid) => {
        console.log("Time:", time, "Valid:", isValid);
      }}
      // showSeconds is not available in ClockPicker
    />
  );
}
```

## ⚙️ Props Overview

| Prop                | Type                                                 | Default            | Description                               |
| ------------------- | ---------------------------------------------------- | ------------------ | ----------------------------------------- |
| `value`             | `string \| number \| Date \| null \| undefined`      | `undefined`        | The initial time value                    |
| `setValue`          | `(value: any) => void`                               | `(value) => value` | Function called when time changes         |
| `onTimeChange`      | `(time: string, isValid: boolean) => void`           | `undefined`        | Callback when time changes                |
| `showSeconds`       | `boolean` (TimePicker only)                          | `false`            | Whether to show seconds (TimePicker only) |
| `showButtons`       | `boolean`                                            | `true`             | Whether to show OK/Cancel buttons         |
| `is12HourFormat`    | `boolean`                                            | `true`             | Use 12-hour format                        |
| `showAMPM`          | `boolean`                                            | `true`             | Show AM/PM selector                       |
| `align`             | `"bottom" \| "top" \| "left" \| "right" \| "center"` | `"bottom"`         | Picker alignment                          |
| `placeholder`       | `string`                                             | Auto-generated     | Input placeholder text                    |
| `className`         | `string`                                             | `""`               | Additional CSS class                      |
| `returnType`        | `TimePickerReturnType`                               | Auto-detected      | Format of returned value                  |
| `id`                | `string`                                             | `"arc_timepicker"` | Input element ID                          |
| `icon`              | `ReactNode`                                          | Default clock icon | Custom icon element                       |
| `cancelButtonText`  | `string`                                             | `"Cancel"`         | Cancel button text                        |
| `confirmButtonText` | `string`                                             | `"OK"`             | Confirm button text                       |
| `classNames`        | `object`                                             | `{}`               | Custom CSS classes for components         |

## 📝 Return Types

- `"time-string"`: `"11:30 PM"`
- `"iso-string"`: `"2022-04-17T15:30:45"`
- `"datetime-string"`: `"04/17/2022 3:30:45 PM"`
- `"unix-seconds"`: `1650207045`
- `"unix-milliseconds"`: `1650207045000`
- `"date-object"`: Date object

## 🎨 ClassNames Object

```typescript
{
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
}
```

### Custom Styling Example

```jsx
<TimePicker
  classNames={{
    wrapper: "my-timepicker",
    input: "my-input",
    listSelected: "my-selected-item",
  }}
  // Your custom CSS will override default styles
/>
```

## 🌐 Documentation

Full documentation & live examples:
👉 [Open Documentation](https://your-vercel-docs-url.vercel.app)

## 📝 License

MIT © Hridoy Haque
