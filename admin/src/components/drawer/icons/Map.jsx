import * as React from "react";
const Map = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m11.25 25-6.809-3.404a1.25 1.25 0 0 1-.691-1.119V7.023c0-.93.978-1.534 1.809-1.118L11.25 8.75m0 16.25 7.5-3.75M11.25 25V8.75m7.5 12.5 5.691 2.846a1.25 1.25 0 0 0 1.809-1.119V9.523a1.25 1.25 0 0 0-.691-1.118L18.75 5m0 16.25V5m0 0-7.5 3.75"
    />
  </svg>
);
export default Map;
