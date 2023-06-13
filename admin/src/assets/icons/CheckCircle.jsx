import * as React from "react";

const CheckCircle = (props) => (
  <svg width={18} height={18} fill="none" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M16.5 9a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" fill="#fff" />
    <path d="m6.5 9 1.667 1.667L11.5 7.333M16.5 9a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default CheckCircle;
