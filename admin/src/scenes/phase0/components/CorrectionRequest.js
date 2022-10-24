import { MiniTitle } from "./commons";
import Bin from "../../../assets/Bin";
import React, { useEffect, useState } from "react";

export default function CorrectionRequest({ name, label, correctionRequest, onChangeRequest, reasons }) {
  const [requestText, setRequestText] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [reasonOptions, setReasonOptions] = useState([]);

  useEffect(() => {
    if (correctionRequest ? correctionRequest.status !== "CANCELED" : false) {
      setRequestText(correctionRequest.message);
      setRequestReason(correctionRequest.reason);
    } else {
      setRequestText("");
      setRequestReason("");
    }
  }, [correctionRequest]);

  useEffect(() => {
    if (reasons && reasons.length > 0) {
      setReasonOptions([{ value: "", label: "Motif" }, ...reasons]);
      if (!reasons.find((r) => r.value === requestReason)) {
        setRequestReason("");
      }
    } else {
      setReasonOptions([]);
    }
  }, [reasons]);

  function changeText(event) {
    onChangeRequest && onChangeRequest(name, event.target.value, requestReason);
  }

  function changeReason(event) {
    onChangeRequest && onChangeRequest(name, requestText, event.target.value);
  }

  function deleteRequest() {
    onChangeRequest && onChangeRequest(name, null, null);
  }

  return (
    <div className="p-[24px] bg-[#F9FAFB] rounded-[7px] my-[16px]">
      <MiniTitle>Demander une correction - {label}</MiniTitle>
      {reasons && reasons.length > 0 && (
        <select value={requestReason} onChange={changeReason} className="w-[100%] bg-white border-[#D1D5DB] border-[1px] rounded-[6px] p-[15px]">
          {reasonOptions}
        </select>
      )}
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
