import React from "react";
import { BsArrowUpShort } from "react-icons/bs";
import { formatDateFR, translateEquivalenceStatus } from "../../../../utils";
import ModalEquivalenceInformations from "./ModalEquivalenceInformations";

export default function CardEquivalence({ equivalence, young }) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

  const theme = {
    background: {
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_CORRECTION: "bg-[#FD7A02]",
      VALIDATED: "bg-[#71C784]",
      REFUSED: "bg-red-500",
    },
    text: {
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_CORRECTION: "text-white",
      VALIDATED: "text-white",
      REFUSED: "text-white",
    },
  };

  return (
    <>
      <div className="mb-4 flex -translate-y-4 flex-col space-y-4 rounded-lg bg-white px-3 pt-2 shadow-md ">
        <div className="mb-3 cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="flex items-center justify-between ">
            <div className={`text-xs font-normal ${theme.background[equivalence.status]} ${theme.text[equivalence.status]} flex rounded-sm px-2 py-[2px] `}>
              {/* <img src={clock} alt="clock icon" className="w-5 h-5 bg-blue-50" /> */}
              {translateEquivalenceStatus(equivalence.status)}
            </div>
            <BsArrowUpShort className="h-8 w-8 rotate-45 text-gray-400" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex-col items-center ">
              <div className="text-base font-bold leading-5">Ma demande de reconnaissance d’engagement déjà réalisé</div>
              <div className="mt-2 text-xs font-normal uppercase leading-4 text-gray-500">envoyée le {formatDateFR(equivalence.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
      {open && <ModalEquivalenceInformations theme={theme} equivalence={equivalence} open={open} setOpen={setOpen} young={young} copied={copied} setCopied={setCopied} />}
    </>
  );
}
