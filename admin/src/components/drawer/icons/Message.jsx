import * as React from "react";
const Message = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      d="M6.417 7.334h9.166M6.417 11h3.666M11 18.334l-3.667-3.667h-2.75a1.833 1.833 0 0 1-1.833-1.833V5.5c0-1.012.82-1.833 1.833-1.833h12.834c1.012 0 1.833.82 1.833 1.833v7.334c0 1.012-.82 1.833-1.833 1.833h-2.75L11 18.334Z"
    />
  </svg>
);
export default Message;
