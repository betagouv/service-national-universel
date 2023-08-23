import * as React from "react";
const Clipboard = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={1.5}
      d="M11.25 6.25h-2.5a2.5 2.5 0 0 0-2.5 2.5v15a2.5 2.5 0 0 0 2.5 2.5h12.5a2.5 2.5 0 0 0 2.5-2.5v-15a2.5 2.5 0 0 0-2.5-2.5h-2.5m-7.5 0a2.5 2.5 0 0 0 2.5 2.5h2.5a2.5 2.5 0 0 0 2.5-2.5m-7.5 0a2.5 2.5 0 0 1 2.5-2.5h2.5a2.5 2.5 0 0 1 2.5 2.5M15 15h3.75M15 20h3.75m-7.5-5h.012m-.012 5h.012"
    />
  </svg>
);
export default Clipboard;
