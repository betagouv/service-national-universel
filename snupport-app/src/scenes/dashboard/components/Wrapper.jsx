import React from "react";
import TimeFilter from "./TimeFilter";

const Wrapper = ({ title, enableFilter = true, children, timePeriod, setTimePeriod, startDate, setStartDate, endDate, setEndDate }) => {
  return (
    <div className="flex flex-col gap-5">
      <h6 className="text-xl font-bold text-gray-900">{title}</h6>
      <hr className="border-gray-200" />
      {enableFilter && (
        <TimeFilter timePeriod={timePeriod} setTimePeriod={setTimePeriod} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
      )}
      {children}
    </div>
  );
};

export default Wrapper;
