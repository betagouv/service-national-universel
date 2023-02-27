import * as React from "react";

const ChevronDown = (props) => (
  <svg width={10} height={6} viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M.293.293a1 1 0 0 1 1.414 0L5 3.586 8.293.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414Z"
      fill="currentColor"
    />
  </svg>
);

export default ChevronDown;
