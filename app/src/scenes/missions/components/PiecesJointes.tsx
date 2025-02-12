import FileCard from "@/scenes/militaryPreparation/components/FileCard";
import useAuth from "@/services/useAuth";
import React, { useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { HiPlus } from "react-icons/hi";
import { SENDINBLUE_TEMPLATES, translate, translateAddFilePhase2WithoutPreposition } from "snu-lib";
import ModalPJ from "./ModalPJ";
import { queryClient } from "@/services/react-query";
import { toastr } from "react-redux-toastr";
import API from "@/services/api";
import { MissionAndApplicationType } from "@/scenes/phase2/engagement.repository";

type ModalDocument = {
  isOpen: boolean;
  name?: string;
  stepOne?: boolean;
};

export default function PiecesJointes({ mission }: { mission: MissionAndApplicationType }) {
  const [modalDocument, setModalDocument] = useState<ModalDocument>({ isOpen: false });
  const [openAttachments, setOpenAttachments] = useState(false);
  const { young } = useAuth();
  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  if (!mission.application) return <div>Une erreur est survenue</div>;

  async function handleSend(type, multipleDocument) {
    try {
      const responseNotification = await API.post(`/application/${mission.application!._id}/notify/${SENDINBLUE_TEMPLATES.ATTACHEMENT_PHASE_2_APPLICATION}`, {
        type,
        multipleDocument,
      });
      if (!responseNotification?.ok) return toastr.error(translate(responseNotification?.code), "Une erreur s'est produite avec le service de notification.");
      toastr.success("Succès", "L'email a bien été envoyé");
    } catch (e) {
      toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
    }
  }

  function handleSave() {
    setModalDocument({ isOpen: false });
    queryClient.invalidateQueries({ queryKey: ["mission", mission._id] });
  }

  function handleCancel() {
    setModalDocument({ isOpen: false });
  }

  return (
    <>
      <div className="flex justify-between">
        <div className="text-lg font-semibold leading-6">Pièces jointes</div>
        <div className="flex items-center space-x-4">
          {optionsType.reduce((nmb, option) => nmb + mission.application![option].length, 0) !== 0 && (
            <button
              className="group flex items-center rounded-lg border-[1px] border-blue-600 py-2 px-10 text-center text-sm text-blue-600 transition duration-100 ease-in-out hover:bg-blue-600 hover:text-white"
              onClick={() => setOpenAttachments(!openAttachments)}>
              Voir mes pièces jointes
              <BsChevronDown className={`ml-3 h-5 w-5 text-blue-600 group-hover:text-white ${openAttachments ? "rotate-180" : ""}`} />
            </button>
          )}
          <button
            className="rounded-full bg-blue-600  p-2 text-white "
            onClick={() => {
              setModalDocument({
                isOpen: true,
                stepOne: true,
              });
            }}>
            <HiPlus />
          </button>
        </div>
      </div>
      {openAttachments && (
        <div className="my-4 flex w-full flex-row gap-4 overflow-x-auto ">
          {optionsType.map(
            (option, index) =>
              mission.application![option].length > 0 && (
                <FileCard
                  key={index}
                  name={translateAddFilePhase2WithoutPreposition(option)}
                  icon="reglement"
                  filled={mission.application![option].length}
                  color="text-blue-600 bg-white"
                  status="Modifier"
                  onClick={() =>
                    setModalDocument({
                      isOpen: true,
                      name: option,
                      stepOne: false,
                    })
                  }
                />
              ),
          )}
        </div>
      )}
      <ModalPJ
        isOpen={modalDocument?.isOpen}
        name={modalDocument?.name}
        young={young}
        application={mission.application}
        optionsType={optionsType}
        onCancel={handleCancel}
        onSend={handleSend}
        onSave={handleSave}
        typeChose={modalDocument?.stepOne}
      />
    </>
  );
}
