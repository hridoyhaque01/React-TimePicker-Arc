/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClockIcon } from "./assets/svg";
import { Clock } from "./Clock";
import { useClockPicker } from "./hooks";
import "./index.css";
import type { IClockPickerProps } from "./types";

export function ClockPicker({
  showButtons = true,
  align = "bottom",
  onTimeChange,
  placeholder = "--:-- --",
  className = "",
  value,
  returnType,
  icon,
  cancelButtonText = "Cancel",
  confirmButtonText = "OK",
  id = "arc_timepicker",
  classNames = {},
  clockClassNames,
  setValue = (value: any) => value,
}: IClockPickerProps) {
  const {
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
  } = useClockPicker({
    align,
    onTimeChange,
    value,
    returnType,
    setValue,
  });

  return (
    <div
      className={`arc_wrapper${className ? ` ${className}` : ""}${
        classNames.wrapper ? ` ${classNames.wrapper}` : ""
      }`}
    >
      <label
        ref={wrapperRef}
        className={`arc_tmc__wrapper${
          internalValue && !isValidTime(internalValue)
            ? " arc_tmc_wrapper__invalid"
            : ""
        }${classNames.inputWrapper ? ` ${classNames.inputWrapper}` : ""}`}
        htmlFor={id}
      >
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          className={`arc_tmc__input${
            classNames.input ? ` ${classNames.input}` : ""
          }`}
          name="timepicker"
          autoComplete="off"
          aria-label="Time Picker"
          ref={inputRef}
          value={internalValue}
          onChange={handleChange}
          maxLength={8}
        />
        {icon ? (
          icon
        ) : (
          <button
            type="button"
            className="arc_tmc_picker__btn"
            onClick={handleClockFocus}
          >
            <ClockIcon
              className={`arc_tmc__icon${
                classNames.icon ? ` ${classNames.icon}` : ""
              }`}
            />
          </button>
        )}
      </label>
      <div
        className={`arc_tmc_lists__wrapper${
          isFocused ? " arc_tmc_lists_wrapper__focused" : ""
        }${
          classNames.listsMainWrapper ? ` ${classNames.listsMainWrapper}` : ""
        }`}
        // onMouseDown={(e) => e.stopPropagation()}
        ref={containerRef}
        style={{
          top: position ? position.y : 0,
          left: position ? position.x : 0,
          width: position ? position.width : "max-content",
        }}
      >
        <Clock
          classNames={clockClassNames}
          value={internalValue}
          setValue={handleTimeChange}
        />
        {showButtons && (
          <div
            className={`arc_tmc__buttons arc_cpr__buttons${
              classNames.buttons ? ` ${classNames.buttons}` : ""
            }`}
          >
            <button
              type="button"
              className={`arc_tmc__button arc_tmc_button__cancel${
                classNames.button ? ` ${classNames.button}` : ""
              }${classNames.buttonCancel ? ` ${classNames.buttonCancel}` : ""}`}
              onClick={handleCancel}
            >
              {cancelButtonText ? cancelButtonText : "Cancel"}
            </button>
            <button
              type="button"
              className={`arc_tmc__button arc_tmc_button__ok${
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
