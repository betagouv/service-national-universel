import * as React from "react";

const SvgComponent = (props) => (
  <svg width={14} height={13} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M0 12h14v1H0v-1ZM11.7 3.5c.4-.4.4-1 0-1.4L9.9.3c-.4-.4-1-.4-1.4 0L1 7.8V11h3.2l7.5-7.5ZM9.2 1 11 2.8 9.5 4.3 7.7 2.5 9.2 1ZM2 10V8.2l5-5L8.8 5l-5 5H2Z"
      fill="#2D3748"
    />
  </svg>
);

export default SvgComponent;
