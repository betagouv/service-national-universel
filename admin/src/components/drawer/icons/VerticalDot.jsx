import * as React from "react";
const VericalDot = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9.999 4.166v.009m0 5.825v.008m0 5.825v.008M9.999 5a.833.833 0 1 1 0-1.667.833.833 0 0 1 0 1.667Zm0 5.833a.833.833 0 1 1 0-1.667.833.833 0 0 1 0 1.667Zm0 5.833a.833.833 0 1 1 0-1.666.833.833 0 0 1 0 1.666Z"
    />
  </svg>
);
export default VericalDot;
