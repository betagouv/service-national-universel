import React from "react";
import FileIcon from "../../../assets/FileIcon";

export default function FileCard({ name, status, filled, icon, correction, bgColor, onClick }) {
  return (
    <section className="bg-gray-50 rounded-lg min-w-[230px] max-w-[250px] m-2 flex flex-col items-center justify-center p-4">
      <FileIcon filled={filled} icon={icon} />
      <p>{name}</p>
      <p>
        {status} {correction}
      </p>
      <button className={`${bgColor} border-2 border-indigo-700 rounded px-4 py-2.5`} onClick={onClick}>
        {status}
      </button>
    </section>
  );
}
