import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "@/redux/auth/actions";
import { toastr } from "react-redux-toastr";
import API from "@/services/api";
import { translate } from "snu-lib";
import { capture } from "@/sentry";
import plausibleEvent from "@/services/plausible";
import downloadPDF from "@/utils/download-pdf";
import { StepCard } from "../StepCard";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import ConvocationModal from "../modals/ConvocationModal";
import { HiEye, HiMail, HiOutlineDownload } from "react-icons/hi";
import { STEPS, isStepDone } from "../../utils/steps.utils";

export default function StepConvocation({ data: { center, meetingPoint, departureDate, returnDate } }) {
  const index = 3;
  const young = useSelector((state) => state.Auth.young);
  const isEnabled = isStepDone(STEPS.AGREEMENT, young);
  const isDone = isStepDone(STEPS.CONVOCATION, young);
  const dispatch = useDispatch();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [openConvocation, setOpenConvocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const downloadConvocation = async () => {
    setLoading(true);
    try {
      plausibleEvent("Phase1/telechargement convocation");
      await downloadPDF({
        url: `/young/${young._id}/documents/convocation/cohesion`,
        fileName: `${young.firstName} ${young.lastName} - convocation - cohesion.pdf`,
        errorTitle: "Une erreur est survenue lors de l'édition de votre convocation",
      });
      if (young?.convocationFileDownload === "false") {
        const { data } = await API.put(`/young/phase1/convocation`, { convocationFileDownload: "true" });
        plausibleEvent("affecté_step3");
        dispatch(setYoung(data));
      }
    } catch (e) {
      console.log(e);
      toastr.error("Une erreur est survenue lors de l'édition de votre convocation", e.message);
    }
    setLoading(false);
  };

  const handleMail = async () => {
    setLoading(true);
    try {
      let template = "cohesion";
      let type = "convocation";
      const { ok, code } = await API.post(`/young/${young._id}/documents/${type}/${template}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
      });
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
      setModal({ isOpen: false, onConfirm: null });
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de l'envoi du document : ", e.message);
      setModal({ isOpen: false, onConfirm: null });
    }
    setLoading(false);
  };

  if (!isEnabled) {
    return (
      <StepCard variant="disabled" index={index}>
        <p className="font-medium text-gray-400">Téléchargez votre convocation</p>
      </StepCard>
    );
  }

  return (
    <StepCard variant={isDone ? "done" : ""} index={index}>
      <div className="flex items-center flex-col md:flex-row gap-3 justify-between text-sm">
        <div>
          <p className="font-semibold">Téléchargez votre convocation</p>
          <p className="mt-1 text-gray-500">Votre convocation sera à présenter à l'arrivée munie d'une pièce d'identité valide.</p>
        </div>
        <div className="w-full md:w-auto mt-1 md:mt-0 flex flex-col md:flex-row-reverse gap-2">
          <button
            onClick={downloadConvocation}
            disabled={loading}
            className={`w-full text-sm px-4 py-2 shadow-sm rounded flex gap-2 justify-center disabled:bg-gray-100 disabled:cursor-wait ${
              isDone ? "border hover:bg-gray-100 text-gray-600" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}>
            <HiOutlineDownload className="h-5 w-5" />
            {loading ? "Chargement" : "Télécharger"}
          </button>

          <button
            onClick={() =>
              setModal({
                isOpen: true,
                title: "Envoi par mail",
                message: "Êtes-vous sûr(e) de vouloir envoyer la convocation par mail ?",
                onConfirm: handleMail,
              })
            }
            className="w-full text-sm border hover:bg-gray-100 text-gray-600 p-2 shadow-sm rounded flex gap-2 justify-center">
            <HiMail className="h-5 w-5" />
            <p className="md:hidden">Envoyer par mail</p>
          </button>

          <button onClick={() => setOpenConvocation(true)} className="w-full text-sm border hover:bg-gray-100 text-gray-600 p-2 shadow-sm rounded flex gap-2 justify-center">
            <HiEye className="h-5 w-5" />
            <p className="md:hidden">Afficher la convocation</p>
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={modal?.isOpen}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onClose={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={modal.onConfirm}
        title="Envoi de document par mail"
        subTitle={`Vous allez recevoir le lien de téléchargement de votre convocation par mail à l'adresse ${young.email}.`}
      />
      <ConvocationModal
        isOpen={openConvocation}
        setIsOpen={setOpenConvocation}
        loading={loading}
        center={center}
        meetingPoint={meetingPoint}
        departureDate={departureDate}
        returnDate={returnDate}
      />
    </StepCard>
  );
}
