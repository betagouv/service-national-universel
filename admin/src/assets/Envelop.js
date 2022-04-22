import React from "react";

export default function Envelop({ color = "#60A5FA" }) {
  return (
    <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1 3.3335L6.2604 6.84043C6.70827 7.13901 7.29173 7.13901 7.7396 6.84043L13 3.3335M2.33333 10.6668H11.6667C12.403 10.6668 13 10.0699 13 9.3335V2.66683C13 1.93045 12.403 1.3335 11.6667 1.3335H2.33333C1.59695 1.3335 1 1.93045 1 2.66683V9.3335C1 10.0699 1.59695 10.6668 2.33333 10.6668Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
