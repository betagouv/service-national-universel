import React from "react";
import { Label } from "@snu/ds/admin";
import { translate } from "snu-lib";

// Consultation seule : la modification de la confirmation de participation et du voyage en avion a été supprimée.
const Phase1ConfirmationFormBlock = ({ values = null }) => {
  return (
    <div className="w-full">
      <div>
        <Label title="Confirmation de la participation" name="confirmation" />
        <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
          <p>{translate(values.youngPhase1Agreement)}</p>
        </div>
      </div>
      <div>
        <Label
          title="Voyage en avion"
          name="isTravelingByPlane"
          tooltip="Indiquez “Oui” si vous avez confirmé individuellement avec le jeune son affectation à un séjour qui nécessite un voyage en avion."
        />
        <div className="mb-2 flex flex-col bg-gray-50 gap-1 py-[10px] px-4">
          <p>{values.isTravelingByPlane ? translate(values.isTravelingByPlane) : "Non"}</p>
        </div>
      </div>
    </div>
  );
};

export default Phase1ConfirmationFormBlock;
