import React from "react";
import ReactTooltip from "react-tooltip";

import note from "../../../../../assets/note.svg";

const NoteIcon = ({ onClick, className, id = "info" }) => {
  return (
    <div>
      <ReactTooltip id={id} className="bg-white shadow-xl" arrowColor="white">
        <div className="cursor-pointer text-[#4B5563] hover:text-[#2563EB]">Voir la note interne</div>
      </ReactTooltip>
      <img
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        data-tip
        data-for={id}
        className={`cursor-pointer ${className}`}
        src={note}
        alt="icon button"
      />
    </div>
  );
};

export default NoteIcon;
