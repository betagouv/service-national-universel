import React, { useEffect, useState } from "react";

import Bin from "@/assets/Bin";
import ChevronDown from "@/assets/icons/ChevronDown";
import dayjs from "@/utils/dayjs.utils";

import { MiniTitle } from "./commons/MiniTitle";

export default function CorrectionRequest({ name, label, correctionRequest, onChangeRequest, reasons, messagePlaceholder }) {
  const [requestText, setRequestText] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [reasonOptions, setReasonOptions] = useState([]);
  const [lastDate, setLastDate] = useState("");

  useEffect(() => {
    if (correctionRequest ? correctionRequest.status !== "CANCELED" : false) {
      setRequestText(correctionRequest.message);
      setRequestReason(correctionRequest.reason && correctionRequest.reason !== "" ? correctionRequest.reason : "");
      setLastDate(dayjs(correctionRequest.remindedAt ? correctionRequest.remindedAt : correctionRequest.sentAt).format("DD/MM/YYYY"));
    } else {
      setRequestText("");
      setRequestReason("");
      setLastDate("");
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
    <div className="my-[16px] rounded-[7px] bg-[#F9FAFB] p-[24px]">
      <MiniTitle>
        {!correctionRequest || correctionRequest.status === "PENDING" ? "Demander une correction" : `Correction demandée le ${lastDate}`} - {label}
      </MiniTitle>
      {reasons && reasons.length > 0 && (
        <div className="mb-[16px] flex w-[100%] items-center rounded-[6px] border-[1px] border-[#D1D5DB] bg-white pr-[15px]">
          <select value={requestReason} onChange={changeReason} className="grow appearance-none bg-[transparent] p-[15px]">
            {reasonOptions}
          </select>
          <ChevronDown className="flex-[0_0_16px] text-[#6B7280]" />
        </div>
      )}
      <textarea
        value={requestText}
        onChange={changeText}
        className="w-[100%] rounded-[6px] border-[1px] border-[#D1D5DB] bg-white p-[15px]"
        rows="5"
        placeholder={messagePlaceholder}
      />
      <div className="mt-[16px] text-right">
        <button className="ml-[6px] flex items-center text-[12px] text-[#F87171]" onClick={deleteRequest}>
          <Bin fill="#F87171" className="mr-[6px]" /> Supprimer la demande
        </button>
      </div>
    </div>
  );
}
