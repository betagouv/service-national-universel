import * as React from "react";

const Clock = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g opacity="0.8">
      <rect width="32" height="32" rx="16" fill="#F3F4F6" />
      <path
        d="M16 12.6667V16L18.5 18.5M23.5 16C23.5 20.1421 20.1421 23.5 16 23.5C11.8579 23.5 8.5 20.1421 8.5 16C8.5 11.8579 11.8579 8.5 16 8.5C20.1421 8.5 23.5 11.8579 23.5 16Z"
        stroke="#4B5563"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export default Clock;
