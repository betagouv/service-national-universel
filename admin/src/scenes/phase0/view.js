import React from "react";
import YoungView from "../volontaires/view/wrapper";
import YoungHeader from "./components/YoungHeader";

export default function VolontairePhase0View({ young, onChange }) {
  return (
    <>
      <YoungHeader young={young} tab="file" onChange={onChange} />
      <h1>Phase 0 View : {young.firstName}</h1>
    </>
  );
}
