import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";
import { isCohortNeedJdm } from "../../../../../utils/cohorts";

export default function JDMNotDone({ cohort }) {
  return (
    <div className="mt-8 mb-16 space-y-3 px-6 md:mt-0 md:mb-8 md:max-w-md md:px-10">
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
