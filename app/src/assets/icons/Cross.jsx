import * as React from "react";

const Check = ({ size = "16", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.00048 7.05781L11.3005 3.75781L12.2431 4.70048L8.94315 8.00048L12.2431 11.3005L11.3005 12.2431L8.00048 8.94315L4.70048 12.2431L3.75781 11.3005L7.05781 8.00048L3.75781 4.70048L4.70048 3.75781L8.00048 7.05781Z"
      fill="currentColor"
    />
  </svg>
);

export default Check;
