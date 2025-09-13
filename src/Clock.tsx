/* eslint-disable @typescript-eslint/no-explicit-any */
import { useClock } from "./hooks";
import "./index.css";
import type { IClockProps } from "./types";

export function Clock({
  returnType,
  value,
  setValue = (value: any) => value,
  onTimeChange,
  classNames = {
    wrapper: "",
    modeWrapper: "",
    modeButtons: "",
    modeButtonHour: "",
    modeButton: "",
    modeButtonMinute: "",
    formatButtons: "",
    formatButton: "",
    formatActiveButton: "",
    contentWrapper: "",
    content: "",
    times: "",
    time: "",
    timeActive: "",
    timesCenter: "",
    timesCenterPoint: "",
    handle: "",
    modeDivider: "",
  },
}: IClockProps) {
  const {
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
  } = useClock({
    returnType,
    value,
    setValue,
    onTimeChange,
  });

  return (
    <div
      className={`arc_cpr__wrapper${
        classNames?.wrapper ? ` ${classNames.wrapper}` : ""
      }`}
    >
      {/* Mode Selection */}
      <div
        className={`arc_cpr_mode__wrapper${
          classNames?.modeWrapper ? ` ${classNames.modeWrapper}` : ""
        }`}
      >
        <div
          className={`arc_cpr_mode__buttons${
            classNames?.modeButtons ? ` ${classNames.modeButtons}` : ""
          }`}
        >
          <input
            type="text"
            placeholder="Hour"
            className={`arc_cpr_mode__button${
              classNames?.modeButton ? ` ${classNames.modeButton}` : ""
            }${
              classNames?.modeButtonHour ? ` ${classNames.modeButtonHour}` : ""
            }${mode === "hour" ? " arc_cpr_mode__active" : ""}`}
            name="hour"
            aria-label="Select Hour"
            value={selectedHour ? selectedHour.toString().padStart(2, "0") : ""}
            onChange={handleHourInputChange}
            onFocus={() => setMode("hour")}
            id="hour"
          />
          <span className={`arc_cpr__divider${classNames?.modeDivider}`}>
            :
          </span>
          <input
            type="text"
            placeholder="Min"
            className={`arc_cpr_mode__button${
              classNames?.modeButton ? ` ${classNames.modeButton}` : ""
            }${
              classNames?.modeButtonMinute
                ? ` ${classNames.modeButtonMinute}`
                : ""
            }${mode === "minute" ? " arc_cpr_mode__active" : ""}`}
            name="min"
            aria-label="Select Minute"
            value={
              selectedMinute !== undefined
                ? selectedMinute.toString().padStart(2, "0")
                : ""
            }
            id="minute"
            onChange={handleMinuteInputChange}
            onFocus={() => setMode("minute")}
          />
        </div>
        <div
          className={`arc_cpr_format__buttons${
            classNames?.formatButtons ? ` ${classNames.formatButtons}` : ""
          }`}
        >
          <button
            type="button"
            className={`arc_cpr_format_button${
              formatedTime?.toLowerCase() === "am" ? " active" : ""
            }${classNames?.formatButton ? ` ${classNames.formatButton}` : ""}${
              classNames?.formatActiveButton &&
              formatedTime?.toLowerCase() === "am"
                ? ` ${classNames.formatActiveButton}`
                : ""
            }`}
            aria-pressed={formatedTime?.toLowerCase() === "am"}
            onClick={() => handlePeriodChange("AM")}
          >
            AM
          </button>
          <button
            type="button"
            className={`arc_cpr_format_button${
              formatedTime?.toLowerCase() === "pm" ? " active" : ""
            }${classNames?.formatButton ? ` ${classNames.formatButton}` : ""}${
              classNames?.formatActiveButton &&
              formatedTime?.toLowerCase() === "pm"
                ? ` ${classNames.formatActiveButton}`
                : ""
            }`}
            aria-pressed={formatedTime?.toLowerCase() === "pm"}
            onClick={() => handlePeriodChange("PM")}
          >
            PM
          </button>
        </div>
      </div>

      {/* Clock */}
      <div
        className={`arc_cpr_content__wrapper${
          classNames?.contentWrapper ? ` ${classNames.contentWrapper}` : ""
        }`}
      >
        <div
          className={`arc_cpr_content${
            classNames?.content ? ` ${classNames.content}` : ""
          }`}
          onClick={handleClockClick}
        >
          <div
            className={`arc_cpr__times${
              classNames?.times ? ` ${classNames.times}` : ""
            }`}
            ref={ref}
          >
            {times.map((time, index) => {
              const position = getPosition(time);
              const isActive =
                (mode === "hour" && time === selectedHour) ||
                (mode === "minute" &&
                  getTime(time, "minute") ===
                    selectedMinute.toString().padStart(2, "0"));
              return (
                <div
                  key={index}
                  className={`arc_cpr_time${
                    classNames?.time ? ` ${classNames.time}` : ""
                  }${
                    classNames?.timeActive && isActive
                      ? ` ${classNames?.timeActive}`
                      : ""
                  }${isActive ? " active" : ""}`}
                  style={{
                    left: position.x,
                    top: position.y,
                  }}
                >
                  {mode === "hour" ? time : getTime(time, "minute")}
                </div>
              );
            })}
            <div
              className={`arc_cpr_times__center${
                classNames?.timesCenter ? ` ${classNames.timesCenter}` : ""
              }`}
            ></div>
            <div
              className={`arc_cpr_times_center__point${
                classNames?.timesCenterPoint
                  ? ` ${classNames.timesCenterPoint}`
                  : ""
              }`}
            ></div>
          </div>
          {/* Handle */}
          <div
            className={`arc_cpr_handle${
              classNames?.handle ? ` ${classNames.handle}` : ""
            }`}
            style={{
              transformOrigin: "bottom center",
              transition: "transform 0.3s ease-in-out",
              transform: `translate(-50%, 0) rotate(${currentTime}deg)`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
