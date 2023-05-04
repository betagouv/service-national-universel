import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import DatePicker from "../../../ui/forms/DatePicker";

export default function DateFilter(props) {
  const [date, setDate] = useState("");
  const isFirstRun = useRef(true);

  useEffect(() => {
    let length = props.value?.length || 0;
    if (length > 0) setDate(props.value[0]);
    else setDate(undefined);
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (props.value === null) {
      setDate(undefined);
    } else {
      let length = props.value?.length || 0;
      if (length > 0) setDate(props.value[0]);
      else setDate(undefined);
    }
  }, [props.value]);

  return (
    <>
      <DatePicker value={date} onChange={(e) => (e ? props.setValue([dayjs(e).format("YYYY/MM/DD")]) : [])} fromYear={2019} toYear={2025} />
    </>
  );
}
