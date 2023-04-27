import React from "react";
import Download from "../../assets/Download";

export default function IconButton({ icon, value, name, bgColor, onClick, buttonsLoading, ...rest }) {
  return (
    <button
      {...rest}
      value={value}
      name={name}
      className={` ${bgColor} m-1 flex h-9 w-9 items-center justify-center rounded-full p-2 hover:shadow-md`}
      loading={buttonsLoading}
      onClick={onClick}>
      {icon ? <img src={icon} alt="icon button" /> : <Download />}
    </button>
  );
}
