import React, { useState } from "react";
import dayjs from "dayjs";
import Field from "./Field";

export default function CorrectedRequest({ correctionRequest, className, reasons }) {
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

  return (
    <div className={`relative mt-[8px] flex items-center ${className}`}>
      <div className="bg-[#F97316] px-[10px] py-[3px] text-[#FFFFFF] text-[12px] rounded-[100px] cursor-pointer" onClick={toggleCorrectionView}>
        Correction demandée...
      </div>
      <div className="ml-[8px] bg-[#14B8A6] px-[10px] py-[3px] text-[#FFFFFF] text-[12px] rounded-[100px]">Correction apportée</div>
      {correctionView && (
        <div className="z-10 bg-white rounded-[8px] pt-[24px] pb-[8px] px-[50px] shadow-[0px_2px_26px_1px_rgba(0,0,0,0.17)] absolute left-[0px] right-[0px] top-[calc(100%+8px)]">
          <div className="text-[14px] leading-[20px] font-bold text-[#242526] mb-[3px] text-center">Ma demande de correction</div>
          <div className="text-[11px] leading-[16px] font-medium uppercase text-[#6B7280] mb-[16px] text-center">
            envoyée le {dayjs(correctionRequest.sentAt).locale("fr").format("DD/MM/YYYY")}
          </div>
          {correctionRequest.reason && <Field label="Motif" value={translateReason(correctionRequest.reason)} mode="readonly" className="mb-[16px]" />}
          {correctionRequest.message && <Field value={paragraphize(correctionRequest.message)} mode="readonly" className="mb-[16px]" />}
        </div>
      )}
    </div>
  );
}
