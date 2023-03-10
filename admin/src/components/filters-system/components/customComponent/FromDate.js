import React, { useEffect, useRef, useState } from "react";
import DateFilter from "../../../../components/filters/DatePickerList";

export default function FromDate(props) {
  const [fromDate, setFromDate] = useState("");
  const isFirstRun = useRef(true);

  useEffect(() => {
    let length = props.value?.length || 0;
    if (length > 0) setFromDate(props.value[0]);
    else setFromDate("");
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (props.value === null) {
      setFromDate("");
    } else {
      let length = props.value?.length || 0;
      if (length > 0) setFromDate(props.value[0]);
      else setFromDate("");
    }
  }, [props.value]);

  useEffect(() => {
    const result = getQuery(fromDate);
    if (!result) return;
    props.setQuery(result);
  }, [fromDate]);

  return (
    <>
      <DateFilter title="Date de début" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
    </>
  );
}

export const getQuery = (fromDate) => {
  let query = null;
  let value = [];
  query = {
    query: {
      bool: {
        filter: [{ range: { startAt: { gte: fromDate } } }, { range: { endAt: { gte: null } } }],
      },
    },
  };
  if (fromDate === "") return;
  value = [fromDate];
  // a executer seulement si value !== props.value
  return { query, value };
};
