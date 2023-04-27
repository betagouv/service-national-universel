import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { BsCheck2 } from "react-icons/bs";
import { HiOutlineDownload, HiOutlineMail } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { Modal } from "reactstrap";
import CloseSvg from "../../../../../../assets/Close";
import DownloadConvocationButton from "../../../../../../components/buttons/DownloadConvocationButton";
import { ModalContainer } from "../../../../../../components/modals/Modal";
import ModalConfirm from "../../../../../../components/modals/ModalConfirm";
import WithTooltip from "../../../../../../components/WithTooltip";
import api from "../../../../../../services/api";
import Convocation from "../Convocation";
import { capture } from "../../../../../../sentry";
import { translate } from "snu-lib";
import { isStepAgreementDone, isStepConvocationDone } from "../../utils/steps.utils";

export default function StepConvocation({ young }) {
  const [showConvocation, setShowConvocation] = useState(false);
  const [stateMobil, setStateMobil] = useState(false);
  const valid = isStepConvocationDone(young);
  const enabled = isStepAgreementDone(young);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const handleMail = async () => {
    try {
      let template = "cohesion";
      let type = "convocation";
      const { ok, code } = await api.post(`/young/${young._id}/documents/${type}/${template}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
      });
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
      setStateMobil(false);
      setModal({ isOpen: false, onConfirm: null });
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de l'envoie du document : ", e.message);
      setStateMobil(false);
      setModal({ isOpen: false, onConfirm: null });
    }
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden flex-col md:flex lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-row items-center py-4">
          {valid ? (
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
              <BsCheck2 className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full border-[1px] border-gray-200 text-gray-700">3</div>
          )}
          <div className="mx-3 flex flex-1 flex-col">
            <h1 className={`text-base leading-7 ${enabled ? "text-gray-900" : "text-gray-400"}`}>Téléchargez votre convocation</h1>
            <p className={`text-sm leading-5 ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Votre convocation sera à présenter à l&apos;arrivée munie d&apos;une <span className="text-bold">pièce d&apos;identité valide</span>.
            </p>
          </div>
        </div>
        {/* Button */}
        {enabled ? (
          <>
            <div className="flex flex-row items-center justify-center pb-4 lg:!pb-0">
              <button
                type="button"
                className="mr-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:scale-110"
                onClick={() => setShowConvocation(!showConvocation)}>
                <WithTooltip tooltipText={showConvocation ? "Cacher" : "Voir"}>
                  {showConvocation ? <AiOutlineEyeInvisible className="h-5 w-5 text-gray-600" /> : <AiOutlineEye className="h-5 w-5 text-gray-600" />}
                </WithTooltip>
              </button>

              <button
                type="button"
                className="mr-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-gray-100 hover:scale-110"
                onClick={() =>
                  setModal({
                    isOpen: true,
                    onConfirm: handleMail,
                    title: "Envoie de document par mail",
                    message: `Vous allez recevoir votre convocation par mail à l'adresse ${young.email}.`,
                  })
                }>
                <WithTooltip tooltipText="Recevoir par email">
                  <HiOutlineMail className="h-5 w-5 text-gray-600" />
                </WithTooltip>
              </button>

              <DownloadConvocationButton
                young={young}
                uri="cohesion"
                className={`flex flex-row  items-center justify-center rounded-lg px-4 py-2 ${
                  valid ? "border-[1px] border-blue-700 " : "bg-blue-600"
                } cursor-pointer hover:scale-105 ${valid ? "text-blue-700" : "text-white"}`}>
                <HiOutlineDownload className={`h-5 w-5 ${valid ? "text-blue-700" : "text-blue-300"} mr-2`} />
                Télécharger
              </DownloadConvocationButton>
            </div>
          </>
        ) : null}
      </div>
      {/* Mobile */}
      <div
        className={`mb-3 ml-4 flex h-36 cursor-pointer items-center rounded-xl border-[1px] md:hidden ${valid ? "border-green-500 bg-green-50" : "bg-white"} `}
        onClick={() => setStateMobil(enabled ? !stateMobil : false)}>
        <div className="flex w-full -translate-x-5 flex-row items-center">
          {valid ? (
            <div className="mr-4 flex h-9 w-9 items-center justify-center rounded-full bg-green-500">
              <BsCheck2 className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-[1px] border-gray-200 bg-white text-gray-700">3</div>
          )}
          <div className="ml-3 flex flex-1 flex-col">
            <div className={`text-sm ${valid && "text-green-600"} ${enabled ? "text-gray-900" : "text-gray-400"}`}>Téléchargez votre convocation</div>
            <div className={` text-sm leading-5 ${valid && "text-green-600 opacity-70"} ${enabled ? "text-gray-500" : "text-gray-400"}`}>
              Votre convocation sera à présenter à l&apos;arrivée munie d&apos;une pièce d&apos;identité valide.
            </div>
            {enabled ? <div className={` text-right text-sm leading-5 ${valid ? "text-green-500" : "text-blue-600"}`}>Télécharger</div> : null}
          </div>
        </div>
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => modal?.onConfirm()}
      />

      {showConvocation ? (
        <div className="hidden pb-4 md:flex">
          <Convocation />
        </div>
      ) : null}
      {stateMobil ? (
        <Modal centered isOpen={stateMobil} toggle={() => setStateMobil(false)} size="xl">
          <ModalContainer>
            <CloseSvg className="close-icon hover:cursor-pointer" height={10} width={10} onClick={() => setStateMobil(false)} />
            <div className="w-full p-4">
              <div className="flex flex-col items-center justify-center">
                <h1 className="pb-3 text-center text-xl text-gray-900">Choisissez une option de téléchargement</h1>
                <DownloadConvocationButton
                  young={young}
                  uri="cohesion"
                  className="flex w-full cursor-pointer flex-row items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:scale-105">
                  <HiOutlineDownload className="mr-2 h-5 w-5 text-blue-300" />
                  Télécharger
                </DownloadConvocationButton>

                <div className="flex w-full flex-shrink flex-row items-center py-2">
                  <button
                    type="button"
                    className="mr-2 flex cursor-pointer flex-row items-center justify-center rounded-lg border-[1px] border-blue-700 px-4 py-2 hover:scale-105"
                    onClick={() => setShowConvocation(!showConvocation)}>
                    {showConvocation ? <AiOutlineEyeInvisible className="mr-2 h-5 w-5 text-blue-700" /> : <AiOutlineEye className="mr-2 h-5 w-5 text-blue-700" />}
                    <span className="text-sm text-blue-700">Voir</span>
                  </button>
                  <button
                    onClick={() =>
                      setModal({
                        isOpen: true,
                        onConfirm: handleMail,
                        title: "Envoie de document par mail",
                        message: `Vous allez recevoir votre convocation par mail à l'adresse ${young.email}.`,
                      })
                    }
                    type="button"
                    className="flex flex-1 cursor-pointer flex-row items-center justify-center rounded-lg border-[1px] border-blue-700 px-4 py-2 hover:scale-105">
                    <HiOutlineMail className="mr-2 h-5 w-5 text-blue-700" />

                    <span className="text-sm text-blue-700">Recevoir par mail</span>
                  </button>
                </div>
              </div>
              {showConvocation ? (
                <div className="pb-4">
                  <Convocation />
                </div>
              ) : null}
            </div>
          </ModalContainer>
        </Modal>
      ) : null}
    </>
  );
}
