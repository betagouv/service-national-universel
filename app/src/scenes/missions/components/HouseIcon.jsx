import React from "react";
import ReactTooltip from "react-tooltip";

export default function House({ color, tooltip, id }) {
  return (
    <div data-tip="" data-for={id ? id : tooltip}>
      {tooltip ? (
        <ReactTooltip id={id ? id : tooltip} className="bg-white text-black shadow-xl" arrowColor="white" disable={false}>
          <div className="text-[black]">{tooltip}</div>
        </ReactTooltip>
      ) : null}

      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 7L2.33333 5.66667M2.33333 5.66667L7 1L11.6667 5.66667M2.33333 5.66667V12.3333C2.33333 12.7015 2.63181 13 3 13H5M11.6667 5.66667L13 7M11.6667 5.66667V12.3333C11.6667 12.7015 11.3682 13 11 13H9M5 13C5.36819 13 5.66667 12.7015 5.66667 12.3333V9.66667C5.66667 9.29848 5.96514 9 6.33333 9H7.66667C8.03486 9 8.33333 9.29848 8.33333 9.66667V12.3333C8.33333 12.7015 8.63181 13 9 13M5 13H9"
          stroke={color}
        />
      </svg>
    </div>
  );
}
