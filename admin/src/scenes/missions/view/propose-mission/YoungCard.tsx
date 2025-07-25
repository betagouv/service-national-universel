import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import { canCreateApplicationForYoung, getProjetPro, getTags } from "./utils";
import { ApplicationType, formatDateFR, MissionType, translate, YoungType } from "snu-lib";
import { Button } from "@snu/ds/admin";
import ModalConfirm from "@/components/modals/ModalConfirm";
import { useSelector } from "react-redux";
import { CohortState } from "@/redux/cohorts/reducer";
import { HiOutlineMapPin } from "react-icons/hi2";
import useCreateApplicationForYoung from "./useCreateApplicationForYoung";

type Props = {
  young: YoungType & { sort: number };
  mission: MissionType;
  application?: ApplicationType;
};

export default function YoungCard({ young, mission, application }: Props) {
  const queryClient = useQueryClient();
  const { mutate: createApplicationForYoung, isPending } = useCreateApplicationForYoung();
  const [modal, setModal] = useState(false);
  const tags = getTags(young);
  const projetPro = getProjetPro(young);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const cohort = cohorts.find((cohort) => cohort._id === young.cohortId);

  function handleClick(young: YoungType) {
    setModal(false);
    createApplicationForYoung({ mission, young }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["applicationsByMissionId", mission._id] }) });
  }

  return (
    <div className="bg-white rounded-lg flex flex-col justify-between p-4 gap-4">
      <div>
        <div className="flex justify-between">
          <div>
            <a href={`/volontaire/${young._id}`} target="_blank" rel="noreferrer" className="font-bold">
              {young.firstName} {young.lastName}
            </a>
            <p className="text-gray-500">
              {young.region}&nbsp;{young.region && young.department && "›"}&nbsp;{young.department}
            </p>
            <p className="text-gray-500">Séjour de {cohort?.name}</p>
          </div>
          <div className="flex-1 text-right overflow-hidden whitespace-nowrap flex justify-end">
            <HiOutlineMapPin className="h-5 w-5 mr-2" />
            {`${Math.round(young.sort[0])} km`}
          </div>
        </div>
        <hr className="my-2" />
        <div className="text-gray-500 text-sm">
          <p>
            <strong>Domaines privilégiés :</strong> {young.domains.length > 0 ? young.domains?.map(translate)?.join(" • ") : "Non renseigné"}
          </p>
          <p>
            <strong>Projet pro :</strong> {projetPro}
          </p>
          <p>{tags.length > 0 && tags.join(" • ")}</p>
        </div>
      </div>

      {application ? (
        <p className="text-gray-500">
          Mission proposée le {formatDateFR(application.createdAt)} - {translate(application.status)}
        </p>
      ) : (
        <Button
          title="Proposer la mission"
          disabled={!canCreateApplicationForYoung(young, cohort)}
          onClick={() => setModal(true)}
          type="secondary"
          loading={isPending}
          tooltip="Impossible de proposer la mission à ce volontaire (phase 1 non validée ou cohorte trop ancienne)."
          className="w-full"
        />
      )}

      <ModalConfirm
        isOpen={modal}
        title="Confirmation de la proposition"
        message={`Voulez-vous vraiment proposer la mission ${mission.name} à ${young.firstName} ${young.lastName} ?`}
        onCancel={() => setModal(false)}
        onConfirm={() => handleClick(young)}
      />
    </div>
  );
}
