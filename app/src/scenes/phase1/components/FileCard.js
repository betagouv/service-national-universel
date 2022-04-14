import React, { useState } from "react";
import FileIcon from "../../../assets/FileIcon";
import styled from "styled-components";

export default function FileCard({ name, status, filled, icon, correction, color, onClick, tw }) {
  const [isShown, setIsShown] = useState(false);
  return (
    <section className={`bg-gray-50 rounded-lg min-w-[230px] max-w-[250px] m-2 flex flex-col items-center justify-center p-4 ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section className="min-h-[52px]">
        <p className="text-base font-bold mt-2">{name}</p>
        <div className="text-sm relative flex items-center">
          {["Validé", "En attente de correction"].includes(status) ? <p className="mr-1.5">{status}</p> : null}{" "}
          {status === "En attente de correction" && (
            <>
              {/* Popover fait maison, trop aléatoire -> prévoir un autre affichage */}
              {/* <ScrollSection
                onMouseEnter={() => setIsShown(true)}
                onMouseLeave={() => setIsShown(false)}
                className={`${isShown ? "block" : "hidden"} absolute z-50 bg-white p-4 top-[-157px] right-[-60px] h-[160px] w-[360px] overflow-y-auto rounded-lg shadow`}>
                <p>
                  <strong>Correction à apporter :</strong>
                </p>
                <p>{correction}</p>
                <div className="relative">
                  <svg className="absolute bottom-[-60px] right-0" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.5 11L11 0L9.53674e-07 -4.80825e-07L5.5 11Z" fill="red" />
                  </svg>
                </div>
              </ScrollSection> */}

              <svg
                onMouseEnter={() => setIsShown(true)}
                onMouseLeave={() => setIsShown(false)}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.25 4.25H8.75V5.75H7.25V4.25ZM7.25 7.25H8.75V11.75H7.25V7.25ZM8 0.5C3.86 0.5 0.5 3.86 0.5 8C0.5 12.14 3.86 15.5 8 15.5C12.14 15.5 15.5 12.14 15.5 8C15.5 3.86 12.14 0.5 8 0.5ZM8 14C4.6925 14 2 11.3075 2 8C2 4.6925 4.6925 2 8 2C11.3075 2 14 4.6925 14 8C14 11.3075 11.3075 14 8 14Z"
                  fill="#9CA3AF"
                />
              </svg>
            </>
          )}
        </div>
      </section>
      <button className={`${color} border-2 border-indigo-700 rounded-md px-4 py-1.5 mt-3 justify-self-end`} onClick={onClick}>
        {status === "En attente de correction" ? "À corriger" : status === "Validé" ? "Voir" : status}
      </button>
    </section>
  );
}
