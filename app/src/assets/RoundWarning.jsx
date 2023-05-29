import * as React from "react";

const SvgComponent = (props) => (
  <svg width={48} height={48} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M0 24C0 10.745 10.745 0 24 0s24 10.745 24 24-10.745 24-24 24S0 37.255 0 24Z" fill={props.backgroundColor || "#FEE2E2"} />
    <path
      d="M24 21v2m0 4h.01m-6.939 4h13.857c1.54 0 2.502-1.667 1.732-3l-6.928-12c-.77-1.333-2.695-1.333-3.465 0L15.34 28c-.77 1.333.193 3 1.732 3Z"
      stroke={props.borderColor || "#DC2626"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SvgComponent;
