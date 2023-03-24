import React from "react";
import { FiChevronDown } from "react-icons/fi";
import { RiErrorWarningFill } from "react-icons/ri";
import CheckCircleFill from "../../../../../assets/icons/CheckCircleFill";
import Unlock from "../../../../../assets/icons/Unlock";
import XCircleFill from "../../../../../assets/icons/XCircleFill";

export default function JDMNotDone() {
  const [checkOpen, setCheckOpen] = React.useState(false);
  const [differOpen, setDifferOpen] = React.useState(false);
  const [FaqOpen, setFaqOpen] = React.useState(false);
  const [Faq2Open, setFaq2Open] = React.useState(false);

  return (
    <div className="flex flex-col w-full lg:w-1/2 items-stretch mt-8 mb-16 md:mb-8 md:px-10 gap-3">
      <div className="flex justify-center">
        <Unlock className="saturate-0" />
      </div>
      <p className="leading-7 text-xl text-center font-bold">
        Réalisez votre JDC et <br />
        obtenez votre certificat !
      </p>
      <p className="text-center text-gray-500">
        Vous devez réaliser votre JDC car <strong>vous n&apos;avez pas participé</strong> à la Journée défense et mémoire (JDM) lors de votre séjour de cohésion.
      </p>
    </div>
  );
}
