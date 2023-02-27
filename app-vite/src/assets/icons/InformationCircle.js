import * as React from "react";

const InformationCircle = (props) => (
  <svg width={16} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0ZM9 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7 7a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2V8a1 1 0 0 0-1-1H7Z"
      fill="currentColor"
    />
  </svg>
);

export default InformationCircle;
