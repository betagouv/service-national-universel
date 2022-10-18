import React from "react";
import PencilAlt from "../../../assets/icons/PencilAlt";

export default function Field({ name, label, value, onChange, className = "" }) {
  return (
    <div className={`${className}`} key={name}>
      <label htmlFor={name}>{label}</label>
      <div className="">{value}</div>
      <div className=""><PencilAlt /></div>
    </div>
  );
}

