import React, { useState } from "react";
import ReasonForm from "../components/ReasonForm";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import Container from "@/components/layout/Container";
import FullscreenModal from "@/components/modals/FullscreenModal";

export default function PrevenirSejour() {
  const [open, setOpen] = useState(false);
  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");

  return (
    <Container title="M'alerter lors de l'ouverture des prochaines inscriptions" backlink="/changer-de-sejour/no-date">
      <CurrentSejourNotice />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Vous serez alerté(e) par e-mail lors de l'ouverture des futures inscriptions.</p>
      <ReasonForm reason={withdrawnReason} setReason={setWithdrawnReason} message={withdrawnMessage} setMessage={setWithdrawnMessage} onSubmit={() => setOpen(true)} />
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir changer de séjour ?">
        wesh
      </FullscreenModal>
    </Container>
  );
}
