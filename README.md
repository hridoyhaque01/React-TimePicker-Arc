# React TimePicker Component

A flexible and customizable React TimePicker component with multiple format support, TypeScript support, and extensive customization options.

## Features

- 🕐 Multiple time formats (12/24 hour)
- ⏱️ Optional seconds display
- 🌅 AM/PM toggle
- 📝 Multiple return types (time-string, iso-string, datetime-string, unix-seconds, unix-milliseconds, date-object)
- 🎨 Customizable styling through classNames prop
- 📍 Positioning options (top, bottom, left, right, center)
- ✅ Built-in validation and error handling
- 🖼️ Custom icons support
- 🔘 Customizable buttons
- 📦 TypeScript support
- 🌳 Tree-shaking friendly

## Installation

# React TimePicker Arc

```bash
npm install react-timepicker-arc
```

## Usage

### Basic Usage

```jsx
import TimePicker from "react-timepicker-arc";
import "react-timepicker-arc/dist/TimePicker.css";

export default function App() {
  const [time, setTime] = useState("");

  return (
    <TimePicker
      value={time}
      setValue={setTime}
      onTimeChange={(time, isValid) => {
        console.log("Time:", time, "Valid:", isValid);
      }}
    />
  );
}
```

## Props

| Prop                | Type                                                 | Default            | Description                       |
| ------------------- | ---------------------------------------------------- | ------------------ | --------------------------------- |
| `value`             | `string \| number \| Date \| null \| undefined`      | `undefined`        | The initial time value            |
| `setValue`          | `(value: any) => void`                               | `(value) => value` | Function called when time changes |
| `onTimeChange`      | `(time: string, isValid: boolean) => void`           | `undefined`        | Callback when time changes        |
| `showSeconds`       | `boolean`                                            | `false`            | Whether to show seconds           |
| `showButtons`       | `boolean`                                            | `true`             | Whether to show OK/Cancel buttons |
| `is12HourFormat`    | `boolean`                                            | `true`             | Use 12-hour format                |
| `showAMPM`          | `boolean`                                            | `true`             | Show AM/PM selector               |
| `align`             | `"bottom" \| "top" \| "left" \| "right" \| "center"` | `"bottom"`         | Picker alignment                  |
| `placeholder`       | `string`                                             | Auto-generated     | Input placeholder text            |
| `className`         | `string`                                             | `""`               | Additional CSS class              |
| `returnType`        | `TimePickerReturnType`                               | Auto-detected      | Format of returned value          |
| `id`                | `string`                                             | `"arc_timepicker"` | Input element ID                  |
| `icon`              | `ReactNode`                                          | Default clock icon | Custom icon element               |
| `cancelButtonText`  | `string`                                             | `"Cancel"`         | Cancel button text                |
| `confirmButtonText` | `string`                                             | `"OK"`             | Confirm button text               |
| `classNames`        | `object`                                             | `{}`               | Custom CSS classes for components |

### Return Types

- `"time-string"`: "11:30 PM"
- `"iso-string"`: "2022-04-17T15:30:45"
- `"datetime-string"`: "04/17/2022 3:30:45 PM"
- `"unix-seconds"`: 1650207045
- `"unix-milliseconds"`: 1650207045000
- `"date-object"`: Date object

### ClassNames Object

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

### Custom Styling

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

## License

MIT © [Hridoy Haque](https://github.com/hridoyhaque01)
