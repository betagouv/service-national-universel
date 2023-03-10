import React, { useEffect, useRef, useState } from "react";
import DateFilter from "../../../components/filters/DatePickerList";

export default function ToDate(props) {
  const [toDate, setToDate] = useState("");
  const isFirstRun = useRef(true);

  useEffect(() => {
    let length = props.value?.length || 0;
    if (length > 0) setToDate(props.value[0]);
    else setToDate("");
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (props.value === null) {
      setToDate("");
    } else {
      let length = props.value?.length || 0;
      if (length > 0) setToDate(props.value[0]);
      else setToDate("");
    }
  }, [props.value]);

  useEffect(() => {
    const result = getQuery(toDate);
    if (!result) return;
    props.setQuery(result);
  }, [toDate]);

  return (
    <>
      <DateFilter title="Date de fin" value={toDate} onChange={(e) => setToDate(e.target.value)} />
    </>
  );
}

export const getQuery = (toDate) => {
  let query = null;
  let value = [];
  query = {
    query: {
      bool: {
        filter: [{ range: { startAt: { gte: null } } }, { range: { endAt: { gte: toDate } } }],
      },
    },
  };
  if (toDate === "") return;
  value = [toDate];
  // a executer seulement si value !== props.value
  return { query, value };
};
