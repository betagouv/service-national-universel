import React from "react";

export default function Envelop({ color = "#DBEAFE", ...props }) {
  return (
    <svg {...props} width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.333 11.333v.833a2.5 2.5 0 002.5 2.5h8.334a2.5 2.5 0 002.5-2.5v-.833M11.333 8L8 11.333m0 0L4.667 8M8 11.333v-10"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
