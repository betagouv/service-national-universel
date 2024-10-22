import React, { useEffect, useState } from "react";

import { YoungDto } from "snu-lib";

import dayjs from "@/utils/dayjs.utils";

import { BorderButton } from "./components/Buttons";

export function YoungFooterSent({
  young,
  requests,
  onRemindRequests,
  footerClass,
}: {
  young: YoungDto;
  requests: NonNullable<YoungDto["correctionRequests"]>;
  onRemindRequests: () => void;
  footerClass: string;
}) {
  const [sentRequestsCount, setSentRequestsCount] = useState(0);

  useEffect(() => {
    setSentRequestsCount(requests.filter((r) => r.status === "SENT" || r.status === "REMINDED").length);
  }, [requests]);

  let sentDate: Date | null = null;
  let remindedDate: Date | null = null;
  for (const req of requests) {
    if (req.status === "SENT") {
      if (sentDate === null || (req.sentAt && req.sentAt.valueOf() > sentDate.valueOf())) {
        sentDate = req.sentAt || null;
      }
    } else if (req.status === "REMINDED") {
      if (remindedDate === null || (req.remindedAt && req.remindedAt.valueOf() > remindedDate.valueOf())) {
        remindedDate = req.remindedAt || null;
      }
    }
  }
  const sentAt = sentDate ? dayjs(sentDate).format("DD/MM/YYYY à HH:mm") : null;
  const remindedAt = remindedDate ? dayjs(remindedDate).format("DD/MM/YYYY à HH:mm") : null;

  return (
    <div className={`fixed bottom-0 right-0 flex bg-white py-[20px] px-[42px] shadow-[0px_-16px_16px_-3px_rgba(0,0,0,0.05)] ${footerClass}`}>
      <div className="grow">
        <div className="flex items-center">
          <span className="text-[18px] font-medium leading-snug text-[#242526]">Demande de correction envoyée</span>
          <span className="ml-[12px] rounded-[100px] border-[1px] border-[#CECECE] bg-[#F7F7F7] py-[4px] px-[10px] text-[12px] text-[#6B7280]">
            {sentRequestsCount} {sentRequestsCount > 1 ? "corrections demandées" : "correction demandée"}
          </span>
        </div>
        <p className="mt-[8px] text-[14px] leading-[20px] text-[#6B7280]">
          {sentAt && "Envoyée le " + sentAt} {remindedAt && (sentAt ? "/ " : "") + "Relancé(e) le " + remindedAt}
        </p>
      </div>
      <div>
        <BorderButton onClick={onRemindRequests}>Relancer {young.gender === "female" ? "la" : "le"} volontaire</BorderButton>
      </div>
    </div>
  );
}
