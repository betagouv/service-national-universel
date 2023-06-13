import * as React from "react";

const Eye = (props) => (
  <svg width={22} height={16} viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M14 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M1.458 8C2.733 3.943 6.523 1 11 1c4.478 0 8.268 2.943 9.543 7-1.275 4.057-5.065 7-9.542 7-4.478 0-8.268-2.943-9.543-7Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Eye;
