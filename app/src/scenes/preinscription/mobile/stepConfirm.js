import React from "react";
import EditPen from "../../../assets/icons/EditPen";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import StickyButton from "../../../components/inscription/stickyButton";
import { useHistory } from "react-router-dom";
import API from "../../../services/api";
import { appURL } from "../../../config";
import { translateGrade } from "snu-lib/translation";
import { formatDateFR } from "snu-lib/date";

export default function StepDone() {
  const [data] = React.useContext(PreInscriptionContext);
  const history = useHistory();

  const onSubmit = async () => {
    // create young
    // await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_STARTED}`, {
    //   cta: `${appURL}/inscription2023`,
    // });
    // plausible
    history.push("/preinscription/done");
  };

  return (
    <>
      <div className="bg-white p-4">
        <h1 className="text-xl text-[#161616]">Ces informations sont correctes ?</h1>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#161616] text-lg">Mes informations personnelles</div>
            <EditPen />
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#666666] text-sm">Prénom :</div>
            <div className="text-[#161616] text-base">{data.firstName}</div>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#666666] text-sm">Nom : </div>
            <div className="text-[#161616] text-base">{data.lastName}</div>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#666666] text-sm">Email : </div>
            <div className="text-[#161616] text-base">{data.email}</div>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#666666] text-sm">Niveau de scolarité : </div>
            <div className="text-[#161616] text-base">{translateGrade(data.scolarity)}</div>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="text-[#666666] text-sm">Date de naissance : </div>
            <div className="text-[#161616] text-base">{formatDateFR(data.birthDate)}</div>
          </div>
        </div>
      </div>
      <StickyButton text="M'inscrire au SNU" onClick={() => onSubmit()} onClickPrevious={() => history.push("/preinscription/profil")} />
    </>
  );
}
