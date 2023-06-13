import * as React from "react";

const Calendar = (props) => (
  <svg width={14} height={14} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M4.333 3.667V1m5.334 2.667V1m-6 5.333h6.666m-8 6.667h9.334c.736 0 1.333-.597 1.333-1.333v-8c0-.737-.597-1.334-1.333-1.334H2.333C1.597 2.333 1 2.93 1 3.667v8C1 12.403 1.597 13 2.333 13Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Calendar;
