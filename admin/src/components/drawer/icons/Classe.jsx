import React from "react";

export default function Classe(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={30} height={30} fill="none" {...props}>
      <path
        d="M23.75 26.25V6.25C23.75 4.86929 22.6307 3.75 21.25 3.75H8.75C7.36929 3.75 6.25 4.86929 6.25 6.25V26.25M23.75 26.25L26.25 26.25M23.75 26.25H17.5M6.25 26.25L3.75 26.25M6.25 26.25H12.5M11.25 8.74997H12.5M11.25 13.75H12.5M17.5 8.74997H18.75M17.5 13.75H18.75M12.5 26.25V20C12.5 19.3096 13.0596 18.75 13.75 18.75H16.25C16.9404 18.75 17.5 19.3096 17.5 20V26.25M12.5 26.25H17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
