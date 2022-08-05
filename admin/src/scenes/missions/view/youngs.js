import React, { useState } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { apiURL } from "../../../config";
import SelectStatusApplication from "../../../components/selectStatusApplication";
import api from "../../../services/api";
import MissionView from "./wrapper";
import Panel from "../../volontaires/panel";
import {
  formatStringLongDate,
  formatLongDateUTC,
  formatLongDateUTCWithoutTime,
  getFilterLabel,
  translate,
  getAge,
  ES_NO_LIMIT,
  colors,
  SENDINBLUE_TEMPLATES,
  ROLES,
  translateApplication,
} from "../../../utils";
import Loader from "../../../components/Loader";
import ContractLink from "../../../components/ContractLink";
import ExportComponent from "../../../components/ExportXlsx";
import { DepartmentFilter } from "../../../components/filters";
import { Filter, FilterRow, ResultTable, Table, MultiLine } from "../../../components/list";
import ReactiveListComponent from "../../../components/ReactiveListComponent";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import ModalPJ from "../../volontaires/components/ModalPJ";
import { HiOutlineAdjustments, HiPlus } from "react-icons/hi";
import { MdOutlineAttachFile } from "react-icons/md";

const FILTERS = ["SEARCH", "STATUS", "DEPARTMENT"];

export default function Youngs({ mission, applications, updateMission }) {
  const [young, setYoung] = useState();

  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  const handleClick = async (application) => {
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    if (ok) setYoung(data);
  };

  const getDefaultQuery = () => ({
    query: {
      ids: {
        type: "_doc",
        values: applications?.map((e) => e._id),
      },
    },
    track_total_hits: true,
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  if (!applications) return <Loader />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <MissionView mission={mission} tab="youngs">
          <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div style={{ float: "right", marginBottom: "1.5rem", marginRight: "1.5rem" }}>
              <div style={{ display: "flex" }}>
                <ExportComponent
                  title="Exporter les volontaires"
                  defaultQuery={getExportQuery}
                  exportTitle="Volontaires"
                  index="application"
                  react={{ and: FILTERS }}
                  transform={async (data) => {
                    let all = data;
                    const youngIds = [...new Set(data.map((item) => item.youngId))];
                    if (youngIds?.length) {
                      const { responses } = await api.esQuery("young", { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: youngIds } } });
                      if (responses.length) {
                        const youngs = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                        all = data.map((item) => ({ ...item, young: youngs.find((e) => e._id === item.youngId) || {} }));
                      }
                    }
                    return all.map((data) => {
                      return {
                        _id: data._id,
                        Cohorte: data.youngCohort,
                        Prénom: data.youngFirstName,
                        Nom: data.youngLastName,
                        Email: data.youngEmail,
                        "Date de naissance": formatLongDateUTCWithoutTime(data.youngBirthdateAt),
                        Téléphone: data.young.phone,
                        "Adresse du volontaire": data.young.address,
                        "Code postal du volontaire": data.young.zip,
                        "Ville du volontaire": data.young.city,
                        "Département du volontaire": data.young.department,
                        "Région du volontaire": data.young.region,
                        "Mobilité aux alentours de son établissement": translate(data.young.mobilityNearSchool),
                        "Mobilité aux alentours de son domicile": translate(data.young.mobilityNearHome),
                        "Mobilité aux alentours d'un de ses proches": translate(data.young.mobilityNearRelative),
                        "Mode de transport": data.young.mobilityTransport?.map((t) => translate(t)).join(", "),
                        "Autre mode de transport": data.young.mobilityTransportOther,
                        "Prénom représentant légal 1": data.young.parent1FirstName,
                        "Nom représentant légal 1": data.young.parent1LastName,
                        "Email représentant légal 1": data.young.parent1Email,
                        "Téléphone représentant légal 1": data.young.parent1Phone,
                        "Choix - Ordre de la candidature": data.priority,
                        "Nom de la mission": data.missionName,
                        "Département de la mission": data.missionDepartment,
                        "Région de la mission": data.missionRegion,
                        "Candidature créée lé": formatLongDateUTC(data.createdAt),
                        "Candidature mise à jour le": formatLongDateUTC(data.updatedAt),
                        "Statut de la candidature": translate(data.status),
                        "Pièces jointes à l’engagement": translate(`${optionsType.reduce((sum, option) => sum + data[option]?.length, 0) !== 0}`),
                      };
                    });
                  }}
                />
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Filter>
                  <FilterRow visible>
                    <DataSearch
                      defaultQuery={getDefaultQuery}
                      showIcon={false}
                      placeholder="Rechercher par prénom, nom, email"
                      componentId="SEARCH"
                      dataField={["youngEmail.keyword", "youngFirstName", "youngLastName"]}
                      react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                      // fuzziness={2}
                      style={{ flex: 1, marginRight: "1rem" }}
                      innerClass={{ input: "searchbox" }}
                      autosuggest={false}
                      queryFormat="and"
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="STATUS"
                      dataField="status.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                      renderItem={(e, count) => {
                        return `${translateApplication(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Statut")}
                    />
                    <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} dataField="youngDepartment.keyword" />
                  </FilterRow>
                </Filter>
                <ResultTable>
                  <ReactiveListComponent
                    defaultQuery={getDefaultQuery}
                    react={{ and: FILTERS }}
                    dataField="youngLastName.keyword"
                    sortBy="asc"
                    size={30}
                    render={({ data }) => (
                      <Table>
                        <thead>
                          <tr>
                            <th className="w-5/12 ">Volontaire</th>
                            <th className="w-3/12 ">Date</th>
                            <th className="w-3/12 ">Statut pour la mission </th>
                            <th className="w-1/12">
                              <MdOutlineAttachFile className="w-full" />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((hit) => (
                            <Hit
                              key={hit._id}
                              hit={hit}
                              onClick={() => handleClick(hit)}
                              selected={young?._id === hit._id}
                              onChangeApplication={updateMission}
                              optionsType={optionsType}
                            />
                          ))}
                        </tbody>
                      </Table>
                    )}
                  />
                </ResultTable>
              </div>
            </div>
          </ReactiveBase>
        </MissionView>
        <Panel
          value={young}
          onChange={() => {
            setYoung(null);
          }}
        />
      </div>
    </div>
  );
}

const Hit = ({ hit, onClick, onChangeApplication, selected, optionsType }) => {
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalDurationOpen, setModalDurationOpen] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const [openModalPJ, setOpenModalPJ] = useState(false);
  const history = useHistory();

  return (
    <tr style={{ backgroundColor: (selected && "#e6ebfa") || (hit.status === "WITHDRAWN" && colors.extraLightGrey) }} onClick={onClick}>
      <td>
        <MultiLine>
          <span className="font-bold text-black">{`${hit.youngFirstName} ${hit.youngLastName}`}</span>
          <p>
            {hit.youngBirthdateAt ? `${getAge(hit.youngBirthdateAt)} ans` : null} {`• ${hit.youngCity || ""} (${hit.youngDepartment || ""})`}
          </p>
        </MultiLine>
      </td>
      <td>
        <div>{formatStringLongDate(hit.createdAt)}</div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusApplication hit={hit} callback={onChangeApplication} />
        {hit.status === "VALIDATED" || hit.status === "IN_PROGRESS" || hit.status === "DONE" || hit.status === "ABANDON" ? (
          <ContractLink
            onClick={() => {
              history.push(`/volontaire/${hit.youngId}/phase2/application/${hit._id}/contrat`);
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

        {hit.status === "WAITING_VALIDATION" && [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user.role) && (
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
        {["VALIDATED", "IN_PROGRESS", "DONE"].includes(hit?.status) && (
          <>
            <div className="flex justify-center">
              <div className="bg-blue-600  rounded-full text-white p-2 " onClick={() => setOpenModalPJ(true)}>
                {optionsType.reduce((sum, option) => sum + hit[option]?.length, 0) !== 0 ? <HiOutlineAdjustments /> : <HiPlus />}
              </div>
            </div>
            <ModalPJ
              isOpen={openModalPJ}
              application={hit}
              young={hit}
              optionsType={optionsType}
              onCancel={() => {
                setOpenModalPJ(false);
                onChangeApplication();
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
          </>
        )}
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

const ModifyDurationLink = styled.span`
  color: #007bff;
  :hover {
    text-decoration: underline;
  }
`;
