import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";

export default function JDMNotDone() {
  return (
    <div className="md:max-w-md mt-8 md:mt-0 mb-16 md:mb-8 px-6 md:px-10 space-y-3">
      <div className="flex justify-center">
        <Unlock className="saturate-0" />
      </div>
      <p className="leading-7 text-xl text-center font-bold">
        Réalisez votre JDC et <br />
        obtenez votre certificat !
      </p>
      <p className="text-center leading-relaxed text-xs text-gray-500">
        Vous devez réaliser votre JDC car <strong>vous n&apos;avez pas participé</strong> à la Journée défense et mémoire (JDM) lors de votre séjour de cohésion.
      </p>
    </div>
  );
}
