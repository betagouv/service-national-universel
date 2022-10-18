import React from "react";
import YoungHeader from "./components/YoungHeader";

export default function VolontairePhase0View({ young, onChange }) {
  return (
    <>
      <YoungHeader young={young} tab="file" onChange={onChange} />
      <div className="p-[30px]">
        <h1>Phase 0 View : {young.firstName}</h1>
      </div>
    </>
  );
}
