import * as React from "react";

const SvgComponent = (props) => (
  <svg width={39} height={39} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M21.5 5.5h-16a4 4 0 0 0-4 4v20m0 0v4a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4v-8m-32 4 9.172-9.172a4 4 0 0 1 5.656 0L21.5 25.5m12-8v8m0 0-3.172-3.172a4 4 0 0 0-5.656 0L21.5 25.5m0 0 4 4m4-24h8m-4-4v8m-12 4h.02"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke="currentColor"
    />
  </svg>
);

export default SvgComponent;
