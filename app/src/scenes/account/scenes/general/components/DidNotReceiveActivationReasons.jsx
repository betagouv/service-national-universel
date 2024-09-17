import React from "react";
import { BsInfoSquareFill } from "react-icons/bs";
import { emailValidationNoticeModal, updateEmailModal } from "@/scenes/preinscription/components/Modals";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";

const DidNotReceiveActivationReasons = ({ className }) => {
  return (
    <ul className={`mt-4 list-none text-[#0063CB] flex flex-col gap-1 ${className}`}>
      <li>
        <BsInfoSquareFill className="inline mb-1 mr-1" />
        L'adresse e-mail que vous utilisez est bien celle que vous avez renseignée
        <InlineButton
          className="ml-1 text-[#0063CB]"
          onClick={() => {
            emailValidationNoticeModal.close();
            updateEmailModal.open();
          }}>
          Modifier mon adresse e-mail
        </InlineButton>
      </li>
      <li>
        <BsInfoSquareFill className="inline mb-1 mr-1" />
        Le mail ne se trouve pas dans vos spam
      </li>
      <li>
        <BsInfoSquareFill className="inline mb-1 mr-1" />
        L'adresse e-mail no_reply-auth@snu.gouv.fr ne fait pas partie des adresses indésirables de votre boîte mail
      </li>
      <li>
        <BsInfoSquareFill className="inline mb-1 mr-1" />
        Votre boite de réception n'est pas saturée
      </li>
    </ul>
  );
};

export default DidNotReceiveActivationReasons;
