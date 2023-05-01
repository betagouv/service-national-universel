import React from "react";
import FileIcon from "../../../assets/FileIcon";

export default function FileCard({ name, status, filled, icon, color, onClick, tw, description }) {
  return (
    <section className={`m-2  flex flex-col items-center justify-center rounded-lg bg-gray-50 p-4 text-center md:w-1/4 md:!basis-1/4 ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section className="min-h-[52px]">
        <p className="mt-2 text-base font-bold">{name}</p>
        {description ? <p className="mt-1 text-xs font-normal leading-4">{description}</p> : null}
      </section>
      <button className={`${color} mt-3 justify-self-end rounded-md border-[1px] border-blue-600 px-4 py-1.5`} onClick={onClick}>
        {status}
      </button>
    </section>
  );
}
