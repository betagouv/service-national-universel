import React from "react";
import FileIcon from "../../../assets/FileIcon";

export default function FileCard({ name, status, filled, icon, color, onClick, tw, description }) {
  return (
    <section className={`basis-1/4 bg-gray-50 rounded-lg m-2 text-center flex flex-col items-center justify-center p-4 ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section className="min-h-[52px]">
        <p className="text-base font-bold mt-2">{name}</p>
        {description ? <p className="ttext-xs leading-4 font-normal mt-1">{description}</p> : null}
      </section>
      <button className={`${color} border-[1px] border-blue-600 rounded-md px-4 py-1.5 mt-3 justify-self-end`} onClick={onClick}>
        {status}
      </button>
    </section>
  );
}
