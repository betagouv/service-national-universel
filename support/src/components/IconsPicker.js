import { useState } from "react";
import { forSearch } from "../utils/material-icons";
import Modal from "./Modal";

const IconsPicker = ({ isOpen, onRequestClose, onSelect }) => {
  const [search, setSearch] = useState("");

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose}>
      <div className="overflow-hidden">
        <div className="w-screen-3/4 overflow-hidden flex flex-col  h-full flex-shrink">
          <input onChange={(e) => setSearch(e.target.value)} className="p-2 border-2 mb-2 w-full flex-shrink-0" placeholder="Rechercher..." />
          <div className="overflow-auto flex-grow flex-shrink">
            <div className="overflow-auto flex-grow flex-shrink">
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
  <div key={icon} className={`flex-col inline-flex w-12 my-5 mx-10 items-center ${!!onSelect ? "cursor-pointer" : ""} ${className || ""}`} onClick={() => onSelect?.(icon)}>
    <span className={`material-icons flex justify-center items-center mb-2 rounded-md text-2xl text-center w-12 h-12 bg-red-600 text-white`}>{icon}</span>
    {!!showText && <span className={`align-text-bottom text-xs`}>{icon}</span>}
  </div>
);

export default IconsPicker;
