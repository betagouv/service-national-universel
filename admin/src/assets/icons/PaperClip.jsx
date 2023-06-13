import * as React from "react";

const PaperClip = (props) => (
  <svg width={16} height={18} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="m10.644 4.833-5.489 5.489a1.667 1.667 0 1 0 2.357 2.357l5.346-5.489a3.333 3.333 0 0 0-4.714-4.714L2.798 7.964a5 5 0 1 0 7.072 7.072l5.214-5.203"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PaperClip;
