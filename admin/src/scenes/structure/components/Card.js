import React from "react";

const Card = ({ onClick, children, className }) => {
  return (
    <div onClick={onClick} className={`rounded-xl bg-white shadow-sm hover:cursor-pointer hover:scale-105 transition ${className}`}>
      {children}
    </div>
  );
};

export default Card;
