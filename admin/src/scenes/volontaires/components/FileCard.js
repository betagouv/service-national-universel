import React from "react";
import FileIcon from "../../../assets/FileIcon";
import { translateFileStatusPhase1 } from "../../../utils";

export default function FileCard({ name, status, icon, color, onClick, children, tw, loading, files, value, onChange }) {
  return (
    <div className="text-center">
      <section className={`bg-gray-50 rounded-lg min-w-[230px] max-w-[250px] m-2 flex flex-col items-center justify-center p-4 ${tw}`}>
        <select disabled={loading} className="form-control" value={value} name="cohesionStayMedical" onChange={onChange}>
          {files?.map((o, i) => (
            <option key={i} value={o.value} label={o.label}>
              {o.label ? o.label : translateFileStatusPhase1(o)}
            </option>
          ))}
        </select>
        <FileIcon icon={icon} />
        <section className="min-h-[52px]">
          <p className="text-base font-bold mt-2">{name}</p>
          <div className="text-sm relative flex items-center">
            {["Validé", "En attente de correction", "Non Téléchargée"].includes(status) ? <p className="mr-1.5">{status}</p> : null}{" "}
            {status === "En attente de correction" && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.25 4.25H8.75V5.75H7.25V4.25ZM7.25 7.25H8.75V11.75H7.25V7.25ZM8 0.5C3.86 0.5 0.5 3.86 0.5 8C0.5 12.14 3.86 15.5 8 15.5C12.14 15.5 15.5 12.14 15.5 8C15.5 3.86 12.14 0.5 8 0.5ZM8 14C4.6925 14 2 11.3075 2 8C2 4.6925 4.6925 2 8 2C11.3075 2 14 4.6925 14 8C14 11.3075 11.3075 14 8 14Z"
                  fill="#9CA3AF"
                />
              </svg>
            )}
          </div>
        </section>
        {children}
      </section>
      {["Validé", "En attente de correction", "Non Téléchargée"].includes(status) && (
        <button disabled={loading} className="border rounded-lg m-2 px-4 py-2" onClick={onClick}>
          Relancer le volontaire
        </button>
      )}
    </div>
  );
}
