import React, { useState, useEffect, useRef } from "react";
import { ReactiveComponent } from "@appbaseio/reactivesearch";
export default function MultiDropDownItem() {
  return (
    <ReactiveComponent
      componentId="DATE"
      URLParams={true}
      defaultValue={[]}
      render={(props) => {
        return <DatePickerWrapper setQuery={props.setQuery} value={props.value} />;
      }}
    />
  );
}
function DatePickerWrapper(props) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const isFirstRun = useRef(true);

  useEffect(() => {
    let length = props.value?.length || 0;
    switch (length) {
      case 4:
        setFromDate(props.value[1]);
        setToDate(props.value[3]);
        break;
      case 2:
        if (props.value[0] === "FROMDATE") {
          setFromDate(props.value[1]);
        } else {
          setToDate(props.value[1]);
        }
        break;
      default:
        setFromDate("");
        setToDate("");
        break;
    }
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (props.value === null) {
      setFromDate("");
      setToDate("");
    }
  }, [props.value]);

  useEffect(() => {
    let query = null;
    let value = [];
    if (fromDate && !toDate) {
      query = {
        query: {
          bool: {
            filter: [{ range: { startAt: { gte: fromDate } } }, { range: { endAt: { gte: fromDate } } }],
          },
        },
      };
      value = ["FROMDATE", fromDate];
    } else if (!fromDate && toDate) {
      query = {
        query: {
          bool: {
            filter: [{ range: { startAt: { lte: toDate } } }, { range: { endAt: { lte: toDate } } }],
          },
        },
      };
      value = ["TODATE", toDate];
    } else if (fromDate && toDate) {
      query = {
        query: {
          bool: {
            filter: [{ range: { startAt: { lte: toDate } } }, { range: { endAt: { gte: fromDate } } }],
          },
        },
      };
      value = ["FROMDATE", fromDate, "TODATE", toDate];
    }
    props.setQuery({ query, value });
  }, [fromDate, toDate]);

  return (
    <>
      <DateFilter title="Date de début" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
      <DateFilter title="Date de fin" value={toDate} onChange={(e) => setToDate(e.target.value)} />
    </>
  );
}
