/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClockIcon } from "./assets/svg";
import { useTimePicker } from "./hooks";
import "./index.css";
import type { ITimePickerProps } from "./types";

export function TimePicker({
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
  const {
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
  } = useTimePicker({
    showSeconds,
    is12HourFormat,
    showAMPM,
    align,
    onTimeChange,
    placeholder,
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
          placeholder={getPlaceholder()}
          className={`arc_tmc__input${
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
          <ClockIcon
            className={`arc_tmc__icon${
              classNames.icon ? ` ${classNames.icon}` : ""
            }`}
          />
        )}
      </label>
      <div
        className={`arc_tmc_lists__wrapper${
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
          className={`arc_tmc__lists${
            classNames.listsWrapper ? ` ${classNames.listsWrapper}` : ""
          }`}
        >
          <ul
            className={`arc_tmc__list arc_tmc_list__hours${
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
            className={`arc_tmc__list arc_tmc_list__minutes${
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
              className={`arc_tmc__list arc_tmc_list__seconds${
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
            <ul className="arc_tmc__list arc_tmc_list__ampm">
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
            className={`arc_tmc__buttons${
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
