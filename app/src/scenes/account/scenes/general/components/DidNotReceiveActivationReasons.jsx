import React from "react";
import { BsInfoSquareFill } from "react-icons/bs";

import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";

const DidNotReceiveActivationReasons = ({ modifiyEmail, className }) => {
  return (
    <ul className={`mt-4 list-none text-[#0063CB] flex flex-col gap-1 ${className}`}>
      <li>
        <BsInfoSquareFill className="inline mb-1 mr-1" />
        L'adresse e-mail que vous utilisez est bien celle que vous avez renseigné
        <InlineButton className="ml-1 text-xs text-[#0063CB]" onClick={modifiyEmail}>
          Modifier mon adresse e-mail
        </InlineButton>
      </li>
      <li>
        <BsInfoSquareFill className="inline mb-1 mr-1" />
        Le mail ne se trouve pas dans vos spam
      </li>
      <li>
        <BsInfoSquareFill className="inline mb-1 mr-1" />
        L'adresse e-mail no_reply-mailauto@snu.gouv.fr ne fait pas partie des adresses indésirables de votre boîte mail
      </li>
      <li>
        <BsInfoSquareFill className="inline mb-1 mr-1" />
        Votre boite de réception n'est pas saturée
      </li>
    </ul>
  );
};

export default DidNotReceiveActivationReasons;
