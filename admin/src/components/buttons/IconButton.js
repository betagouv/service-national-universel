import React from "react";
import Download from "../../assets/Download";

export default function IconButton({ icon, value, name, bgColor, onClick, buttonsLoading, ...rest }) {
  return (
    <button
      {...rest}
      value={value}
      name={name}
      className={` ${bgColor} rounded-full p-2 w-9 h-9 hover:shadow-md flex justify-center items-center m-1`}
      loading={buttonsLoading}
      onClick={onClick}>
      {icon ? <img src={icon} alt="icon button" /> : <Download />}
    </button>
  );
}
