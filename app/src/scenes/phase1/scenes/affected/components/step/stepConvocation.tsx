import React from "react";
import { useToggle } from "react-use";
import { useDownloadConvocation, useSendConvocationByEmail, useValidateConvocationStep } from "../../utils/convocationMutations";
import { StepCard } from "../StepCard";
import ConfirmationModal from "@/components/ui/modals/ConfirmationModal";
import ConvocationModal from "../modals/ConvocationModal";
import { HiEye, HiMail, HiOutlineDownload } from "react-icons/hi";
// eslint-disable-next-line import/extensions
import { STEPS, useSteps } from "../../utils/steps.utils";
import useAuth from "@/services/useAuth";
import plausibleEvent from "@/services/plausible";

export default function StepConvocation() {
  const index = 3;
  const { young, isCLE } = useAuth();
  const { isStepDone } = useSteps();
  const isEnabled = isStepDone(STEPS.AGREEMENT);
  const isDone = isStepDone(STEPS.CONVOCATION);
  const [isEmailOpen, setIsEmailOpen] = useToggle(false);
  const [isConvocationOpen, setIsConvocationOpen] = useToggle(false);
  const { mutate: download, isPending: isDownloadPending } = useDownloadConvocation();
  const { mutate: sendByEmail } = useSendConvocationByEmail();
  const { mutate: validateStep } = useValidateConvocationStep();

  const handleDownload = () => {
    plausibleEvent("Phase1/telechargement convocation");
    download();
  };

  const handleView = () => {
    setIsConvocationOpen(true);
    if (!isDone) {
      validateStep();
    }
  };

  const handleMail = () => {
    sendByEmail();
    setIsEmailOpen(false);
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
          {isCLE ? (
            <p className="mt-1 text-gray-500">Consultez votre convocation avant votre départ.</p>
          ) : (
            <p className="mt-1 text-gray-500">Votre convocation sera à présenter à l'arrivée munie d'une pièce d'identité valide.</p>
          )}
        </div>
        <div className="w-full md:w-auto mt-1 md:mt-0 flex flex-col md:flex-row-reverse gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloadPending}
            className={`w-full text-sm px-4 py-2 shadow-sm rounded flex gap-2 justify-center disabled:bg-gray-100 disabled:cursor-wait ${
              isDone ? "border hover:bg-gray-100 text-gray-600" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}>
            <HiOutlineDownload className="h-5 w-5" />
            {isDownloadPending ? "Chargement" : "Télécharger"}
          </button>

          <button onClick={() => setIsEmailOpen()} className="w-full text-sm border hover:bg-gray-100 text-gray-600 p-2 shadow-sm rounded flex gap-2 justify-center">
            <HiMail className="h-5 w-5" />
            <p className="md:hidden">Envoyer par mail</p>
          </button>

          <button onClick={handleView} className="w-full text-sm border hover:bg-gray-100 text-gray-600 p-2 shadow-sm rounded flex gap-2 justify-center">
            <HiEye className="h-5 w-5" />
            <p className="md:hidden">Afficher la convocation</p>
          </button>
        </div>
      </div>
      <ConfirmationModal
        isOpen={isEmailOpen}
        onCancel={() => setIsEmailOpen()}
        onClose={() => setIsEmailOpen()}
        onConfirm={handleMail}
        title="Envoi de document par mail"
        subTitle={`Vous allez recevoir le lien de téléchargement de votre convocation par mail à l'adresse ${young.email}.`}
      />
      <ConvocationModal isOpen={isConvocationOpen} setIsOpen={setIsConvocationOpen} />
    </StepCard>
  );
}
