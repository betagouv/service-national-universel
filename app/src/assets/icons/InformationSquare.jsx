import * as React from "react";

const InformationSquare = ({ size = "14", fill = "#0063CB", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0003 0.666992H2.00033C1.26395 0.666992 0.666992 1.26395 0.666992 2.00033V12.0003C0.666992 12.7367 1.26395 13.3337 2.00033 13.3337H12.0003C12.7367 13.3337 13.3337 12.7367 13.3337 12.0003V2.00033C13.3337 1.26395 12.7367 0.666992 12.0003 0.666992ZM7.66699 3.66699H6.33366V5.00033H7.66699V3.66699ZM7.66699 6.33366H6.33366V10.3337H7.66699V6.33366Z"
      fill={fill}
    />
  </svg>
);

export default InformationSquare;
