import React, { useState } from "react";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { CohortDto, formatDateFR, TaskName, translateSimulationName } from "snu-lib";
import { Button, Modal, Select } from "@snu/ds/admin";
import useTraitements from "../../shared/useTraitements";
import dayjs from "dayjs";
import DesistementButton from "./DesistementButton";
import { DesistementService } from "@/services/desistementService";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export default function DesistementModal({ session, onClose }: { session: CohortDto; onClose: () => void }) {
  const { data: traitements, isPending, isError } = useTraitements({ sessionId: session._id!, action: TaskName.AFFECTATION_HTS_SIMULATION_VALIDER, sort: "ASC" });
  const [selectedOption, setSelectedOption] = useState<string>();
  const options = traitements?.map((t) => ({
    value: t.id,
    label: `${translateSimulationName(t.name)} - ${formatDateFR(dayjs(t.createdAt))}`,
  }));
  const selectedTraitement = selectedOption ? traitements?.find((t) => t.id === selectedOption) : traitements?.[0];

  return (
    <Modal
      isOpen
      noBodyScroll
      onClose={onClose}
      className="md:max-w-[800px]"
      content={
        <>
          <div className="scroll-y-auto overflow-y-auto max-h-[80vh]">
            <div className="flex flex-col items-center text-center gap-6 mb-8">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-50">
                  <HiOutlineLightningBolt className="w-6 h-6" />
                </div>
              </div>
              <h1 className="font-bold text-xl m-0">Désistement des volontaires n’ayant pas confirmé leur séjour</h1>
              <p className="text-lg">Sélectionnez l'affectation&nbsp;:</p>
            </div>
          </div>
          {isPending ? (
            <p>Chargement...</p>
          ) : isError ? (
            <p>Erreur</p>
          ) : (
            <Select
              // @ts-ignore
              defaultValue={options!.find((o) => o.value === selectedTraitement?.id)}
              options={options}
              value={options!.find((o) => o.value === selectedOption)}
              onChange={(option) => setSelectedOption(option.value)}
              closeMenuOnSelect
              className="w-full"
            />
          )}
          <br />
          {selectedTraitement && <PreviewText traitement={selectedTraitement} />}
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-6">
          <Button title="Annuler" type="secondary" className="w-full" onClick={onClose} />
          <DesistementButton sessionId={session._id!} taskId={selectedTraitement?.id || ""} onClose={onClose} disabled={!selectedTraitement?.id} />
        </div>
      }
    />
  );
}

function PreviewText({ traitement }) {
  const { data, isPending, isError } = useQuery({
    queryKey: ["desistement", traitement.id],
    queryFn: () => DesistementService.getDesistementPreview(traitement.metadata?.parameters?.sessionId, traitement.id),
    refetchOnWindowFocus: false,
  });
  const total = traitement?.metadata?.results?.jeunesAffected || 0;
  const nonConfirmes = data?.jeunesNonConfirmes.length;

  function handleClick() {
    if (!data) return;
    const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const classeur = {
      Sheets: {
        "Non confirmation": XLSX.utils.json_to_sheet(data.jeunesNonConfirmes),
        "Confirmation de la participation": XLSX.utils.json_to_sheet(data.jeunesConfirmes),
        "Changement de séjour": XLSX.utils.json_to_sheet(data.jeunesAutreSession),
        "Desistement après affectation": XLSX.utils.json_to_sheet(data.jeunesDesistes),
      },
      SheetNames: ["Non confirmation", "Confirmation de participation", "Changement de séjour", "Desistement après affectation"],
    };
    const excelBuffer = XLSX.write(classeur, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: fileType });
    const now = new Date();
    const exportDate = `${now.getFullYear()}${now.getMonth() + 1}${("0" + now.getDate()).slice(-2)}`;
    const exportTime = `${now.getHours()}${now.getMinutes()}`;
    FileSaver.saveAs(blob, `${exportDate}_${exportTime}_desistement_preview.xlsx`);
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
