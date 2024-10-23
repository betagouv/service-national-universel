import React from "react";

import { YoungDto } from "snu-lib";

import Bin from "@/assets/Bin";
import { PlainButton } from "./components/Buttons";

export function YoungFooterPending({
  young,
  requests,
  sending,
  onDeletePending,
  onSendPending,
  footerClass,
}: {
  young: YoungDto;
  requests: NonNullable<YoungDto["correctionRequests"]>;
  sending: boolean;
  onDeletePending: () => void;
  onSendPending: () => void;
  footerClass: string;
}) {
  const sentRequestsCount = requests.filter((r) => r.status === "SENT" || r.status === "REMINDED")?.length || 0;
  const pendingRequestsCount = requests.filter((r) => r.status === "PENDING")?.length || 0;

  return (
    <div className={`fixed bottom-0 right-0 flex bg-white py-[20px] px-[42px] shadow-[0px_-16px_16px_-3px_rgba(0,0,0,0.05)] ${footerClass}`}>
      <div className="grow">
        <div className="flex items-center">
          <span className="text-[18px] font-medium leading-snug text-[#242526]">Le dossier est-il conforme&nbsp;?</span>
          {pendingRequestsCount > 0 && (
            <>
              {sentRequestsCount > 0 && (
                <span className="ml-[12px] rounded-[100px] border-[1px] border-[#CECECE] bg-[#F7F7F7] py-[4px] px-[10px] text-[12px] text-[#6B7280]">
                  {sentRequestsCount} {sentRequestsCount > 1 ? "corrections envoyées" : "correction envoyée"}
                </span>
              )}
              <span className="ml-[12px] rounded-[100px] bg-[#F97316] py-[4px] px-[10px] text-[12px] text-[#FFFFFF]">
                {pendingRequestsCount} {pendingRequestsCount > 1 ? "corrections demandées" : "correction demandée"}
              </span>
              <button className="ml-[12px] flex items-center text-[12px] text-[#F87171]" onClick={onDeletePending}>
                <Bin fill="#F87171" />
                <span className="ml-[5px]">Supprimer {pendingRequestsCount > 1 ? "les demandes" : "la demande"}</span>
              </button>
            </>
          )}
        </div>
        <p className="mt-[8px] text-[14px] leading-[20px] text-[#6B7280]">
          Votre demande sera transmise par mail à {young.firstName} {young.lastName} ({young.email})
        </p>
      </div>
      <div>
        <PlainButton spinner={sending} onClick={onSendPending}>
          Envoyer la demande de correction
        </PlainButton>
      </div>
    </div>
  );
}
