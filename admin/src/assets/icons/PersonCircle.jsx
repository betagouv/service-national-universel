import * as React from "react";

export const PersonCircle = (props) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="48" height="48" rx="24" fill="#F3F4F6" />
    <path
      d="M24 22.8C25.9882 22.8 27.6 21.1882 27.6 19.2C27.6 17.2118 25.9882 15.6 24 15.6C22.0118 15.6 20.4 17.2118 20.4 19.2C20.4 21.1882 22.0118 22.8 24 22.8Z"
      fill="#111827"
    />
    <path d="M15.6 33.6C15.6 28.9608 19.3608 25.2 24 25.2C28.6392 25.2 32.4 28.9608 32.4 33.6H15.6Z" fill="#111827" />
  </svg>
);
