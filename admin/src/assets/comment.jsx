import React from "react";

const Comment = ({ stroke }) => {
  return (
    <svg height="12" width="14" fill="none" viewBox="0 0 14 12" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3.66667 3.33268H10.3333M3.66667 5.99935H6.33333M7 11.3327L4.33333 8.66602H2.33333C1.59695 8.66602 1 8.06906 1 7.33268V1.99935C1 1.26297 1.59695 0.666016 2.33333 0.666016H11.6667C12.403 0.666016 13 1.26297 13 1.99935V7.33268C13 8.06906 12.403 8.66602 11.6667 8.66602H9.66667L7 11.3327Z"
        stroke={stroke || "#4B5563"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Comment;
