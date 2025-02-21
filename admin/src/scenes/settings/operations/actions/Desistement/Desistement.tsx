import React from "react";
import { useToggle } from "react-use";
import { HiOutlineInformationCircle } from "react-icons/hi";
import { COHORT_TYPE, CohortDto } from "snu-lib";
import { Button, Tooltip } from "@snu/ds/admin";
import DesistementModal from "./DesistementModal";

export default function Desistement({ session }: { session: CohortDto }) {
  const [showModal, toggleModal] = useToggle(false);

  return (
    <div className="flex items-center justify-between px-4">
      <div className="flex gap-2">
        <div className="text-sm leading-5 font-bold">Désistement des volontaires n'ayant pas confirmé leur présence (Metropole, hors Corse)</div>
        <Tooltip id="affectation-hts-metropole" title="Désistement (Metropole, hors Corse)">
          <HiOutlineInformationCircle className="text-gray-400" size={20} />
        </Tooltip>
      </div>
      <div className="flex gap-2">
        <Button title="Lancer les désistements" onClick={toggleModal} disabled={session.type === COHORT_TYPE.CLE} />
      </div>
      {showModal && <DesistementModal session={session} onClose={toggleModal} />}
    </div>
  );
}
