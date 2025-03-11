import React, { useState } from "react";
import { HiOutlineLightningBolt } from "react-icons/hi";
import { CohortDto, formatDateFR, TaskName, translateSimulationName } from "snu-lib";
import { Button, Modal, Select } from "@snu/ds/admin";
import useTraitements from "../../shared/useTraitements";
import dayjs from "dayjs";
import SimulationDesistementButton from "./SimulationDesistementButton";

export default function SimulationDesistementModal({ session, onClose }: { session: CohortDto; onClose: () => void }) {
  const { data: traitements, isPending, isError } = useTraitements({ sessionId: session._id!, action: TaskName.AFFECTATION_HTS_SIMULATION_VALIDER, sort: "ASC" });

  const [selectedOption, setSelectedOption] = useState<string>();

  const options = traitements?.map((t) => ({
    value: t.id,
    label: `${translateSimulationName(t.name)} - ${formatDateFR(dayjs(t.createdAt))}`,
  }));
  const sortedTraitements = traitements?.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));
  const selectedTraitement = selectedOption ? sortedTraitements?.find((t) => t.id === selectedOption) : sortedTraitements?.[0];

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
        </>
      }
      footer={
        <div className="grid grid-cols-2 gap-6">
          <Button title="Annuler" type="secondary" className="w-full" onClick={onClose} />
          <SimulationDesistementButton sessionId={session._id!} taskId={selectedTraitement?.id || ""} onClose={onClose} disabled={!selectedTraitement?.id} />
        </div>
      }
    />
  );
}
