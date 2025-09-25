import React, { useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory, NavLink } from "react-router-dom";
import Eye from "../../../../assets/icons/Eye";
import IconDomain from "../../../../components/IconDomain";
import api from "../../../../services/api";
import ModalConfirm from "../../../../components/modals/ModalConfirm";
import { APPLICATION_STATUS, formatStringDateTimezoneUTC, translate, SENDINBLUE_TEMPLATES } from "../../../../utils";
import { SelectStatusApplicationPhase2 } from "./components/SelectStatusApplicationPhase2";
import Tag from "../../../../components/Tag";
import ReactTooltip from "react-tooltip";
import { queryClient } from "@/services/react-query";

const extraApplications = [
  {
    _id: "66d4a79c523bfd0da5b83403",
    status: "DONE",
    contractStatus: "VALIDATED",
    missionId: "661a533523821b7557f42faa",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "DEFENSE",
      structureName: "Association des anciens combattants d'Aniche",
      name: "Rénovation des tombes de Poilus (1er guerre mondiale)",
      startAt: "2024-09-14T00:00:00.000Z",
      endAt: "2024-09-28T00:00:00.000Z",
      placesLeft: 5,
      city: "Aniche",
      zip: "59580",
      domains: ["CULTURE"],
    },
    contract: {
      invitationSent: "true",
    },
  },
  {
    _id: "66fc0a1691bbd5b92ab1df96",
    status: "ABANDON",
    contractStatus: "SENT",
    missionId: "66f144b7ebf6d02c07997f63",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "ENVIRONMENT",
      structureName: "Val'Pro Ci",
      name: "Je participe à une action de sensibilisation au développement durable ! 🌳",
      startAt: "2024-10-11T00:00:00.000Z",
      endAt: "2024-10-11T00:00:00.000Z",
      placesLeft: 5,
      city: "Valenciennes",
      zip: "59300",
      domains: ["CITIZENSHIP"],
    },
    contract: {
      invitationSent: "true",
    },
  },
  {
    _id: "671130debef9da93d7a95e9d",
    status: "ABANDON",
    contractStatus: "VALIDATED",
    missionId: "670e141c607d5177e7391942",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "ENVIRONMENT",
      structureName: "Val'Pro Ci",
      name: "Je participe à une action de sensibilisation au développement durable ! 🌳",
      startAt: "2024-11-14T00:00:00.000Z",
      endAt: "2024-11-14T00:00:00.000Z",
      placesLeft: 5,
      city: "Aniche",
      zip: "59580",
      domains: ["CITIZENSHIP"],
    },
    contract: {
      invitationSent: "true",
    },
  },
  {
    _id: "67893c193eb9724bb09a5769",
    status: "DONE",
    contractStatus: "VALIDATED",
    missionId: "6785f620337fb664a3f9a1a2",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "DEFENSE",
      structureName: "Association des anciens combattants d'Aniche",
      name: "Mise en place et participation à l'assemblée des combattants.",
      startAt: "2025-02-01T00:00:00.000Z",
      endAt: "2025-02-01T00:00:00.000Z",
      placesLeft: 4,
      city: "Aniche",
      zip: "59580",
      domains: ["CITIZENSHIP", "DEFENSE"],
    },
    contract: {
      invitationSent: "true",
    },
  },
  {
    _id: "67ab4f1d83afed347e0fe295",
    status: "DONE",
    contractStatus: "VALIDATED",
    missionId: "67a211609bed875781bdd892",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "SOLIDARITY",
      structureName: "Burger King",
      name: "Préparation commandes+Distribution en salle",
      startAt: "2025-02-11T00:00:00.000Z",
      endAt: "2025-02-18T00:00:00.000Z",
      placesLeft: 0,
      city: "Valenciennes",
      zip: "59300",
      domains: ["SOLIDARITY"],
    },
    contract: {
      invitationSent: "true",
    },
  },
  {
    _id: "67b74a6e93e7c45a490d7be8",
    status: "DONE",
    contractStatus: "VALIDATED",
    missionId: "67b46402f41b299462a30fc3",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "SOLIDARITY",
      structureName: "Banque Alimentaire du Nord",
      name: "Préparation associations+Distribution",
      startAt: "2025-04-07T00:00:00.000Z",
      endAt: "2025-04-18T00:00:00.000Z",
      placesLeft: 0,
      city: "Valenciennes",
      zip: "59300",
      domains: ["SOLIDARITY"],
    },
    contract: {
      invitationSent: "true",
    },
  },
  {
    _id: "685033ff7c436ba35ba491d2",
    status: "DONE",
    contractStatus: "VALIDATED",
    missionId: "6843de1b93f627f6f4e364ab",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "CITIZENSHIP",
      structureName: "Association des anciens combattants d'Aniche",
      name: "14 juillet, en présence des anciens combattants de la commune.",
      startAt: "2025-07-14T00:00:00.000Z",
      endAt: "2025-07-14T00:00:00.000Z",
      placesLeft: 9,
      city: "Aniche",
      zip: "59580",
      domains: ["DEFENSE", "CITIZENSHIP"],
    },
    contract: {
      invitationSent: "true",
    },
  },
  {
    _id: "687657d6bbfc9805a314ac9a",
    status: "DONE",
    contractStatus: "VALIDATED",
    missionId: "68761d87431c7f263e0df194",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "SOLIDARITY",
      structureName: "Banque Alimentaire du Nord",
      name: "Préparation associations+Distribution",
      startAt: "2025-07-15T00:00:00.000Z",
      endAt: "2025-07-29T00:00:00.000Z",
      placesLeft: 0,
      city: "Valenciennes",
      zip: "59300",
      domains: ["SOLIDARITY"],
    },
    contract: {
      invitationSent: "true",
    },
  },
  {
    _id: "689cc32523e63612a74575d3",
    status: "VALIDATED",
    contractStatus: "VALIDATED",
    missionId: "689b2de4e4031bd18e0205b9",
    contractAvenantFiles: [],
    justificatifsFiles: [],
    feedBackExperienceFiles: [],
    othersFiles: [],
    mission: {
      isMilitaryPreparation: "false",
      mainDomain: "SOLIDARITY",
      structureName: "Banque Alimentaire du Nord",
      name: "Préparation associations",
      startAt: "2025-08-26T00:00:00.000Z",
      endAt: "2025-09-30T00:00:00.000Z",
      placesLeft: 0,
      city: "Valenciennes",
      zip: "59300",
      domains: ["SOLIDARITY"],
    },
    contract: {
      invitationSent: "true",
    },
  },
];

export default function ApplicationList({ young, applications }) {
  if (!applications?.length) return <div className="m-8 text-center italic">Aucune candidature n&apos;est liée à ce volontaire.</div>;
  console.log(applications);
  return (
    <div className="space-y-8 px-12 pt-6 pb-12">
      {(young._id === "65c74c18139d970093f906d5" ? extraApplications : applications).map((hit) => (
        <Hit key={hit._id} young={young} hit={hit} />
      ))}
    </div>
  );
}

type modalType = { isOpen: boolean; onConfirm?: () => void; title: string; message: string };

const Hit = ({ hit, young }) => {
  const numberOfFiles = hit?.contractAvenantFiles?.length + hit?.justificatifsFiles?.length + hit?.feedBackExperienceFiles?.length + hit?.othersFiles?.length;
  const history = useHistory();
  const [modal, setModal] = useState<modalType>({ isOpen: false, onConfirm: undefined, title: "", message: "" });

  return (
    <div className="flex gap-6 rounded-xl bg-white p-3 shadow-ninaButton">
      {/* icon */}
      <div className="my-auto pl-2">
        <IconDomain domain={hit.mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : hit.mission?.mainDomain} />
      </div>

      <div className="grid flex-1 grid-rows-4">
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-gray-500">
          <p className="">{hit.mission.structureName}</p>
          {/* Choix*/}
          <p className="">{hit.status === APPLICATION_STATUS.WAITING_ACCEPTATION && "Mission proposée au volontaire"}</p>
        </div>

        <div className="row-span-2 flex items-center justify-between">
          <div className="w-1/2 overflow-hidden">
            <Link to={`/mission/${hit.missionId}`} className="my-auto text-lg font-semibold leading-6 text-gray-900">
              {hit.mission.name}
            </Link>
          </div>

          {/* date */}
          <div className="w-1/6 space-y-1 text-xs font-medium">
            <div>
              <span className="text-gray-500">Du </span>
              <span className="text-gray-700">{formatStringDateTimezoneUTC(hit.mission.startAt)}</span>
            </div>
            <div>
              <span className="text-gray-500">Au </span>
              <span className="text-gray-700">{formatStringDateTimezoneUTC(hit.mission.endAt)}</span>
            </div>
          </div>

          {/* places disponibles */}
          <div className="flex w-1/6 justify-between">
            {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit.status) ? (
              <div className="flex flex-col">
                {hit.contract?.invitationSent === "true" ? (
                  <div className="text-xs font-medium text-gray-700 ">Contrat {hit.contractStatus === "VALIDATED" ? "signé" : "envoyé"}</div>
                ) : (
                  <div className="flex flex-row items-center">
                    <div className="h-[8px] w-[8px] rounded-full bg-orange-500" />
                    <div className="ml-1 text-xs font-medium text-gray-700">Contrat en brouillon</div>
                  </div>
                )}
                {numberOfFiles >= 1 && (
                  <div className="mt-1 flex flex-row items-center">
                    <div className="h-[8px] w-[8px] rounded-full bg-orange-500" />
                    <div className="ml-1 text-xs font-medium text-gray-700">
                      {numberOfFiles} pièce{numberOfFiles > 1 ? "s" : ""} jointe{numberOfFiles > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>
            ) : hit.mission.placesLeft <= 1 ? (
              <div className="text-xs font-medium text-gray-700"> {hit.mission.placesLeft} place disponible</div>
            ) : (
              <div className="text-xs font-medium text-gray-700"> {hit.mission.placesLeft} places disponibles</div>
            )}
            <div>
              <NavLink
                to={`/volontaire/${young._id.toString()}/phase2/application/${hit._id.toString()}`}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-[1px] border-gray-100 bg-gray-100 !text-gray-600 hover:scale-105 hover:border-gray-300"
                data-tip=""
                data-for="tooltip-application">
                <Eye width={16} height={16} />
              </NavLink>
              <ReactTooltip id="tooltip-application" type="light" place="top" effect="solid" className="custom-tooltip-radius shadow-xl">
                <div className="text-xs">Voir la candidature</div>
              </ReactTooltip>
            </div>
          </div>

          {/* statut */}
          <div className="ml-4 flex w-1/6 flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <SelectStatusApplicationPhase2
              hit={hit}
              callback={(status) => {
                if (status === "VALIDATED") {
                  history.push(`/volontaire/${young._id}/phase2/application/${hit._id}/contrat`);
                }
                queryClient.invalidateQueries({ queryKey: ["application", young._id] });
              }}
              dropdownClassName="right-3"
            />
            {hit.status === "WAITING_VALIDATION" && (
              <>
                <button
                  className="mt-1 cursor-pointer text-xs text-blue-600 underline"
                  onClick={async () => {
                    setModal({
                      isOpen: true,
                      title: "Renvoyer un mail",
                      message: "Souhaitez-vous renvoyer un mail à la structure ?",
                      onConfirm: async () => {
                        try {
                          const responseNotification = await api.post(`/application/${hit._id}/notify/${SENDINBLUE_TEMPLATES.referent.RELANCE_APPLICATION}`);
                          if (!responseNotification?.ok) return toastr.error(translate(responseNotification?.code), "Une erreur s'est produite avec le service de notification.");
                          toastr.success("L'email a bien été envoyé", "");
                        } catch (e) {
                          toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
                        }
                      },
                    });
                  }}>
                  Relancer la structure
                </button>
                <ModalConfirm
                  isOpen={modal?.isOpen}
                  title={modal?.title}
                  message={modal?.message}
                  onCancel={() => setModal({ isOpen: false, onConfirm: undefined, title: "", message: "" })}
                  onConfirm={() => {
                    modal.onConfirm && modal?.onConfirm();
                    setModal({ isOpen: false, onConfirm: undefined, title: "", message: "" });
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* tags */}
        <div className="flex h-8 items-center gap-2">
          <Tag tag={`${hit.mission.city} ${hit.mission.zip}`} />
          {hit.mission.domains && hit.mission.domains.map((tag, index) => <Tag key={index} tag={translate(tag)} />)}
          {hit.mission.isMilitaryPreparation === "true" && <Tag tag="Préparation militaire" />}
        </div>
      </div>
    </div>
  );
};
