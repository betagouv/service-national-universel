import React, { useState } from "react";
import dayjs from "dayjs";
import Field from "./Field";
import { YOUNG_STATUS } from "snu-lib";

export default function CorrectedRequest({ young, correctionRequest, className, reasons }) {
  const [correctionView, setCorrectionView] = useState(false);

  function toggleCorrectionView() {
    setCorrectionView(!correctionView);
  }

  function paragraphize(text) {
    if (text) {
      return text.split("\n").map((p, i) => <p key={"p-" + i}>{p}</p>);
    } else {
      return null;
    }
  }

  function translateReason(reason) {
    if (reasons) {
      const found = reasons.find((r) => r.value === reason);
      if (found) {
        return found.label;
      }
    }
    return reason;
  }

  if (young.status === YOUNG_STATUS.VALIDATED) {
    return null;
  } else {
    return (
      <div className={`relative mt-[8px] block items-center ${className}`}>
        <div
          className="mr-[8px] mb-[6px] inline-block cursor-pointer whitespace-nowrap rounded-[100px] bg-[#F97316] px-[10px] py-[3px] text-[12px] text-[#FFFFFF]"
          onClick={toggleCorrectionView}>
          Correction demandée...
        </div>
        <div className="inline-block whitespace-nowrap rounded-[100px] bg-[#14B8A6] px-[10px] py-[3px] text-[12px] text-[#FFFFFF]">Correction apportée</div>
        {correctionView && (
          <div className="absolute left-[0px] right-[0px] top-[calc(100%+8px)] z-10 rounded-[8px] bg-white px-[50px] pt-[24px] pb-[8px] shadow-[0px_2px_26px_1px_rgba(0,0,0,0.17)]">
            <div className="mb-[3px] text-center text-[14px] font-bold leading-[20px] text-[#242526]">Ma demande de correction</div>
            <div className="mb-[16px] text-center text-[11px] font-medium uppercase leading-[16px] text-[#6B7280]">
              envoyée le {dayjs(correctionRequest.sentAt).locale("fr").format("DD/MM/YYYY")}
            </div>
            {correctionRequest.reason && <Field label="Motif" value={translateReason(correctionRequest.reason)} mode="readonly" className="mb-[16px]" />}
            {correctionRequest.message && <Field value={paragraphize(correctionRequest.message)} mode="readonly" className="mb-[16px]" />}
          </div>
        )}
      </div>
    );
  }
}
