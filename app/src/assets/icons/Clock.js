import * as React from "react";

const Clock = (props) => (
  <svg width={10} height={10} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 9.8A4.8 4.8 0 1 0 5 .2a4.8 4.8 0 0 0 0 9.6Zm.6-7.2a.6.6 0 1 0-1.2 0V5a.6.6 0 0 0 .175.424l1.697 1.698a.6.6 0 0 0 .849-.849L5.599 4.752V2.6Z"
      fill="currentColor"
    />
  </svg>
);

export default Clock;
