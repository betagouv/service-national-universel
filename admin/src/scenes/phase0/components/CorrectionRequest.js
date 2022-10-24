import { MiniTitle } from "./commons";
import Bin from "../../../assets/Bin";
import React, { useEffect, useState } from "react";

export default function CorrectionRequest({ name, label, correctionRequest, onChangeRequest }) {
  const [requestText, setRequestText] = useState("");

  useEffect(() => {
    if (correctionRequest ? correctionRequest.status !== "CANCELED" : false) {
      setRequestText(correctionRequest.message);
    } else {
      setRequestText("");
    }
  }, [correctionRequest]);

  function changeText(event) {
    onChangeRequest && onChangeRequest(name, event.target.value);
  }

  function deleteRequest() {
    onChangeRequest && onChangeRequest(name, null);
  }

  return (
    <div className="p-[24px] bg-[#F9FAFB] rounded-[7px] my-[16px]">
      <MiniTitle>Demander une correction - {label}</MiniTitle>
      <textarea value={requestText} onChange={changeText} className="w-[100%] bg-white border-[#D1D5DB] border-[1px] rounded-[6px] p-[15px]" rows="5" />
      <div className="text-right mt-[16px]">
        <button className="text-[12px] text-[#F87171] ml-[6px] flex items-center" onClick={deleteRequest}>
          <Bin fill="#F87171" />
          Supprimer la demande
        </button>
      </div>
    </div>
  );
}
