import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import React from "react";
import { useSelector } from "react-redux";
import { YOUNG_STATUS } from "snu-lib";

export default function InscriptionClosed() {
  const young = useSelector((state) => state.Auth.young);
  const statusWording = (young) => {
    if (young.status === YOUNG_STATUS.IN_PROGRESS) {
      return "Votre inscription n'a pas été complétée à temps.";
    } else if (young.status === YOUNG_STATUS.WAITING_CORRECTION) {
      return "Votre inscription n'a pas été corrigée à temps.";
    } else if (young.status === YOUNG_STATUS.WAITING_VALIDATION) {
      return "Votre inscription n'a pas été validée à temps.";
    }
  };

  return (
    <DSFRLayout title="Inscription de l’élève">
      <DSFRContainer title={statusWording(young)}>
        <p>Les inscriptions ont été clôturées pour l'année scolaire 2023-2024.</p>
      </DSFRContainer>
    </DSFRLayout>
  );
}
