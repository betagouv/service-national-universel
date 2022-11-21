import React from "react";
import ReactTooltip from "react-tooltip";

import note from "../../../../../assets/note.svg";

const NoteIcon = ({ onClick, className, id = "info" }) => {
  return (
    <div>
      <ReactTooltip delayHide={3000} clickable={true} id={id} className="bg-white shadow-xl" arrowColor="white">
        <div
          className="text-[#4B5563] cursor-pointer hover:text-[#2563EB]"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}>
          Voir la note interne
        </div>
      </ReactTooltip>
      <img data-tip data-for={id} className={`cursor-pointer ${className}`} src={note} alt="icon button" />
    </div>
  );
};

export default NoteIcon;
