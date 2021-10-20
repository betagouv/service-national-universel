import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Row } from "reactstrap";
import { ReactiveBase } from "@appbaseio/reactivesearch";

import { apiURL } from "../../../config";
import api from "../../../services/api";
import SelectStatusApplication from "../../../components/selectStatusApplication";
import { APPLICATION_STATUS, formatStringDateTimezoneUTC, ES_NO_LIMIT, translate, SENDINBLUE_TEMPLATES } from "../../../utils";
import { Link, useHistory } from "react-router-dom";
import ProposalMission from "./proposalMission";
import CreateMission from "./createMission";
import PlusSVG from "../../../assets/plus.svg";
import CrossSVG from "../../../assets/cross.svg";
import Loader from "../../../components/Loader";
import ContractLink from "../../../components/ContractLink";
import ExportComponent from "../../../components/ExportXlsx";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default ({ young, onChangeApplication }) => {
  const [applications, setApplications] = useState(null);
  const [createMissionVisible, setCreateMissionVisible] = useState(false);
  const getExportQuery = () => ({ query: { bool: { filter: { term: { "youngId.keyword": young._id } } } }, sort: [{ "priority.keyword": "asc" }], size: ES_NO_LIMIT });

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) return toastr.error("Oups, une erreur est survenue", code);
    data.sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0));
    return setApplications(data);
  };

  if (!applications) return <Loader />;

  return (
    <>
      <Table>
        <thead>
          <tr>
            <th>Missions candidatées</th>
            <th style={{ width: "200px" }}>Dates</th>
            <th style={{ width: "90px" }}>Places</th>
            <th style={{ width: "250px" }}>Statut</th>
          </tr>
        </thead>
        <tbody>
          <>
            {applications.map((hit, i) => (
              <Hit key={hit._id} young={young} hit={hit} index={i} onChangeApplication={onChangeApplication} />
            ))}
          </>
        </tbody>
      </Table>
      {applications.length ? null : <NoResult>Aucune candidature n'est liée à ce volontaire.</NoResult>}
      <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ marginTop: "1rem" }}>
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
                };
              });
            }}
          />
        </div>
      </ReactiveBase>
      <Wrapper style={{ borderBottom: "2px solid #f4f5f7" }}>
        <Legend>Proposer une mission existante au volontaire</Legend>
        <ProposalMission young={young} onSend={getApplications} />
      </Wrapper>
      <ToggleBloc
        visible={createMissionVisible}
        title="Créer une mission personnalisée pour le volontaire"
        onClick={() => {
          setCreateMissionVisible(!createMissionVisible);
        }}
      >
        <CreateMission
          young={young}
          onSend={() => {
            getApplications();
            setCreateMissionVisible(false);
          }}
        />
      </ToggleBloc>
    </>
  );
};

const Hit = ({ hit, index, young, onChangeApplication }) => {
  const [mission, setMission] = useState();
  const [modalDurationOpen, setModalDurationOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const history = useHistory();
  useEffect(() => {
    (async () => {
      if (!hit.missionId) return;
      const { ok, data, code } = await api.get(`/mission/${hit.missionId}`);
      if (!ok) return toastr.error("Oups, une erreur est survenue", code);
      return setMission(data);
    })();
  }, []);

  if (!mission) return null;
  return (
    <tr>
      <td>
        <Mission to={`/mission/${hit.missionId}`}>
          <div>
            <h3>{hit.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "Mission proposée au volontaire" : `Choix ${index + 1}`}</h3>
            <h2>{mission.name}</h2>
            <p>
              {mission.structureName} {`• ${mission.city} (${mission.department})`}
            </p>
          </div>
        </Mission>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDateTimezoneUTC(mission.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDateTimezoneUTC(mission.endAt)}
        </div>
      </td>
      <td>
        {mission.placesTotal <= 1 ? `${mission.placesTotal} place` : `${mission.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {mission.placesTotal - mission.placesLeft} / {mission.placesTotal}
        </div>
      </td>
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
            }}
          >
            Contrat d'engagement &gt;
          </ContractLink>
        ) : null}
        {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit.status) && (
          <div>
            <div style={{ textAlign: "center" }}>
              {!hit.missionDuration ? (
                <ModifyDurationLink onClick={() => setModalDurationOpen(true)}>Indiquer un nombre d'heure</ModifyDurationLink>
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
              }}
            >
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
        {hit.status === "WAITING_VERIFICATION" && (
          <React.Fragment>
            <CopyLink
              onClick={async () => {
                setModal({
                  isOpen: true,
                  title: "Envoyer un rappel",
                  message: "Souhaitez-vous envoyer un mail au volontaire pour lui rappeler de remplir les documents pour la préparation militaire ?",
                  onConfirm: async () => {
                    try {
                      const responseNotification = await api.post(`/application/${hit._id}/notify/${SENDINBLUE_TEMPLATES.young.MILITARY_PREPARATION_DOCS_REMINDER_RENOTIFY}`);
                      if (!responseNotification?.ok) return toastr.error(translate(responseNotification?.code), "Une erreur s'est produite avec le service de notification.");
                      toastr.success("L'email a bien été envoyé");
                    } catch (e) {
                      toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
                    }
                  },
                });
              }}
            >
              ✉️ Envoyer un rappel au volontaire
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
    </tr>
  );
};

const ToggleBloc = ({ children, title, borderBottom, borderRight, borderLeft, disabled, onClick, visible }) => {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}
    >
      <Wrapper>
        <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <Legend>{title}</Legend>
          <div style={{}}>
            <Icon src={visible ? CrossSVG : PlusSVG} />
          </div>
        </div>
        {visible ? children : null}
      </Wrapper>
    </Row>
  );
};

const Icon = styled.img`
  height: 18px;
  font-size: 18px;
  cursor: pointer;
`;

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

const Mission = styled(Link)`
  h3 {
    color: #5245cc;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 500;
  }
  h2 {
    color: #333;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 5px;
  }
  p {
    color: #606266;
    font-size: 12px;
    margin: 0;
  }
`;

const Wrapper = styled.div`
  padding: 3rem;
  width: 100%;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  p {
    font-size: 13px;
    color: #798399;
    margin-top: 1rem;
  }
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  font-size: 1.3rem;
  font-weight: 500;
`;

const ModifyDurationLink = styled.span`
  color: #007bff;
  :hover {
    text-decoration: underline;
  }
`;
