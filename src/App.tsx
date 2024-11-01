import React from "react";
import WeekdayDateRangePicker from "./component/WeekdayDateRangePicker";
import "./App.css";

const presetRanges = [
  {
    label: "Last 7 Days",
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      return { startDate: start, endDate: end };
    },
  },
  {
    label: "Last 30 Days",
    getValue: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      return { startDate: start, endDate: end };
    },
  },
];

function App() {
  const handleDateRangeChange = (
    range: { startDate: Date | null; endDate: Date | null },
    weekends: Date[]
  ) => {
    console.log("Selected date range:", range);
    console.log("Weekend dates in range:", weekends);

    if (range.startDate && range.endDate) {
      console.log("Start date:", range.startDate.toDateString());
      console.log("End date:", range.endDate.toDateString());
      console.log(
        "Weekend dates:",
        weekends.map((date) => date.toDateString())
      );
    }
  };

  return (
    <div className="App">
      <WeekdayDateRangePicker
        onChange={handleDateRangeChange}
        presetRanges={presetRanges}
      />
    </div>
  );
}

export default App;
