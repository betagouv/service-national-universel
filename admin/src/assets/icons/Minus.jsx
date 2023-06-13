import * as React from "react";

const SvgComponent = (props) => (
  <svg width={10} height={2} viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 1H1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default SvgComponent;
