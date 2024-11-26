import React, { useState, Fragment } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
// import { CheckIcon } from '@heroicons/react/24/outline'
import useAuth from "@/services/useAuth";
import { WITHRAWN_REASONS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import ReasonMotifSection from "../components/ReasonMotifSection";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import Container from "@/components/layout/Container";
import FullscreenModal from "@/components/modals/FullscreenModal";

export default function PrevenirSejour() {
  const { young } = useAuth();
  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const filteredWithdrawnReasons = WITHRAWN_REASONS.filter(
    (r) =>
      (!r.phase2Only || young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE || young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED) &&
      (!r.cohortOnly || r.cohortOnly.includes(young.cohort)),
  );

  const [open, setOpen] = useState(false);

  return (
    <Container title="Être alerté lors de l'ouverture des inscriptions sur les prochains séjours" backlink="/changer-de-sejour/no-date">
      <CurrentSejourNotice />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Vous serez alerté(e) par e-mail lors de l'ouverture des futures inscriptions.</p>

      <ReasonMotifSection
        filteredWithdrawnReasons={filteredWithdrawnReasons}
        withdrawnReason={withdrawnReason}
        setWithdrawnReason={setWithdrawnReason}
        withdrawnMessage={withdrawnMessage}
        setWithdrawnMessage={setWithdrawnMessage}
      />

      <button
        onClick={() => setOpen(true)}
        className="w-full mt-4 rounded-md border-[1px] bg-blue-600 py-2.5 px-3 text-sm leading-5 text-white transition duration-300 ease-in-out hover:bg-blue-800">
        Envoyer ma demande
      </button>
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir changer de séjour ?">
        wesh
      </FullscreenModal>
    </Container>
  );
}
