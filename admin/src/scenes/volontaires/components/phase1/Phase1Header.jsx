import React from "react";
import Badge from "../../../../components/Badge";
import { YOUNG_STATUS_COLORS, translatePhase1 } from "snu-lib";

// La dispense de séjour a été supprimée : l'en-tête n'affiche plus que le statut de phase 1.
const Phase1Header = ({ young = null }) => {
  return (
    <div className="mb-6 flex justify-between">
      <div className="flex items-center gap-2">
        <p className="text-2xl leading-7 font-bold">Séjour de cohésion</p>
        <Badge minify text={translatePhase1(young.statusPhase1)} color={YOUNG_STATUS_COLORS[young.statusPhase1]} />
      </div>
    </div>
  );
};

export default Phase1Header;
