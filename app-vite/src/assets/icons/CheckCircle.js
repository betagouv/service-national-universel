import * as React from "react";

const CheckCircle = (props) => (
  <svg width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8 15.2A7.2 7.2 0 1 0 8 .8a7.2 7.2 0 0 0 0 14.4Zm3.336-8.364a.9.9 0 1 0-1.273-1.272L7.1 8.527 5.936 7.364a.9.9 0 1 0-1.273 1.272l1.8 1.8a.9.9 0 0 0 1.273 0l3.6-3.6Z"
      fill="currentColor"
    />
  </svg>
);

export default CheckCircle;
