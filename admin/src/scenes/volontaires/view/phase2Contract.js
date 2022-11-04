import React from "react";
import Contract from "../../../components/Contract";
import YoungHeader from "../../phase0/components/YoungHeader";

export default function Phase2Contract({ young, onChange }) {
  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />
      <div className="p-[30px]">
        <Contract young={young} admin={true} />
      </div>
    </>
  );
}
