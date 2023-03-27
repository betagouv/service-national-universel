import React from "react";
import Unlock from "../../../../../assets/icons/Unlock";
import CensusDone from "./CensusDone";
import CensusNotDone from "./CensusNotDone";

export default function JDMDone() {
  const [isCensusDoneOpen, setIsCensusDoneOpen] = React.useState(false);
  const [isCensusNotDoneOpen, setIsCensusNotDoneOpen] = React.useState(false);

  return (
    <div className="flex flex-col w-full lg:w-1/2 items-stretch mt-8 mb-16 md:mb-8 md:px-10 gap-3">
      <div className="flex justify-center">
        <Unlock />
      </div>
      <p className="text-lg text-center font-bold">Vous avez participé à la JDM</p>
      <p className="leading-7 text-xl text-center font-bold">
        Obtenez votre certificat <br /> de participation à la JDC !
      </p>

      <div className="space-y-0 md:space-y-6">
        <CensusDone isOpen={isCensusDoneOpen} setIsOpen={setIsCensusDoneOpen} />
        <CensusNotDone isOpen={isCensusNotDoneOpen} setIsOpen={setIsCensusNotDoneOpen} />
      </div>
    </div>
  );
}
