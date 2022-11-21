import React from "react";
import note from "../../../../../assets/note.svg";

const NoteIcon = ({ onClick, className }) => {
  return (
    <img
      className={`cursor-pointer ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      src={note}
      alt="icon button"
    />
  );
};

export default NoteIcon;
