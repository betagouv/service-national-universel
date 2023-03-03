import React, { useEffect, useRef, useState } from "react";
import DateFilter from "../../../components/filters/DatePickerList";

export default function DatePickerWrapper(props) {
  const [fromDate, setFromDate] = useState("");
  const isFirstRun = useRef(true);

  useEffect(() => {
    console.log("compoennt mount", props);
    let length = props.value?.length || 0;
    if (length > 0) setFromDate(props.value[0]);
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (props.value === null) {
      console.log("props.value === null");
      setFromDate("");
    }
  }, [props.value]);

  useEffect(() => {
    console.log("FROM DATE", fromDate);
    let query = null;
    let value = [];
    query = {
      query: {
        bool: {
          filter: [{ range: { startAt: { gte: fromDate } } }, { range: { endAt: { gte: fromDate } } }],
        },
      },
    };
    if (fromDate === "") return;
    value = [fromDate];
    // a executer seulement si value !== props.value
    props.setQuery({ query, value });
  }, [fromDate]);

  return (
    <>
      <DateFilter title="Date de début" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
    </>
  );
}
