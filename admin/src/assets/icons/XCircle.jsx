import * as React from "react";

const XCircle = (props) => (
  <svg width={18} height={18} fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16.5 9a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" fill="#fff" />
    <path
      d="M7.333 10.667 9 9m0 0 1.667-1.667M9 9 7.333 7.333M9 9l1.667 1.667M16.5 9a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default XCircle;
