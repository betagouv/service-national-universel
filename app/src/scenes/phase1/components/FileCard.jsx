import React from "react";
import FileIcon from "../../../assets/FileIcon";

export default function FileCard({ name, status, filled, icon, color, onClick, tw }) {
  return (
    <section className={`flex min-w-[230px] max-w-[250px] flex-col items-center justify-center rounded-lg bg-gray-50 p-4 text-center ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section className="min-h-[52px]">
        <p className="mt-2 text-base font-bold">{name}</p>
        <div className="relative flex items-center justify-center text-sm">
          {["Validé", "En attente de correction"].includes(status) ? <p className="mr-1.5">{status}</p> : null}{" "}
        </div>
      </section>
      <button className={`${color} mt-3 justify-self-end rounded-md border-[1px] border-indigo-600 px-4 py-1.5`} onClick={onClick}>
        {status === "En attente de correction" ? "À corriger" : status === "Validé" ? "Voir" : status}
      </button>
    </section>
  );
}
