import React from "react";
import FileIcon from "../../../assets/FileIcon";

export default function FileCard({ name, status, filled, icon, color, onClick, tw }) {
  return (
    <section className={`bg-gray-50 rounded-lg min-w-[300px] max-w-[300px] m-2 text-center flex flex-col items-center justify-center p-4 ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section className="min-h-[52px]">
        <p className="text-base font-bold mt-2">{name}</p>
        <div className="text-sm relative flex items-center justify-center">
          {["Validé", "En attente de correction"].includes(status) ? <p className="mr-1.5">{status}</p> : null}{" "}
        </div>
      </section>
      <button className={`${color} border-[1px] border-blue-600 rounded-md px-4 py-1.5 mt-3 justify-self-end`} onClick={onClick}>
        {status === "En attente de correction" ? "À corriger" : status === "Validé" ? "Voir" : status}
      </button>
    </section>
  );
}
