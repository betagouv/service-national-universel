import * as React from "react";
const Location = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" {...props}>
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
      <path d="m22.071 20.821-5.658 5.659a1.997 1.997 0 0 1-2.826 0c-1.648-1.65-4.318-4.319-5.658-5.659-3.905-3.905-3.905-10.237 0-14.142 3.905-3.905 10.237-3.905 14.142 0 3.905 3.905 3.905 10.237 0 14.142Z" />
      <path d="M18.75 13.75A3.75 3.75 0 1 1 15 10c2.071 0 3.75 1.679 3.7-5" />
    </g>
  </svg>
);
export default Location;
