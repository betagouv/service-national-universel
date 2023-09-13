import * as React from "react";
const Dashboard = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20 10v10m-5-6.25V20m-5-2.5V20m-2.5 5h15a2.5 2.5 0 0 0 2.5-2.5v-15A2.5 2.5 0 0 0 22.5 5h-15A2.5 2.5 0 0 0 5 7.5v15A2.5 2.5 0 0 0 7.5 25Z"
    />
  </svg>
);
export default Dashboard;
