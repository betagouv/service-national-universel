import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";
import CensusDone from "./CensusDone";
import CensusNotDone from "./CensusNotDone";

export default function JDMDone({cohort}) {
  const [isCensusDoneOpen, setIsCensusDoneOpen] = React.useState(false);
  const [isCensusNotDoneOpen, setIsCensusNotDoneOpen] = React.useState(false);
  const needTheJDMPresenceTrue = ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Février 2022", "2021", "2022", "2020"];

  return (
    <div className="mt-8 mb-16 space-y-3 md:mt-0 md:mb-8 md:px-10">
      <div className="flex justify-center">
        <Unlock />
      </div>
      {needTheJDMPresenceTrue.includes(cohort) && (<p className="text-center text-lg font-bold">Vous avez participé à la JDM</p>)}
      <p className="text-center text-xl font-bold leading-7">
        Obtenez votre certificat <br /> de participation à la JDC !
      </p>

      <div className="space-y-0 md:space-y-6">
        <CensusDone isOpen={isCensusDoneOpen} setIsOpen={setIsCensusDoneOpen} />
        <CensusNotDone isOpen={isCensusNotDoneOpen} setIsOpen={setIsCensusNotDoneOpen} />
      </div>
    </div>
  );
}
