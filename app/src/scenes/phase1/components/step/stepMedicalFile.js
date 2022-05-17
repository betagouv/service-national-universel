import React, { useEffect, useState } from "react";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineDownload, HiOutlineMail } from "react-icons/hi";
import { useDispatch } from "react-redux";
import { Modal } from "reactstrap";
import CloseSvg from "../../../../assets/Close";
import { ModalContainer } from "../../../../components/modals/Modal";
import WithTooltip from "../../../../components/WithTooltip";
import { setYoung } from "../../../../redux/auth/actions";
import api from "../../../../services/api";
import ModalConfirm from "../../../../components/modals/ModalConfirm";
import { SENDINBLUE_TEMPLATES } from "../../../../utils";
import { toastr } from "react-redux-toastr";

export default function StepMedicalField({ young }) {
  const [stateMobil, setStateMobil] = useState(false);
  const [valid, setValid] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  useEffect(() => {
    if (young) {
      setEnabled(young.convocationFileDownload === "true" || young.cohesionStayMedicalFileDownload === "true");
      setValid(young.cohesionStayMedicalFileDownload === "true");
    }
  }, [young]);

  const dispatch = useDispatch();

  const handleDownload = async () => {
    const { data } = await api.put(`/young/phase1/cohesionStayMedical`, { cohesionStayMedicalFileDownload: "true" });
    dispatch(setYoung(data));
  };

  const handleMail = async () => {
    console.log(SENDINBLUE_TEMPLATES);
    const { ok } = await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.LINK}`, {
      object: `Fiche sanitaire à compléter`,
      message: "Vous trouverez téléchargeable ci-dessous la fiche sanitaire à compléter.",
      link: "https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/fiche_sanitaire_2022.pdf?utm_campaign=transactionnel+télécharger+docum&utm_source=notifauto&utm_medium=mail+410+télécharger",
    });
    if (ok) toastr.success(`Document envoyé à ${young.email}`);
    else toastr.error("Erreur lors de l'envoie du document", translate(code));
    setStateMobil(false);
    setModal({ isOpen: false, onConfirm: null });
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-row py-4 items-center">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full mr-4 border-[1px] border-gray-200 text-gray-700">4</div>
          )}
          <div className="flex flex-1 flex-col mx-3">
            <h1 className={`text-base leading-7 ${enabled ? "text-gray-900" : "text-gray-400"}`}>Téléchargez votre fiche sanitaire</h1>
            <p className={`text-sm leading-5 ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Vous devez renseigner votre fiche sanitaire et la remettre à votre arrivée au centre de séjour.
            </p>
          </div>
        </div>
        {/* Button */}
        {enabled ? (
          <>
            <div className="flex flex-row items-center justify-center pb-4 lg:!pb-0">
              <button
                className="flex items-center justify-center bg-gray-100 h-8 w-8 rounded-full mr-4 cursor-pointer hover:scale-110"
                onClick={() =>
                  setModal({
                    isOpen: true,
                    onConfirm: handleMail,
                    title: "Envoie de document par mail",
                    message: `Vous allez recevoir le lien de téléchargement de la fiche sanitaire par mail à l'adresse ${young.email}.`,
                  })
                }>
                <WithTooltip tooltipText="Recevoir par email">
                  <HiOutlineMail className="h-5 w-5 text-gray-600" />
                </WithTooltip>
              </button>
              <a target="blank" href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/fiche_sanitaire_2022.pdf" onClick={handleDownload}>
                <button
                  type="button"
                  className={`flex flex-row items-center justify-center px-4 py-2 rounded-lg ${
                    valid ? "border-[1px] border-blue-700 " : "bg-blue-600"
                  } cursor-pointer hover:scale-105`}>
                  <HiOutlineDownload className={`h-5 w-5 ${valid ? "text-blue-700" : "text-blue-300"} mr-2`} />
                  <span className={`${valid ? "text-blue-700" : "text-white"}`}>Télécharger</span>
                </button>
              </a>
            </div>
          </>
        ) : null}
      </div>
      {/* Mobile */}
      <div
        className={`md:hidden flex items-center border-[1px] mb-3 ml-4 rounded-xl h-36 cursor-pointer ${valid ? "border-green-500 bg-green-50" : "bg-white"} `}
        onClick={() => setStateMobil(enabled ? !stateMobil : false)}>
        <div className="-translate-x-5 flex flex-row items-center w-full">
          {valid ? (
            <div className="flex items-center justify-center bg-green-500 h-9 w-9 rounded-full mr-4">
              <BsCheck2 className="text-white h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-9 w-9 rounded-full border-[1px] bg-white border-gray-200 text-gray-700">4</div>
          )}
          <div className="flex flex-1 flex-col ml-3">
            <div className={`text-sm ${valid && "text-green-600"} ${enabled ? "text-gray-900" : "text-gray-400"}`}>Téléchargez votre fiche sanitaire</div>
            <div className={` text-sm leading-5 ${valid && "text-green-600 opacity-70"} ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Vous devez renseigner votre fiche sanitaire et la remettre à votre arrivée au centre de séjour.
            </div>
            <div className={` text-sm text-right leading-5 ${valid ? "text-green-500" : "text-blue-600"}`}>Téléchargez</div>
          </div>
        </div>
      </div>
      {stateMobil ? (
        <Modal centered isOpen={stateMobil} toggle={() => setStateMobil(false)} size="xl">
          <ModalContainer>
            <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={() => setStateMobil(false)} />
            <div className="w-full p-4">
              <div className="flex flex-col items-center justify-center">
                <h1 className="text-gray-900 text-xl text-center pb-3">Choisissez une option de téléchargement</h1>
                <button
                  type="button"
                  className="flex flex-row w-full items-center justify-center px-4 py-2 mb-2 rounded-lg bg-blue-600 cursor-pointer hover:scale-105"
                  onClick={handleDownload}>
                  <HiOutlineDownload className="h-5 w-5 text-blue-300 mr-2" />
                  <a target="blank" href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/fiche_sanitaire_2022.pdf" onClick={handleDownload}>
                    <span className="text-white text-sm">Télécharger</span>
                  </a>
                </button>
                <button
                  onClick={() =>
                    setModal({
                      isOpen: true,
                      onConfirm: handleMail,
                      title: "Envoie de document par mail",
                      message: `Vous allez recevoir le lien de téléchargement de la fiche sanitaire par mail à l'adresse ${young.email}.`,
                    })
                  }
                  type="button"
                  className="flex flex-1 flex-row w-full items-center justify-center px-4 py-2 rounded-lg border-[1px] border-blue-700 cursor-pointer hover:scale-105">
                  <HiOutlineMail className="h-5 w-5 text-blue-700 mr-2" />
                  <span young={young} uri="cohesion" className="text-blue-700 text-sm">
                    Recevoir par mail
                  </span>
                </button>
              </div>
            </div>
          </ModalContainer>
        </Modal>
      ) : null}
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => modal?.onConfirm()}
      />
    </>
  );
}
