import * as React from "react";
const Flag = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.75 26.25v-5m0 0v-15a2.5 2.5 0 0 1 2.5-2.5h8.125L15.625 5H26.25l-3.75 7.5 3.75 7.5H15.625l-1.25-1.25H6.25a2.5 2.5 0 0 0-2.5 2.5ZM15 4.375v6.875"
    />
  </svg>
);
export default Flag;
