import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import DoubleDayTile from "../../components/DoubleDayTile";
import { formatStringDateTimezoneUTC, translate } from "../../utils";
import DocumentsPM from "../militaryPreparation/components/DocumentsPM";
import ApplyButton from "./components/ApplyButton";
import IconDomain from "./components/IconDomain";
import { AiOutlineClockCircle } from "react-icons/ai";
import House from "./components/HouseIcon";
import { htmlCleaner } from "snu-lib";
import { notifyApiEngagement } from "./utils";
import PageLoader from "@/components/PageLoader";
import ContractButton from "./components/ContractButton";
import ApplicationStatus from "./components/ApplicationStatus";
import InfoStructure from "./components/InfoStructure";
import PiecesJointes from "./components/PiecesJointes";
import useMission from "../phase2/lib/useMission";

export default function ViewDesktop() {
  const { id } = useParams<{ id: string }>();
  const { data: mission, isPending, isError } = useMission(id);
  const docRef = useRef();

  useEffect(() => {
    if (!mission) return;
    notifyApiEngagement(mission);
    return localStorage.removeItem("jva_mission_click_id");
  }, [mission]);

  if (isError) return <div>Une erreur est survenue</div>;
  if (isPending) return <PageLoader />;

  const address = mission.city ? mission.city + (mission.zip ? ` - ${mission.zip}` : "") : null;
  const domains = mission.domains.map((d) => translate(d));
  const tags: string[] = [address, ...domains].map((e) => e);

  return (
    <div className="flex">
      <div className="mx-4 my-4 w-full rounded-xl bg-white pb-12">
        {/* BEGIN HEADER */}

        <div className="flex flex-col justify-between gap-4 border-gray-100 px-12  pt-8 lg:flex-row">
          <div className="flex gap-4">
            {/* icon */}
            <div className="flex items-center">
              <IconDomain domain={mission.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission.domains[0]} />
            </div>

            {/* infos mission */}
            <div className="flex flex-col">
              <div className="">
                <div className="text-xs uppercase text-gray-500">{mission.structureName}</div>
                <div className="text-base font-bold text-gray-900">{mission.name}</div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((e, i) => (
                    <div key={i} className="flex items-center justify-center rounded-full border-[1px] border-gray-200 px-4 py-1 text-xs text-gray-600">
                      {e}
                    </div>
                  ))}
                  {mission.isMilitaryPreparation === "true" ? (
                    <div className="flex items-center justify-center rounded-full border-[1px] border-gray-200 bg-blue-900 px-4 py-1 text-xs text-white">Préparation militaire</div>
                  ) : null}
                  {mission?.hebergement === "true" && (
                    <>
                      {mission.hebergementPayant === "true" ? (
                        <div className="rounded-full bg-yellow-100 p-2">
                          <House id="tooltip-payant" tooltip={"Hébergement payant proposé"} color="#D97706" />
                        </div>
                      ) : (
                        <div className="rounded-full bg-green-50 p-2">
                          <House id="tooltip-gratuit" tooltip={"Hébergement gratuit proposé"} color="#059669" />
                        </div>
                      )}
                    </>
                  )}
                  {mission?.duration ? (
                    <div className="ml-2 flex items-center gap-1">
                      <AiOutlineClockCircle className="text-gray-400" />
                      <div className="text-xs">{mission.duration} heure(s)</div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center lg:!mt-0">{mission.application ? <ApplicationStatus mission={mission} /> : <ApplyButton mission={mission} />}</div>
        </div>
        {/* END HEADER */}

        {/* Bouton de contrat */}
        {mission.application?.contractId && <ContractButton contractId={mission.application.contractId} />}

        <div className="my-8 flex flex-col lg:flex-row ">
          <div className="flex w-full flex-col px-12 lg:w-1/2">
            <div className="mb-2 text-lg font-bold">La mission en quelques mots</div>
            <Detail title="Format" content={translate(mission.format)} />
            <Detail title="Objectifs" content={mission.description} />
            <Detail title="Actions" content={mission.actions} />
            <Detail title="Contraintes" content={mission.contraintes} />
            <InfoStructure title="à propos de la structure" structureId={mission.structureId!} />
          </div>
          <div className="flex w-full flex-col px-12 lg:w-1/2 lg:border-l-[1px] lg:border-gray-100">
            <div className="flex items-center justify-between">
              <div className="mb-2 text-lg font-bold">Informations pratiques</div>
              <DoubleDayTile date1={mission.startAt} date2={mission.endAt} />
            </div>
            <Detail
              title="Date"
              content={
                mission.startAt && mission.endAt ? `Du ${formatStringDateTimezoneUTC(mission.startAt)} au ${formatStringDateTimezoneUTC(mission.endAt)}` : "Aucune date renseignée"
              }
            />
            <Detail title="Fréquence" content={mission.frequence} />
            {mission.duration ? <Detail title="Durée estimée" content={`${mission.duration} heure(s)`} /> : null}
            <Detail title="Période pour réaliser la mission" content={mission.period} />
            <Detail title="Lieu" content={[mission.address, mission.zip, mission.city, mission.department]} />
            {mission?.hebergement === "true" && (
              <div className="rounded-lg bg-white p-3 shadow-sm">
                {mission.hebergementPayant === "true" ? (
                  <div>
                    <div className="flex flex-row justify-between">
                      <div className="text-sm font-bold">Hébergement payant proposé</div>
                      <div className="rounded-full bg-yellow-100 p-2">
                        <House color="#D97706" id="tooltip-payant" tooltip={"Hébergement payant proposé"} />
                      </div>
                    </div>
                    <div className="text-xs">
                      Un hébergement est proposé par la structure d&apos;accueil pour cette mission. Les frais de cet hébergement sont à la charge du volontaire.
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-row justify-between">
                      <div className="text-sm font-bold">Hébergement gratuit proposé</div>
                      <div className="rounded-full bg-green-50 p-2">
                        <House color="#059669" id="tooltip-gratuit" tooltip={"Hébergement gratuit proposé"} />
                      </div>
                    </div>
                    <div className="text-xs">
                      Un hébergement est proposé par la structure d&apos;accueil pour cette mission. Les frais de cet hébergement ne sont pas à la charge du volontaire.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {mission.isMilitaryPreparation === "true" ? (
          <>
            <hr className="text-gray-100" />
            <div className="mx-8 mt-8">
              <DocumentsPM docRef={docRef} />
            </div>
          </>
        ) : null}
        {mission?.application?.status === "VALIDATED" && (
          <>
            <hr className="text-gray-100" />
            <div className="m-8">
              <PiecesJointes mission={mission} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const Detail = ({ title, content }) => {
  const [value] = useState((Array.isArray(content) && content) || [content]);
  return content && content.length ? (
    <div className="my-3">
      <div className="text-xs uppercase text-gray-500">{title}</div>
      {value.map((e, i) => (
        <div key={i} className="text-sm font-normal leading-5" dangerouslySetInnerHTML={{ __html: htmlCleaner(translate(e)) }} />
      ))}
    </div>
  ) : (
    <div />
  );
};
