import { ReactiveBase } from "@appbaseio/reactivesearch";
import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";
import ContractLink from "../../../components/ContractLink";
import ExportComponent from "../../../components/ExportXlsx";
import Loader from "../../../components/Loader";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalPJ from "../components/ModalPJ";
import { HiOutlineAdjustments, HiPlus } from "react-icons/hi";
import { MdOutlineAttachFile } from "react-icons/md";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import SelectStatusApplication from "../../../components/selectStatusApplication";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { APPLICATION_STATUS, ES_NO_LIMIT, formatStringDateTimezoneUTC, SENDINBLUE_TEMPLATES, translate } from "../../../utils";
import { capture } from "../../../sentry";
import IconDomain from "../../../components/IconDomain";

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
  console.log("appliction==>", applications);
  return (
    <>
      <Table>
        <thead>
          <tr>
            <th className="w-5/12">Missions candidatées</th>
            <th className="w-2/12">Dates</th>
            <th className="w-1/12">Places</th>
            <th className="w-3/12">Statut</th>
            <th className="w-1/12">
              <div className="flex justify-center">
                <MdOutlineAttachFile />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <>
            {applications.map((hit, i) => (
              <Hit key={hit._id} young={young} hit={hit} index={i} onChangeApplication={onChangeApplication} optionsType={optionsType} />
            ))}
          </>
        </tbody>
      </Table>
      {applications.length ? null : <NoResult>Aucune candidature n&apos;est liée à ce volontaire.</NoResult>}
      <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div className="px-4 py-2">
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
        </div>
      </ReactiveBase>
    </>
  );
}

const Hit = ({ hit, index, young, onChangeApplication, optionsType }) => {
  const [mission, setMission] = useState();
  const [modalDurationOpen, setModalDurationOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const history = useHistory();
  useEffect(() => {
    (async () => {
      if (!hit.missionId) return;
      const { ok, data, code } = await api.get(`/mission/${hit.missionId}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      return setMission(data);
    })();
  }, []);

  const [openModalPJ, setOpenModalPJ] = useState(false);
  console.log("mission==>", mission);
  if (!mission) return null;
  return (
    <tr>
      <td>
        <Link to={`/mission/${hit.missionId}`}>
          <div className="flex flex-1">
            <div className="flex items-center mr-4">
              <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
            </div>
            {/* A déplacer */}
            {/* <div className="text-snu-purple-300 font-medium uppercase text-xs mb-2">
              {hit.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "Mission proposée au volontaire" : `Choix ${index + 1}`}
            </div> */}
            <div>
              <div className="uppercase text-gray-500 font-medium text-[11px] tracking-wider">{mission.structureName}</div>
              <div className="text-[#242526] font-bold text-base">{mission.name}</div>
              <div className="text-coolGray-500 text-xs">{`• ${mission.city} (${mission.department})`}</div>
            </div>
          </div>
        </Link>
      </td>
      <td>
        <div>
          <span className="text-gray-500 mr-1 text-xs">Du</span>
          <span className="text-[#242526] text-xs">{formatStringDateTimezoneUTC(mission.startAt)}</span>
        </div>
        <div>
          <span className="text-gray-500 text-xs mr-1">Au</span>
          <span className="text-[#242526] text-xs">{formatStringDateTimezoneUTC(mission.endAt)}</span>
        </div>
      </td>
      <td>{mission.placesLeft <= 1 ? <div> {mission.placesLeft} place disponible</div> : <div> {mission.placesLeft} places disponibles</div>}</td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplication
          hit={hit}
          callback={(status) => {
            if (status === "VALIDATED") {
              history.push(`/volontaire/${young._id}/phase2/application/${hit._id}/contrat`);
            }
            onChangeApplication();
          }}
        />
        {hit.status === "VALIDATED" || hit.status === "IN_PROGRESS" || hit.status === "DONE" || hit.status === "ABANDON" ? (
          <ContractLink
            onClick={() => {
              history.push(`/volontaire/${young._id}/phase2/application/${hit._id}/contrat`);
            }}>
            Contrat d&apos;engagement &gt;
          </ContractLink>
        ) : null}
        {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit.status) && (
          <div>
            <div style={{ textAlign: "center" }}>
              {!hit.missionDuration ? (
                <ModifyDurationLink onClick={() => setModalDurationOpen(true)}>Indiquer un nombre d&apos;heure</ModifyDurationLink>
              ) : (
                <span>
                  Durée : {hit.missionDuration}h - <ModifyDurationLink onClick={() => setModalDurationOpen(true)}>Modifier</ModifyDurationLink>
                </span>
              )}
            </div>
            <ModalConfirmWithMessage
              isOpen={modalDurationOpen}
              title="Validation de réalisation de mission"
              message={`Merci de valider le nombre d'heures effectuées par ${hit.youngFirstName} pour la mission ${hit.missionName}.`}
              type="number"
              onChange={() => setModalDurationOpen(false)}
              defaultInput={hit.missionDuration}
              placeholder="Nombre d'heures"
              onConfirm={async (duration) => {
                try {
                  const { ok, code } = await api.put("/application", { _id: hit._id, missionDuration: duration });
                  if (!ok) {
                    toastr.error("Une erreur s'est produite :", translate(code));
                  } else {
                    onChangeApplication();
                    toastr.success("Mis à jour!");
                  }
                } catch (e) {
                  toastr.error("Une erreur s'est produite :", translate(e?.code));
                }
                setModalDurationOpen(false);
              }}
            />
          </div>
        )}
        {hit.status === "WAITING_VALIDATION" && (
          <React.Fragment>
            <CopyLink
              onClick={async () => {
                setModal({
                  isOpen: true,
                  title: "Renvoyer un mail",
                  message: "Souhaitez-vous renvoyer un mail à la structure ?",
                  onConfirm: async () => {
                    try {
                      const responseNotification = await api.post(`/application/${hit._id}/notify/${SENDINBLUE_TEMPLATES.referent.NEW_APPLICATION}`);
                      if (!responseNotification?.ok) return toastr.error(translate(responseNotification?.code), "Une erreur s'est produite avec le service de notification.");
                      toastr.success("L'email a bien été envoyé");
                    } catch (e) {
                      toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
                    }
                  },
                });
              }}>
              ✉️ Renvoyer un mail à la structure
            </CopyLink>
            <ModalConfirm
              isOpen={modal?.isOpen}
              title={modal?.title}
              message={modal?.message}
              onCancel={() => setModal({ isOpen: false, onConfirm: null })}
              onConfirm={() => {
                modal?.onConfirm();
                setModal({ isOpen: false, onConfirm: null });
              }}
            />
          </React.Fragment>
        )}
      </td>
      <td>
        {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit.status) && (
          <div className=" flex justify-center ">
            <div className="bg-blue-600  rounded-full p-2 text-white" onClick={() => setOpenModalPJ(true)}>
              {optionsType.reduce((sum, option) => sum + hit[option].length, 0) !== 0 ? <HiOutlineAdjustments /> : <HiPlus />}
            </div>
          </div>
        )}
        <ModalPJ
          isOpen={openModalPJ}
          young={young}
          application={hit}
          optionsType={optionsType}
          onCancel={() => {
            setOpenModalPJ(false);
          }}
          onSend={async (type, multipleDocument) => {
            try {
              const responseNotification = await api.post(`/application/${hit._id}/notify/${SENDINBLUE_TEMPLATES.ATTACHEMENT_PHASE_2_APPLICATION}`, {
                type,
                multipleDocument,
              });
              if (!responseNotification?.ok) return toastr.error(translate(responseNotification?.code), "Une erreur s'est produite avec le service de notification.");
              toastr.success("L'email a bien été envoyé");
            } catch (e) {
              toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
            }
          }}
          onSave={() => {
            setOpenModalPJ(false);
            onChangeApplication();
          }}
        />
      </td>
    </tr>
  );
};

const CopyLink = styled.button`
  background: none;
  color: rgb(81, 69, 205);
  font-size: 0.8rem;
  font-style: italic;
  margin: 0 auto;
  display: block;
  border: none;
  :hover {
    outline: none;
    text-decoration: underline;
  }
  padding: 0;
`;

const NoResult = styled.div`
  text-align: center;
  font-style: italic;
  margin: 2rem;
`;
const Table = styled.table`
  width: 100%;
  color: #242526;
  margin-top: 10px;
  th {
    border-bottom: 1px solid #f4f5f7;
    padding: 15px;
    font-weight: 400;
    font-size: 14px;
    text-transform: uppercase;
  }
  td {
    padding: 15px;
    font-size: 14px;
    font-weight: 300;
    strong {
      font-weight: 700;
      margin-bottom: 5px;
      display: block;
    }
  }
  td:first-child,
  th:first-child {
    padding-left: 25px;
  }
  tbody tr {
    border-bottom: 1px solid #f4f5f7;
    :hover {
      background-color: #e6ebfa;
    }
  }
`;

const ModifyDurationLink = styled.span`
  color: #007bff;
  :hover {
    text-decoration: underline;
  }
`;
