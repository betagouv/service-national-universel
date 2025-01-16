import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";
import CensusDone from "./CensusDone";
import CensusNotDone from "./CensusNotDone";

export default function JDMDone() {
  const [isCensusDoneOpen, setIsCensusDoneOpen] = React.useState(false);
  const [isCensusNotDoneOpen, setIsCensusNotDoneOpen] = React.useState(false);
  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Unlock />
      </div>
      <p className="text-center text-lg font-bold">Vous avez participé à la JDM</p>
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
