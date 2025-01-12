import React from "react";
import { Link } from "react-router-dom";

import Refresh from "@/assets/icons/Refresh";
import { Label, Button } from "@snu/ds/admin";
import { COHORT_TYPE, CohesionCenterType, CohortType, formatNameAndAddress } from "snu-lib";

type ModalAffectationsType = {
  isOpen: boolean;
  center: CohesionCenterType | null;
  sessionId: string;
};

interface Props {
  cohesionCenter: CohesionCenterType;
  cohort: CohortType;
  setModalAffectation: (modalAffectations: ModalAffectationsType) => void;
  modalAffectations: ModalAffectationsType;
  isOpenForAffectation: boolean;
}

export default function CohesionCenterInfos({ cohesionCenter, cohort, setModalAffectation, modalAffectations, isOpenForAffectation }: Props) {
  return (
    <div className="flex flex-col w-full">
      <Label title="Centre de cohésion" name="cohesionCenter" />
      <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
        <p>
          <span className="text-gray-500">Matricule : </span>
          {cohesionCenter.matricule}
        </p>
        <p>
          <span className="text-gray-500">Nom : </span>
          {cohesionCenter.name}
        </p>
        <p>
          <span className="text-gray-500">Adresse : </span>
          {cohesionCenter.address && formatNameAndAddress(cohesionCenter.address) + " "}
          {cohesionCenter.zip + " " + (cohesionCenter.city && formatNameAndAddress(cohesionCenter.city))}
        </p>
        <p>
          <span className="text-gray-500">Département : </span>
          {cohesionCenter.department}
        </p>
        <p>
          <span className="text-gray-500">Région : </span>
          {cohesionCenter.region}
        </p>
        <p>
          <span className="text-gray-500">Académie : </span>
          {cohesionCenter.academy}
        </p>
      </div>
      <Link to={`/centre/${cohesionCenter._id}`} className="w-full" target="blank">
        <Button type="tertiary" title="Voir le centre" className="w-full max-w-none" />
      </Link>

      {cohort.type !== COHORT_TYPE.CLE && isOpenForAffectation && (
        <button
          onClick={() => setModalAffectation({ ...modalAffectations, isOpen: true })}
          className="flex w-fit mt-4 cursor-pointer flex-row items-center justify-center gap-2 self-center rounded border-[1px] border-gray-300 p-2">
          <Refresh />
          <div>Changer l&apos;affectation</div>
        </button>
      )}
    </div>
  );
}
