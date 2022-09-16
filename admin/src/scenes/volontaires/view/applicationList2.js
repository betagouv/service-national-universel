import { ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import ContractLink from "../../../components/ContractLink";
import ExportComponent from "../../../components/ExportXlsx";
import Loader from "../../../components/Loader";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalPJ from "../components/ModalPJ";
import { HiOutlineAdjustments, HiPlus } from "react-icons/hi";
import { MdOutlineAttachFile } from "react-icons/md";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import SelectStatusApplication from "../../../components/selectStatusApplication";
import { apiURL, environment } from "../../../config";
import api from "../../../services/api";
import { APPLICATION_STATUS, ES_NO_LIMIT, formatStringDateTimezoneUTC, SENDINBLUE_TEMPLATES, translate } from "../../../utils";
import { capture } from "../../../sentry";
import IconDomain from "../../../components/IconDomain";
import GrayListIcon from "../../../assets/grayListIcon.svg";
import BorderBottom from "../../../assets/borderBottom.svg";
import ExportComponent2 from "../../../components/ExportXlsx2";
import SelectStatusApplication2 from "../../../components/selectStatusApplication2";

export default function ApplicationList({ young, onChangeApplication }) {
  const [applications, setApplications] = useState(null);
  const getExportQuery = () => ({ query: { bool: { filter: { term: { "youngId.keyword": young._id } } } }, sort: [{ "priority.keyword": "asc" }], size: ES_NO_LIMIT });
  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) {
      capture(code);
      return toastr.error("Oups, une erreur est survenue", code);
    }
    data.sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0));
    return setApplications(data);
  };

  if (!applications) return <Loader />;
  return (
    <div className="p-1">
      <div className="ml-8 my-4 flex ">
        <img src={GrayListIcon} />
        <div className="text-sm text-gray-500 font-medium ml-2">Missions candidatées</div>
      </div>
      <div className="mb-4">
        <img className="w-full" src={BorderBottom} alt="" />
      </div>
      <div className="flex mx-14 mb-2 justify-end">
        {/* <div>Filtre</div> */}
        <div>
          <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div className="py-2">
              {environment === "production" ? (
                <ExportComponent
                  defaultQuery={getExportQuery}
                  title="Exporter les candidatures"
                  exportTitle={`Candidatures-${young.firstName}-${young.lastName}`}
                  index="application"
                  transform={(all) => {
                    return all.map((data) => {
                      return {
                        _id: data._id,
                        Cohorte: data.youngCohort,
                        Prénom: data.youngFirstName,
                        Nom: data.youngLastName,
                        "Date de naissance": data.youngBirthdateAt,
                        Email: data.youngEmail,
                        Téléphone: young.phone,
                        "Adresse du volontaire": young.address,
                        "Code postal du volontaire": young.zip,
                        "Ville du volontaire": young.city,
                        "Département du volontaire": young.department,
                        "Prénom représentant légal 1": young.parent1FirstName,
                        "Nom représentant légal 1": young.parent1LastName,
                        "Email représentant légal 1": young.parent1Email,
                        "Téléphone représentant légal 1": young.parent1Phone,
                        "Prénom représentant légal 2": young.parent2LastName,
                        "Nom représentant légal 2": young.parent2LastName,
                        "Email représentant légal 2": young.parent2Email,
                        "Téléphone représentant légal 2": young.parent2Phone,
                        Choix: data.priority,
                        "Nom de la mission": data.missionName,
                        "Département de la mission": data.missionDepartment,
                        "Région de la mission": data.missionRegion,
                        "Candidature créée lé": data.createdAt,
                        "Candidature mise à jour le": data.updatedAt,
                        "Statut de la candidature": translate(data.status),
                        Tuteur: data.tutorName,
                        "Pièces jointes à l’engagement": translate(`${optionsType.reduce((sum, option) => sum + data[option].length, 0) !== 0}`),
                      };
                    });
                  }}
                />
              ) : (
                <ExportComponent2
                  defaultQuery={getExportQuery}
                  title="Exporter les candidatures"
                  exportTitle={`Candidatures-${young.firstName}-${young.lastName}`}
                  index="application"
                  transform={(all) => {
                    return all.map((data) => {
                      return {
                        _id: data._id,
                        Cohorte: data.youngCohort,
                        Prénom: data.youngFirstName,
                        Nom: data.youngLastName,
                        "Date de naissance": data.youngBirthdateAt,
                        Email: data.youngEmail,
                        Téléphone: young.phone,
                        "Adresse du volontaire": young.address,
                        "Code postal du volontaire": young.zip,
                        "Ville du volontaire": young.city,
                        "Département du volontaire": young.department,
                        "Prénom représentant légal 1": young.parent1FirstName,
                        "Nom représentant légal 1": young.parent1LastName,
                        "Email représentant légal 1": young.parent1Email,
                        "Téléphone représentant légal 1": young.parent1Phone,
                        "Prénom représentant légal 2": young.parent2LastName,
                        "Nom représentant légal 2": young.parent2LastName,
                        "Email représentant légal 2": young.parent2Email,
                        "Téléphone représentant légal 2": young.parent2Phone,
                        Choix: data.priority,
                        "Nom de la mission": data.missionName,
                        "Département de la mission": data.missionDepartment,
                        "Région de la mission": data.missionRegion,
                        "Candidature créée lé": data.createdAt,
                        "Candidature mise à jour le": data.updatedAt,
                        "Statut de la candidature": translate(data.status),
                        Tuteur: data.tutorName,
                        "Pièces jointes à l’engagement": translate(`${optionsType.reduce((sum, option) => sum + data[option].length, 0) !== 0}`),
                      };
                    });
                  }}
                />
              )}
            </div>
          </ReactiveBase>
        </div>
      </div>

      {/* Mission card */}
      <div className="mx-14 ">
        {applications.map((hit, i) => (
          <Hit key={hit._id} young={young} hit={hit} index={i} onChangeApplication={onChangeApplication} optionsType={optionsType} />
        ))}

        {applications.length ? null : <div className="italic text-center m-8">Aucune candidature n&apos;est liée à ce volontaire.</div>}
      </div>
    </div>
  );
}

const Hit = ({ hit, index, young, onChangeApplication, optionsType }) => {
  const [mission, setMission] = useState();
  const [modalDurationOpen, setModalDurationOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [tags, setTags] = useState();

  const history = useHistory();
  useEffect(() => {
    (async () => {
      if (!hit.missionId) return;
      const { ok, data, code } = await api.get(`/mission/${hit.missionId}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setMission(data);
      const t = [];
      data?.city && t.push(data?.city + (data?.zip ? ` - ${data?.zip}` : ""));
      (data?.domains || []).forEach((d) => t.push(translate(d)));
      setTags(t);
    })();
  }, []);

  const [openModalPJ, setOpenModalPJ] = useState(false);

  if (!mission) return null;
  return (
    <div className="relative w-full  bg-white shadow-nina rounded-xl p-4 border-[1px] border-white hover:border-gray-200 shadow-ninaButton mb-4">
      {/* Choix*/}
      <div className="text-gray-500 font-medium uppercase text-xs flex justify-end tracking-wider mb-2">
        {hit.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "Mission proposée au volontaire" : `Choix ${index + 1}`}
      </div>
      <div className="flex justify-between  ">
        <Link className="flex flex-1 items-center" to={`/mission/${hit.missionId}`}>
          {/* icon */}
          <div className="flex items-center mr-4">
            <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
          </div>
          {/* mission info */}
          <div className="flex flex-col flex-1 justify-center">
            <div className="uppercase text-gray-500 font-medium text-[11px] tracking-wider mb-1">{mission.structureName}</div>
            <div className="text-[#242526] font-bold text-base mb-2">{mission.name}</div>
            {/* tags */}
            {tags && (
              <div className=" inline-flex flex-wrap">
                {tags.map((tag, index) => {
                  return (
                    <div
                      key={index}
                      className=" flex text-[11px] text-gray-600 rounded-full border-gray-200 border-[1px] justify-center items-center mb-2 mt-1 mr-1 px-3  py-0.5 font-medium ">
                      {tag}
                    </div>
                  );
                })}
                {mission.isMilitaryPreparation === "true" ? (
                  <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full text-[11px] mb-2 mr-1 px-3 py-0.5 font-medium">
                    Préparation militaire
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </Link>
        <div className="flex flex-1 justify-between items-center">
          {/* date */}
          <div className="flex flex-col basis-[20%] justify-center">
            <div>
              <span className="text-gray-500 mr-1 text-xs">Du</span>
              <span className="text-[#242526] text-xs">{formatStringDateTimezoneUTC(mission.startAt)}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-1">Au</span>
              <span className="text-[#242526] text-xs">{formatStringDateTimezoneUTC(mission.endAt)}</span>
            </div>
          </div>

          {/* places disponibles */}
          <div className="flex basis-[25%]">
            {mission.placesLeft <= 1 ? (
              <div className="font-medium text-xs text-gray-700 "> {mission.placesLeft} place disponible</div>
            ) : (
              <div className="font-medium text-xs text-gray-700"> {mission.placesLeft} places disponibles</div>
            )}
          </div>
          <div className="flex flex-col basis-[35%] justify-end">
            {/* statut */}
            <div onClick={(e) => e.stopPropagation()}>
              <div>
                {environment === "production" ? (
                  <SelectStatusApplication
                    hit={hit}
                    callback={(status) => {
                      if (status === "VALIDATED") {
                        history.push(`/volontaire/${young._id}/phase2/application/${hit._id}/contrat`);
                      }
                      onChangeApplication();
                    }}
                  />
                ) : (
                  <SelectStatusApplication2
                    hit={hit}
                    callback={(status) => {
                      if (status === "VALIDATED") {
                        history.push(`/volontaire/${young._id}/phase2/application/${hit._id}/contrat`);
                      }
                      onChangeApplication();
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          {/* end statut */}
        </div>
      </div>
    </div>
  );
};
