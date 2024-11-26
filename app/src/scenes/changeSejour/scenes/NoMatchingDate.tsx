import React, { useState } from "react";
import NoSejourSection from "../components/NoSejourSection";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import Container from "@/components/layout/Container";
import FullscreenModal from "@/components/modals/FullscreenModal";

export default function NoMatchingDate() {
  const [open, setOpen] = useState(false);
  return (
    <Container title="Aucune date ne me convient" backlink="/changer-de-sejour/">
      <CurrentSejourNotice />
      <p className="mt-4 text-sm leading-5 text-[#6B7280] font-normal">Faites votre choix</p>
      <NoSejourSection />
      <FullscreenModal isOpen={open} setOpen={() => setOpen(false)} title="Êtes-vous sûr de vouloir vous désister ?">
        yo
      </FullscreenModal>
    </Container>
  );
}
