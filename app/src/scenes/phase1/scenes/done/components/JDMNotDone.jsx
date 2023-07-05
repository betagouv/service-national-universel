import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";

export default function JDMNotDone({cohort}) {
  const needTheJDMPresenceTrue = ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Février 2022", "2021", "2022", "2020"];
  console.log(cohort, needTheJDMPresenceTrue.includes(cohort));
  return (
    <div className="mt-8 mb-16 space-y-3 px-6 md:mt-0 md:mb-8 md:max-w-md md:px-10">
      <div className="flex justify-center">
        <Unlock className="saturate-0" />
      </div>
      <p className="text-center text-xl font-bold leading-7">
        Réalisez votre JDC et <br />
        obtenez votre certificat !
      </p>
      {needTheJDMPresenceTrue.includes(cohort) && (
        <p className="text-center text-xs leading-relaxed text-gray-500">
          Vous devez réaliser votre JDC car <strong>vous n&apos;avez pas participé</strong> à la Journée défense et mémoire (JDM) lors de votre séjour de cohésion.
        </p>
      )}
    </div>
  );
}
