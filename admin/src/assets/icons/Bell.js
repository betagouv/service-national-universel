import * as React from "react";

const Bell = (props) => (
  <svg width={12} height={14} fill="none" viewBox="0 0 12 14" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M8 10.333h3.333l-.936-.936A1.354 1.354 0 0 1 10 8.439V6.333a4.002 4.002 0 0 0-2.667-3.772v-.228a1.333 1.333 0 1 0-2.666 0v.228A4.002 4.002 0 0 0 2 6.333V8.44c0 .36-.143.704-.397.958l-.936.936H4m4 0V11a2 2 0 1 1-4 0v-.667m4 0H4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Bell;
