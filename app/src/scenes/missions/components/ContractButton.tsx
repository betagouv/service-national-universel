import ChevronDown from "@/assets/icons/ChevronDown";
import Download from "@/assets/icons/Download";
import Loader from "@/components/Loader";
import ModalConfirm from "@/components/modals/ModalConfirm";
import WithTooltip from "@/components/WithTooltip";
import { capture } from "@/sentry";
import API from "@/services/api";
import useAuth from "@/services/useAuth";
import downloadPDF from "@/utils/download-pdf";
import React, { useEffect, useState } from "react";
import { AiFillClockCircle } from "react-icons/ai";
import { HiOutlineMail } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import rubberStampValided from "../../../assets/rubberStampValided.svg";
import rubberStampNotValided from "../../../assets/rubberStampNotValided.svg";
import useContract from "@/scenes/phase2/lib/useContract";

export default function ContractButton({ contractId }: { contractId: string }) {
  const { young } = useAuth();
  const [openContractButton, setOpenContractButton] = useState<boolean>();
  const [loading, setLoading] = useState(false);
  const refContractButton = React.useRef<HTMLDivElement>(null);
  const { data: contract, isPending, isError } = useContract(contractId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (refContractButton.current && !refContractButton.current.contains(event.target)) {
        setOpenContractButton(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  if (isPending) return <Loader />;
  if (isError) return <div>Une erreur est survenue</div>;

  const contractHasAllValidation = (contract, young) => {
    const isYoungAdult = contract.isYoungAdult === "true";
    return (
      contract.projectManagerStatus === "VALIDATED" &&
      contract.structureManagerStatus === "VALIDATED" &&
      ((isYoungAdult && contract.youngContractStatus === "VALIDATED") ||
        (!isYoungAdult && contract.parent1Status === "VALIDATED" && (!young.parent2Email || contract.parent2Status === "VALIDATED")))
    );
  };

  const viewContract = async (contractId) => {
    await downloadPDF({
      url: `/contract/${contractId}/download`,
      fileName: `${young.firstName} ${young.lastName} - contrat ${contractId}.pdf`,
    });
  };

  return (
    <div className="mx-12 mt-6 flex flex-col gap-7">
      {contractHasAllValidation(contract, young) ? (
        <div className="relative w-1/6" ref={refContractButton}>
          <button
            disabled={loading}
            className="flex w-full items-center justify-between gap-3 rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 hover:border-blue-500 hover:bg-blue-500 disabled:cursor-wait disabled:opacity-50"
            onClick={() => setOpenContractButton((e) => !e)}>
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-xs font-medium leading-4 text-white">Contrat d&apos;engagement</span>
            </div>
            <ChevronDown className="font-medium text-white" />
          </button>
          {/* display options */}
          <div
            className={`${
              openContractButton ? "block" : "hidden"
            }  absolute right-0 top-[40px] z-50 !min-w-full overflow-hidden rounded-lg bg-white shadow transition lg:!min-w-3/4`}>
            <button
              key="download"
              onClick={() => {
                setLoading(true);
                viewContract(contract._id);
                setOpenContractButton(false);
                setLoading(false);
              }}>
              <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                <Download className="h-4 w-4 text-gray-400" />
                <div>Télécharger</div>
              </div>
            </button>
            <SendContractByMail young={young} contractId={contract._id} missionName={contract.missionName} />
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-gray-50  px-10 py-6">
          <div className="flex justify-between">
            <div className="text-lg font-bold">Contrat d’engagement en mission d’intérêt général</div>
            <div className="flex items-center space-x-1  rounded-sm bg-sky-100 px-2 text-xs font-normal text-sky-500">
              <AiFillClockCircle className="text-sky-500" />
              <div>Contrat {contract?.invitationSent ? "envoyé" : "en brouillon"}</div>
            </div>
          </div>
          <div className="mt-1 text-sm">Ce contrat doit être validé par vos représentant(s) légal(aux), votre tuteur de mission et le référent départemental.</div>
          {contract?.invitationSent && (
            <div className="mt-4 grid grid-cols-4   gap-4">
              <StatusContractPeople
                value={contract?.projectManagerStatus}
                description="Représentant de l’État"
                firstName={contract?.projectManagerFirstName}
                lastName={contract?.projectManagerLastName}
              />
              <StatusContractPeople
                value={contract?.structureManagerStatus}
                description="Représentant de la structure"
                firstName={contract?.structureManagerFirstName}
                lastName={contract?.structureManagerLastName}
              />
              {contract?.isYoungAdult === "true" ? (
                <StatusContractPeople value={contract?.youngContractStatus} description="Volontaire" firstName={contract?.youngFirstName} lastName={contract?.youngLastName} />
              ) : (
                <>
                  <StatusContractPeople
                    value={contract?.parent1Status}
                    description="Représentant légal 1"
                    firstName={contract?.parent1FirstName}
                    lastName={contract?.parent1LastName}
                  />
                  {contract?.parent2Email && (
                    <StatusContractPeople
                      value={contract?.parent2Status}
                      description="Représentant légal 2"
                      firstName={contract?.parent2FirstName}
                      lastName={contract?.parent2LastName}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const StatusContractPeople = ({ value, description, firstName, lastName }) => (
  <div className="flex items-center ">
    <WithTooltip tooltipText={`${value === "VALIDATED" ? "" : "En attente de signature"}`}>
      <div className="mr-2">
        {value === "VALIDATED" ? <img src={rubberStampValided} alt="rubberStampValided" /> : <img src={rubberStampNotValided} alt="rubberStampNotValided" />}
      </div>
    </WithTooltip>
    <div>
      <div className="flex space-x-2 font-semibold">
        <div>{firstName}</div>
        <div>{lastName?.toUpperCase()}</div>
      </div>
      <div className="text-xs text-gray-500">{description}</div>
    </div>
  </div>
);

const SendContractByMail = ({ young, contractId, missionName }) => {
  const [modalMail, setModalMail] = useState(false);

  const handleConfirm = async () => {
    try {
      const { ok, code } = await API.post(`/young/${young._id}/documents/contract/2/send-email?contract_id=${contractId}`, {
        fileName: `contrat ${young.firstName} ${young.lastName} - ${missionName}.pdf`,
      });
      if (!ok) throw new Error(translate(code));
      toastr.success("Succès", `Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      toastr.error("Erreur lors de l'envoi du document ", e.message);
    } finally {
      setModalMail(false);
    }
  };

  return (
    <>
      <button className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50" onClick={() => setModalMail(true)}>
        <HiOutlineMail className="h-4 w-4 text-gray-400" />
        <div className="text-sm">Envoyer par mail</div>
      </button>
      <ModalConfirm
        isOpen={modalMail}
        title="Envoi du document par mail"
        message={`Vous allez recevoir le document par mail à l'adresse ${young.email}.`}
        onCancel={() => setModalMail(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
