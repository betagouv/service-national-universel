import React from "react";
import { translate } from "../../../../utils";
import { BsChevronDown } from "react-icons/bs";
import DocumentsPM from "../../../militaryPreparation/components/DocumentsPM";
import Prepa from "../../../../assets/icons/Prepa";
import { useDispatch } from "react-redux";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../redux/auth/actions";

export default function CardPM({ young }) {
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch();

  const theme = {
    background: {
      WAITING_VALIDATION: "bg-sky-100",
      WAITING_CORRECTION: "bg-[#FD7A02]",
      VALIDATED: "bg-[#71C784]",
      REFUSED: "bg-red-500",
    },
    text: {
      WAITING_VALIDATION: "text-sky-600",
      WAITING_CORRECTION: "text-white",
      VALIDATED: "text-white",
      REFUSED: "text-white",
    },
  };

  const onCorrection = async () => {
    const responseChangeStatusPM = await api.put(`/young/${young._id}/phase2/militaryPreparation/status`, { statusMilitaryPreparationFiles: "WAITING_VERIFICATION" });
    if (!responseChangeStatusPM.ok) return toastr.error(translate(responseChangeStatusPM?.code), "Oups, une erreur est survenue de la modification de votre dossier.");
    else dispatch(setYoung(responseChangeStatusPM.data));
  };

  return (
    <div className="flex flex-col w-full rounded-lg bg-white px-4 pt-3 mb-4 shadow-md">
      <div className="mb-3 cursor-pointer" onClick={() => setOpen(young.statusMilitaryPreparationFiles !== "REFUSED" ? !open : false)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Prepa className="w-6 h-6 mr-2 text-gray-500" />
            <div className="text-base leading-5 font-bold">Dossier d&apos;éligibilité aux Préparations militaires</div>
          </div>
          <div className="flex items-center gap-5">
            <div
              className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
                theme.text[young.statusMilitaryPreparationFiles]
              } px-2 py-[2px] rounded-sm `}>
              {translate(young.statusMilitaryPreparationFiles)}
            </div>
            {young.statusMilitaryPreparationFiles !== "REFUSED" ? <BsChevronDown className={`text-gray-400 h-5 w-5 ${open ? "rotate-180" : ""}`} /> : null}
          </div>
        </div>
      </div>
      {open ? (
        <>
          <hr className="text-gray-200" />
          {young.statusMilitaryPreparationFiles === "WAITING_CORRECTION" ? (
            <>
              <div className="flex justify-between items-center px-2 py-3 rounded-lg bg-gray-50 mb-4 gap-6">
                <div className="flex flex-col flex-1">
                  <div className="text-base font-bold">Corrections demandées</div>
                  <div className="text-sm text-gray-500">{"test"}</div>
                </div>
                <button className="mr-4 border-[1px] border-blue-700 hover:bg-blue-700 text-blue-700 hover:text-white px-4 py-2 rounded-lg" onClick={onCorrection}>
                  Envoyer ma correction
                </button>
              </div>
            </>
          ) : null}
          <DocumentsPM showHelp={false} />
        </>
      ) : null}
    </div>
  );
}
