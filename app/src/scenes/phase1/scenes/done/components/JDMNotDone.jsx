import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";

export default function JDMNotDone() {
  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Unlock className="saturate-0" />
      </div>
      <p className="text-center text-xl font-bold leading-7">
        Réalisez votre JDC et <br />
        obtenez votre certificat !
      </p>
      <p className="text-center text-xs leading-relaxed text-gray-500">
        Vous devez réaliser votre JDC car <strong>vous n&apos;avez pas participé</strong> à la Journée défense et mémoire (JDM) lors de votre séjour de cohésion.
      </p>
    </div>
  );
}
