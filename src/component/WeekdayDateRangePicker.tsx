import React, { useState, useEffect, useCallback } from "react";
import "../styles/WeekdayDateRangePicker.css";

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface PresetRange {
  label: string;
  getValue: () => DateRange;
}

interface WeekdayDateRangePickerProps {
  onChange: (range: DateRange, weekends: Date[]) => void;
  presetRanges: PresetRange[];
  disablePastDates?: boolean;
}

const WeekdayDateRangePicker: React.FC<WeekdayDateRangePickerProps> = ({
  onChange,
  presetRanges,
  disablePastDates = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<string>("");

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  const getWeekendDates = useCallback((startDate: Date, endDate: Date) => {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (isWeekend(currentDate)) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }, []);

  const handleDayClick = (date: Date) => {
    if (isWeekend(date) || (disablePastDates && date < new Date())) return;
    if (
      !selectedRange.startDate ||
      (selectedRange.startDate && selectedRange.endDate)
    ) {
      setSelectedRange({ startDate: date, endDate: null });
      setErrorMessage(null);
    } else {
      if (date < selectedRange.startDate) {
        setErrorMessage("End date cannot be before start date.");
      } else {
        setSelectedRange({ ...selectedRange, endDate: date });
        setErrorMessage(null);
      }
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1));
      return newDate;
    });
  };

  const renderCalendar = (month: Date) => {
    const daysInMonth = getDaysInMonth(month);
    const startDay = new Date(
      month.getFullYear(),
      month.getMonth(),
      1
    ).getDay();
    const days = [];

    // Fill in empty days for the start of the month
    for (let i = 0; i < startDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day invisible"></div>
      );
    }

    // Render each day of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(month.getFullYear(), month.getMonth(), i);
      const isInRange =
        selectedRange.startDate &&
        selectedRange.endDate &&
        dayDate >= selectedRange.startDate &&
        dayDate <= selectedRange.endDate;
      const isHoveredInRange =
        selectedRange.startDate &&
        !selectedRange.endDate &&
        hoveredDate &&
        dayDate >= selectedRange.startDate &&
        dayDate <= hoveredDate;

      days.push(
        <div
          key={i}
          className={`calendar-day ${
            isWeekend(dayDate) ? "weekend" : "weekday"
          } ${isInRange || isHoveredInRange ? "in-range" : ""} ${
            selectedRange.startDate &&
            dayDate.getTime() === selectedRange.startDate.getTime()
              ? "selected"
              : ""
          } ${
            selectedRange.endDate &&
            dayDate.getTime() === selectedRange.endDate.getTime()
              ? "selected"
              : ""
          } ${disablePastDates && dayDate < new Date() ? "disabled" : ""}`}
          onClick={() => handleDayClick(dayDate)}
          onMouseEnter={() => setHoveredDate(dayDate)}
          onMouseLeave={() => setHoveredDate(null)}
        >
          {i}
        </div>
      );
    }

    return (
      <div className="calendar">
        <div className="calendar-header">
          <select
            value={month.getMonth()}
            onChange={(e) =>
              setCurrentMonth(
                new Date(month.getFullYear(), parseInt(e.target.value), 1)
              )
            }
            className="month-select"
          >
            {Array.from({ length: 12 }).map((_, idx) => (
              <option key={idx} value={idx}>
                {new Date(0, idx).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={month.getFullYear()}
            onChange={(e) =>
              setCurrentMonth(
                new Date(parseInt(e.target.value), month.getMonth(), 1)
              )
            }
            className="year-select"
          >
            {Array.from({ length: 11 }).map((_, idx) => (
              <option key={idx} value={currentMonth.getFullYear() + idx - 5}>
                {currentMonth.getFullYear() + idx - 5}
              </option>
            ))}
          </select>
        </div>
        <div className="calendar-grid">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
          {days}
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (selectedRange.startDate && selectedRange.endDate) {
      const weekends = getWeekendDates(
        selectedRange.startDate,
        selectedRange.endDate
      );
      onChange(selectedRange, weekends);
    }
  }, [selectedRange, onChange, getWeekendDates]);

  const clearSelection = () => {
    setSelectedRange({ startDate: null, endDate: null });
    setErrorMessage(null);
  };

  const formatDate = (date: Date | null) =>
    date ? date.toLocaleDateString() : "Select Date";

  const toggleModal = (
    event: React.MouseEvent<HTMLSpanElement>,
    content: string = ""
  ) => {
    event.stopPropagation(); // Prevent any parent handlers from being notified of the event
    setShowModal((prev) => !prev);
    setModalContent(content);
  };
  const last7Days = () => {
    const today = new Date();
    setSelectedRange({
      startDate: new Date(today.setDate(today.getDate() - 7)),
      endDate: new Date(),
    });
  };

  const last30Days = () => {
    const today = new Date();
    setSelectedRange({
      startDate: new Date(today.setDate(today.getDate() - 30)),
      endDate: new Date(),
    });
  };

  return (
    <div className="date-range-picker">
      <h2 className="picker-heading">Select Your Date Range</h2>
      <div className="calendar-container">
        <button onClick={() => navigateMonth("prev")} className="nav-button">
          &larr;
        </button>
        <div className="calendars-wrapper">
          {renderCalendar(currentMonth)}
          {renderCalendar(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
          )}
        </div>
        <button onClick={() => navigateMonth("next")} className="nav-button">
          &rarr;
        </button>
      </div>
      <div className="selected-range">
        <p>
          Start Date: {formatDate(selectedRange.startDate)} - End Date:{" "}
          {formatDate(selectedRange.endDate)}
        </p>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button onClick={clearSelection} className="clear-button">
          Clear Selection
        </button>
      </div>
      <div className="preset-ranges">
        {presetRanges.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              const range = preset.getValue();
              setSelectedRange(range);
              const weekends = getWeekendDates(
                range.startDate!,
                range.endDate!
              );
              onChange(range, weekends);
            }}
            className="preset-button"
          >
            {preset.label}
          </button>
        ))}
        <button onClick={last7Days} className="preset-button">
          Last 7 Days
        </button>
        <button onClick={last30Days} className="preset-button">
          Last 30 Days
        </button>
      </div>
      <button
        onClick={(event) => toggleModal(event, "Help with Date Selection")}
        className="help-button"
      >
        Help
      </button>
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={(event) => toggleModal(event)}>
              &times;
            </span>
            <p>{modalContent}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeekdayDateRangePicker;
