import React from "react";

export default function IconButton({ icon, bgColor, onClick, buttonsLoading, ...rest }) {
  return (
    <button {...rest} className={` ${bgColor} rounded-full p-2 w-9 h-9 hover:shadow-md flex justify-center items-center m-1`} loading={buttonsLoading} onClick={onClick}>
      <img src={icon} alt="icon button" />
    </button>
  );
}
