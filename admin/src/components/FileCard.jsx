import React from "react";
import FileIcon from "../assets/FileIcon";
import Download from "../assets/icons/Download";

export default function FileCard({ name, filled, icon, onClick, tw, description }) {
  return (
    <section className={`m-2 flex basis-1/4 flex-col items-center justify-center rounded-lg bg-gray-50 p-4 text-center ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section className="min-h-[52px]">
        <p className="mt-2 text-base font-bold">{name}</p>
        {description ? <p className="ttext-xs mt-1 font-normal leading-4">{description}</p> : null}
      </section>
      <div className="mt-2 flex w-full flex-col items-end justify-end px-7">
        <div className="flex cursor-pointer items-center justify-center rounded-full bg-blue-600 p-2 transition duration-150 ease-out hover:scale-110 hover:ease-in">
          <Download className=" bg-blue-600 text-indigo-100 " onClick={() => onClick()} />
        </div>
      </div>
    </section>
  );
}
