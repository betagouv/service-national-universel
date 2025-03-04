import Loader from "@/components/Loader";
import { DesistementService } from "@/services/desistementService";
import { getDateTimeString, saveAsExcelFile } from "@/utils/file";
import { Button } from "@snu/ds/admin";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { PreviewDesisterTaskResult, ValiderAffectationHTSTaskDto } from "snu-lib";

export default function DesistementPreview({ traitement }: { traitement: unknown }) {
  const affectationTask = traitement as ValiderAffectationHTSTaskDto;
  const sessionId = affectationTask.metadata?.parameters?.sessionId;
  const {
    data: desistementPreview,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["desistement", affectationTask.id],
    queryFn: () => DesistementService.getDesistementPreview(sessionId!, affectationTask.id),
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
  });
  const total = affectationTask?.metadata?.results?.jeunesAffected || 0;
  const nonConfirmes = desistementPreview?.jeunesNonConfirmes.length;

  function handleClick() {
    if (!desistementPreview) return;
    const sheets = formatSheets(desistementPreview);
    const exportDateTime = getDateTimeString();
    const fileName = `Desistement_preview_${affectationTask.name}_${exportDateTime}`;
    saveAsExcelFile(sheets, fileName);
  }

  return (
    <div className="text-center text-lg">
      {isError ? (
        <p>Erreur</p>
      ) : isPending ? (
        <Loader />
      ) : (
        <>
          <p>
            Nombre de volontaires à désister : {nonConfirmes} / {total} affectés.
          </p>
          <p>Confirmez le désistement des volontaires n’ayant pas confirmé le séjour.</p>
          <br />
          <Button onClick={handleClick} title="Exporter la liste" type="secondary" className="w-full" />
        </>
      )}
    </div>
  );
}

function formatSheets(data: PreviewDesisterTaskResult) {
  return {
    "Non confirmation": data.jeunesNonConfirmes,
    "Confirmation de participation": data.jeunesConfirmes,
    "Changement de séjour": data.jeunesAutreSession,
    "Desistement après affectation": data.jeunesDesistes,
  };
}
