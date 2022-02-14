import { useState } from "react";
import { forSearch } from "../utils/material-icons";
import Modal from "./Modal";

const IconsPicker = ({ isOpen, onRequestClose, onSelect }) => {
  const [search, setSearch] = useState("");

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="overflow-hidden">
        <div className="flex h-full w-screen-3/4 flex-shrink  flex-col overflow-hidden">
          <input onChange={(e) => setSearch(e.target.value)} className="mb-2 w-full shrink-0 border-2 p-2" placeholder="Rechercher..." />
          <div className="flex-shrink flex-grow overflow-auto">
            <div className="flex-shrink flex-grow overflow-auto">
              {forSearch
                .filter(({ synonyms, icon }) => icon.includes(search) || synonyms.includes(search))
                .map(({ icon }) => (
                  <RedIcon icon={icon} key={icon} onSelect={() => onSelect(icon)} showText />
                ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export const RedIcon = ({ icon, onSelect, showText, className }) => (
  <div
    key={icon}
    className={`my-5 mx-10 inline-flex w-12 flex-col items-center justify-center ${!!onSelect ? "cursor-pointer" : ""} ${className || ""}`}
    onClick={() => onSelect?.(icon)}
  >
    <span className={`material-icons mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-red-600 text-center text-2xl text-white`}>{icon}</span>
    {!!showText && <span className={`align-text-bottom text-xs`}>{icon}</span>}
  </div>
);

export default IconsPicker;
