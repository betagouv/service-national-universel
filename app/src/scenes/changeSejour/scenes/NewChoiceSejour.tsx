import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import ReasonForm from "../components/ReasonForm";
import FullscreenModal from "@/components/modals/FullscreenModal";
import Container from "@/components/layout/Container";

export default function NewChoicSejour() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const cohortId = queryParams.get("cohortid");
  const newCohortPeriod = queryParams.get("period");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Container title={`Séjour {newCohortPeriod}`} backlink="/changer-de-sejour/no-date">
      <CurrentSejourNotice />
      <hr />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Pour quelle(s) raison(s) souhaitez-vous changer de séjour ?</p>
      <ReasonForm reason={reason} setReason={setReason} message={message} setMessage={setMessage} onSubmit={() => setOpen(true)} />
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir changer de séjour ?">
        yo
      </FullscreenModal>
      {/* <div className="mt-10 flex w-full flex-col gap-3 md:flex-row">
          <CancelButton className="hidden flex-1 md:block" onClick={onCancel} />
          <PlainButton disabled={!withdrawnReason || !withdrawnMessage} className="flex-1" onClick={onConfirm}>
            {confirmButtonName}
          </PlainButton>
          <CancelButton className="flex-1 md:hidden" onClick={onBack}>
            Retour
          </CancelButton>
        </div> */}
    </Container>
  );
}
