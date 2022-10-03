import * as React from "react";

const SvgComponent = (props) => (
  <svg width={20} height={20} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 19.999c-5.523 0-10-4.477-10-10s4.477-10 10-10 10 4.477 10 10-4.477 10-10 10Zm-1-7v2h2v-2H9Zm2-1.645a3.502 3.502 0 0 0-1-6.855 3.501 3.501 0 0 0-3.433 2.813l1.962.393A1.5 1.5 0 1 1 10 9.499a1 1 0 0 0-1 1v1.5h2v-.645Z"
      fill="#000091"
    />
  </svg>
);

export default SvgComponent;
