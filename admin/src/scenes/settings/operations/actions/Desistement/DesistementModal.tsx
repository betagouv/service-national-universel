import React, { useState } from "react";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { CohortDto, TaskName } from "snu-lib";
import { Button, Modal, Select } from "@snu/ds/admin";
import useTraitements from "../../shared/useTraitements";
import dayjs from "dayjs";
import DesistementButton from "./DesistementButton";
import { DesistementService } from "@/services/desistementService";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/Loader";

export default function DesistementModal({ session, onClose }: { session: CohortDto; onClose: () => void }) {
  const { data: traitements, isPending, isError } = useTraitements({ sessionId: session._id!, action: TaskName.AFFECTATION_HTS_SIMULATION_VALIDER, sort: "ASC" });
  const [selectedOption, setSelectedOption] = useState<string>();
  const options = traitements?.map((t) => ({
    value: t.id,
    label: `${t.name} - ${dayjs(t.createdAt).format("DD/MM/YYYY")}`,
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
  });
  const total = traitement?.metadata?.results?.jeunesAffected || 0;
  const nonConfirmes = data?.jeunesNonConfirmes || 0;

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
        </>
      )}
    </div>
  );
}
