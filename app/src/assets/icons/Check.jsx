import * as React from "react";

const Check = (props) => (
  <svg width={12} height={10} viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="m.75 5.75 3 3 7.5-7.5" stroke="currentColor" strokeWidth={props.strokeWidth || 1.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default Check;
