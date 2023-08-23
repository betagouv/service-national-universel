import * as React from "react";
const Globe = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3.819 13.75H6.25a2.5 2.5 0 0 1 2.5 2.5v1.25a2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 1 2.5 2.5v3.681M10 4.92v1.956C10 8.601 11.4 10 13.125 10h.625a2.5 2.5 0 0 1 2.5 2.5 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 1 2.5-2.5h1.33m-6.33 15.61V22.5a2.5 2.5 0 0 1 2.5-2.5h3.83m1.17-5c0 6.213-5.037 11.25-11.25 11.25S3.75 21.213 3.75 15 8.787 3.75 15 3.75 26.25 8.787 26.25 15Z"
    />
  </svg>
);
export default Globe;
