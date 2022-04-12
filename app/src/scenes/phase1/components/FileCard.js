import React from "react";
import FileIcon from "../../../assets/FileIcon";

export default function FileCard({ name, status, filled, icon, correction }) {
  return (
    <section className="bg-gray-50 rounded max-w-[250px] m-2 flex flex-col items-center justify-center">
      <FileIcon filled={filled} icon={icon} />
      <p>{name}</p>
      <p>
        {status} {correction}
      </p>
    </section>
  );
}
