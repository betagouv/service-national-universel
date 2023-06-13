import * as React from "react";

const LocationMarker = (props) => (
  <svg width={14} height={16} viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="m11.243 11.493-2.83 2.829a1.999 1.999 0 0 1-2.827 0l-2.829-2.83a6 6 0 1 1 8.486 0Z"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9.25 7.25a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default LocationMarker;
