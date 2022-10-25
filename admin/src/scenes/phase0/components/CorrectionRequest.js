import { MiniTitle } from "./commons";
import Bin from "../../../assets/Bin";
import React, { useEffect, useState } from "react";
import ChevronDown from "../../../assets/icons/ChevronDown";

export default function CorrectionRequest({ name, label, correctionRequest, onChangeRequest, reasons, messagePlaceholder }) {
  const [requestText, setRequestText] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [reasonOptions, setReasonOptions] = useState([]);

  useEffect(() => {
    if (correctionRequest ? correctionRequest.status !== "CANCELED" : false) {
      setRequestText(correctionRequest.message);
      setRequestReason(correctionRequest.reason && correctionRequest.reason !== "" ? correctionRequest.reason : "");
    } else {
      setRequestText("");
      setRequestReason("");
    }
  }, [correctionRequest]);

  useEffect(() => {
    if (reasons && reasons.length > 0) {
      setReasonOptions([
        <option value="" key="none" disabled>
          Motif
        </option>,
        ...reasons.map((r) => (
          <option value={r.value} key={r.value}>
            {r.label}
          </option>
        )),
      ]);
    } else {
      setReasonOptions([
        <option value="" key="none" disabled>
          Motif
        </option>,
      ]);
      setRequestReason("");
    }
  }, [reasons, requestReason]);

  function changeText(event) {
    onChangeRequest && onChangeRequest(name, event.target.value, requestReason);
  }

  function changeReason(event) {
    let newText = requestText;
    if (reasons) {
      const choosenReason = reasons.find((r) => r.value === event.target.value);
      if (requestText === "" && choosenReason && choosenReason.defaultMessage) {
        newText = choosenReason.defaultMessage;
      }
    }
    onChangeRequest && onChangeRequest(name, newText, event.target.value);
  }

  function deleteRequest() {
    onChangeRequest && onChangeRequest(name, null, null);
  }

  return (
    <div className="p-[24px] bg-[#F9FAFB] rounded-[7px] my-[16px]">
      <MiniTitle>Demander une correction - {label}</MiniTitle>
      {reasons && reasons.length > 0 && (
        <div className="w-[100%] bg-white border-[#D1D5DB] border-[1px] rounded-[6px] mb-[16px] flex items-center pr-[15px]">
          <select value={requestReason} onChange={changeReason} className="grow p-[15px] bg-[transparent] appearance-none">
            {reasonOptions}
          </select>
          <ChevronDown className="flex-[0_0_16px] text-[#6B7280]" />
        </div>
      )}
      <textarea
        value={requestText}
        onChange={changeText}
        className="w-[100%] bg-white border-[#D1D5DB] border-[1px] rounded-[6px] p-[15px]"
        rows="5"
        placeholder={messagePlaceholder}
      />
      <div className="text-right mt-[16px]">
        <button className="text-[12px] text-[#F87171] ml-[6px] flex items-center" onClick={deleteRequest}>
          <Bin fill="#F87171" />
          Supprimer la demande
        </button>
      </div>
    </div>
  );
}
