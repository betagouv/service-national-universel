import React from "react";
import FileIcon from "../assets/FileIcon";
import Download from "../assets/icons/Download";

export default function FileCard({ name, filled, icon, onClick, tw, description }) {
  return (
    <section className={`basis-1/4 bg-gray-50 rounded-lg m-2 text-center flex flex-col items-center justify-center p-4 ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section className="min-h-[52px]">
        <p className="text-base font-bold mt-2">{name}</p>
        {description ? <p className="ttext-xs leading-4 font-normal mt-1">{description}</p> : null}
      </section>
      <div className="flex flex-col w-full justify-end items-end px-7 mt-2">
        <div className="transition duration-150 flex rounded-full bg-blue-600 p-2 items-center justify-center hover:scale-110 ease-out hover:ease-in cursor-pointer">
          <Download className=" text-indigo-100 bg-blue-600 " onClick={() => onClick()} />
        </div>
      </div>
    </section>
  );
}
