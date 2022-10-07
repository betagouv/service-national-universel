import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "../../services/pausible";

import SelectStatusApplication from "../../components/selectStatusApplication";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import ExportComponent from "../../components/ExportXlsx";
import Loader from "../../components/Loader";
import Chevron from "../../components/Chevron";
import ContractLink from "../../components/ContractLink";
import { Filter, FilterRow, ResultTable, Table, Header, Title } from "../../components/list";
import { translate, translateApplication, getFilterLabel, formatStringLongDate, formatStringDateTimezoneUTC, getAge, ES_NO_LIMIT, ROLES } from "../../utils";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import { ModalContainer } from "../../components/modals/Modal";
import ModalButton from "../../components/buttons/ModalButton";
import { Formik, Field } from "formik";
import { Modal } from "reactstrap";

const FILTERS = ["SEARCH", "STATUS", "PHASE", "COHORT", "MISSIONS", "TUTOR"];

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const [missions, setMissions] = useState();
  const [panel, setPanel] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);
  const [columnModalOpen, setColumnModalOpen] = useState(false);

  const history = useHistory();
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => ({
    query: { bool: { filter: { terms: { "missionId.keyword": missions.map((e) => e._id) } } } },
    sort: [{ "youngLastName.keyword": "asc" }],
    track_total_hits: true,
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  async function appendMissions(structure) {
    const missionsResponse = await api.get(`/structure/${structure}/mission`);
    if (!missionsResponse.ok) {
      toastr.error("Oups, une erreur est survenue lors de la récupération des missions", translate(missionsResponse.code));
      return history.push("/");
    }
    return missionsResponse.data;
  }

  async function initMissions(structure) {
    const m = await appendMissions(structure);
    if (user.role === ROLES.SUPERVISOR) {
      const subStructures = await api.get(`/structure/${structure}/children`);
      if (!subStructures.ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des missions des antennes", translate(subStructures.code));
        return history.push("/");
      }
      for (let i = 0; i < subStructures.data.length; i++) {
        const subStructure = subStructures.data[i];
        const tempMissions = await appendMissions(subStructure._id);
        m.push(...tempMissions);
      }
    }
    setMissions(m);
  }

  // Get all missions from structure then get all applications int order to display the volontaires' list.
  useEffect(() => {
    initMissions(user.structureId);
  }, []);

  const handleClick = async (application) => {
    const { ok, data } = await api.get(`/referent/young/${application.youngId}`);
    if (ok) setPanel({ application, young: data });
  };

  if (!missions) return <Loader />;
  const COLUMNS = [
    {
      title: "Identité du volontaire",
      desc: "Prénom, nom, cohorte.",
      value: "identity",
    },
    {
      title: "Contact du volontaire",
      desc: "Email, téléphone.",
      value: "contact",
    },
    {
      title: "Date de naissance du volontaire",
      desc: "Date de naissance.",
      value: "birth",
    },
    {
      title: "Lieu de résidence du volontaire",
      desc: "Adresse postale, code postal, ville.",
      value: "address",
    },
    {
      title: "Localisation du volontaire",
      desc: "Département, académie, région.",
      value: "location",
    },
    {
      title: "Représentant légal 1",
      desc: "Statut, nom, prénom, email, téléphone, adresse, code postal, ville, département et région du représentant légal.",
      value: "representative1",
    },
    {
      title: "Représentant légal 2",
      desc: "Statut, nom, prénom, email, téléphone, adresse, code postal, ville, département et région du représentant légal.",
      value: "representative2",
    },
    {
      title: "Mission",
      desc: "Nom, département et région de la mission",
      value: "mission",
    },
    {
      title: "Candidature",
      desc: "Date de création, date de mise à jour, statut.",
      value: "application",
    },
  ];

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Header>
              <div>
                <Title>Volontaires</Title>
              </div>
              <ExportComponent
                handleClick={() => plausibleEvent("Volontaires/CTA - Exporter volontaires")}
                defaultQuery={getExportQuery}
                title="Exporter les volontaires"
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
                      "Date de naissance": data.youngBirthdateAt,
                      Email: data.youngEmail,
                      Téléphone: data.young.phone,
                      "Adresse du volontaire": data.young.address,
                      "Code postal du volontaire": data.young.zip,
                      "Ville du volontaire": data.young.city,
                      "Département du volontaire": data.young.department,
                      "Prénom représentant légal 1": data.young.parent1FirstName,
                      "Nom représentant légal 1": data.young.parent1LastName,
                      "Email représentant légal 1": data.young.parent1Email,
                      "Téléphone représentant légal 1": data.young.parent1Phone,
                      "Prénom représentant légal 2": data.young.parent2LastName,
                      "Nom représentant légal 2": data.young.parent2LastName,
                      "Email représentant légal 2": data.young.parent2Email,
                      "Téléphone représentant légal 2": data.young.parent2Phone,
                      "Choix - Ordre de la candidature": data.priority,
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
              {/* Column selection modal */}
              {/* Disabled temporarily
              <button
                className="rounded-md py-2 px-4 text-sm text-white bg-snu-purple-300 hover:bg-snu-purple-600 hover:drop-shadow font-semibold"
                onClick={() => setColumnModalOpen(true)}>
                Exporter les volontaires (new)
              </button>
              <Modal toggle={() => setColumnModalOpen(false)} isOpen={columnModalOpen} onCancel={() => setColumnModalOpen(false)} size="xl" centered>
                <ModalContainer>
                  <Formik
                    initialValues={{
                      checked: ["identity", "contact", "birth", "address", "location", "representative1", "representative2", "mission", "application"],
                    }}>
                    {({ values, setFieldValue }) => (
                      <>
                        <div className="text-xl">Sélectionnez les données à exporter</div>
                        <div className="flex w-full p-4">
                          <div className="w-1/2 text-left">Sélectionnez pour choisir des sous-catégories</div>
                          <div className="w-1/2 text-right">
                            {values.checked == "" ? (
                              <div
                                className="text-snu-purple-300 cursor-pointer hover:underline"
                                onClick={() =>
                                  setFieldValue("checked", ["identity", "contact", "birth", "address", "location", "representative1", "representative2", "mission", "application"])
                                }>
                                Tout sélectionner
                              </div>
                            ) : (
                              <div className="text-snu-purple-300 cursor-pointer hover:underline" onClick={() => setFieldValue("checked", [])}>
                                Tout déselectionner
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="h-[60vh] overflow-auto grid grid-cols-2 gap-4 w-full p-3">
                          {COLUMNS.map((cat) => (
                            <div
                              key={cat.value}
                              className="rounded-xl border-2 border-gray-100 px-3 py-2 hover:shadow-ninaButton cursor-pointer"
                              onClick={() => {
                                if (!values.checked.includes(cat.value)) {
                                  const newValues = [...values.checked, cat.value];
                                  setFieldValue("checked", newValues);
                                } else {
                                  const newValues = values.checked.filter((item) => item !== cat.value);
                                  setFieldValue("checked", newValues);
                                }
                              }}>
                              <div className="flex justify-between w-full">
                                <div className="text-left text-lg w-3/4">{cat.title}</div>
                                <div className="h-4">
                                  <Field type="checkbox" name="checked" value={cat.value} />
                                </div>
                              </div>
                              {cat.desc.length > 150 ? (
                                cat.desc.length > 300 ? (
                                  <div className="transition-[height] ease-in-out w-full text-gray-400 text-left h-10 text-ellipsis overflow-hidden hover:h-64 duration-300">
                                    {cat.desc}
                                  </div>
                                ) : (
                                  <div className="transition-[height] ease-in-out w-full text-gray-400 text-left h-10 text-ellipsis overflow-hidden hover:h-36 duration-300">
                                    {cat.desc}
                                  </div>
                                )
                              ) : (
                                <div className="w-full text-gray-400 text-left h-10">{cat.desc}</div>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 justify-center mb-4">
                          <div className="w-1/2 p-0.5">
                            <ModalButton onClick={() => setColumnModalOpen(false)}>Annuler</ModalButton>
                          </div>
                          <div className="flex mt-2 w-1/2 h-10">
                            <ExportComponent
                              handleClick={() => plausibleEvent("Volontaires/CTA - Exporter volontaires")}
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
                                  const COLUMNS = {
                                    identity: {
                                      Prénom: data.youngFirstName,
                                      Nom: data.youngLastName,
                                      Cohorte: data.youngCohort,
                                    },
                                    contact: {
                                      Email: data.youngEmail,
                                      Téléphone: data.young.phone,
                                    },
                                    birth: {
                                      "Date de naissance": data.youngBirthdateAt,
                                    },
                                    address: {
                                      "Adresse du volontaire": data.young.address,
                                      "Code postal du volontaire": data.young.zip,
                                      "Ville du volontaire": data.young.city,
                                    },
                                    location: {
                                      Département: data.young.department,
                                      Académie: data.young.academy,
                                      Région: data.young.region,
                                    },
                                    representative1: {
                                      "Prénom représentant légal 1": data.young.parent1FirstName,
                                      "Nom représentant légal 1": data.young.parent1LastName,
                                      "Email représentant légal 1": data.young.parent1Email,
                                      "Téléphone représentant légal 1": data.young.parent1Phone,
                                    },
                                    representative2: {
                                      "Prénom représentant légal 2": data.young.parent2LastName,
                                      "Nom représentant légal 2": data.young.parent2LastName,
                                      "Email représentant légal 2": data.young.parent2Email,
                                      "Téléphone représentant légal 2": data.young.parent2Phone,
                                    },
                                    mission: {
                                      "Nom de la mission": data.missionName,
                                      "Département de la mission": data.missionDepartment,
                                      "Région de la mission": data.missionRegion,
                                    },
                                    candidature: {
                                      "Candidature créée lé": data.createdAt,
                                      "Candidature mise à jour le": data.updatedAt,
                                      "Statut de la candidature": translate(data.status),
                                      Tuteur: data.tutorName,
                                    },
                                  };

                                  let columns = { ID: data._id };
                                  for (const element of values.checked) {
                                    let key;
                                    for (key in COLUMNS[element]) columns[key] = COLUMNS[element][key];
                                  }
                                  return columns;
                                });
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </Formik>
                </ModalContainer>
              </Modal> */}
              {/* End column selection modal */}
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  showIcon={false}
                  placeholder="Rechercher par mots clés, mission ou volontaire..."
                  componentId="SEARCH"
                  dataField={["youngFirstName", "youngLastName", "youngEmail", "missionName"]}
                  react={{ and: FILTERS }}
                  // fuzziness={2}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                  URLParams={true}
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
                  renderLabel={(items) => getFilterLabel(items, "Statut mission (candidature)", "Statut mission (candidature)")}
                />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Tuteur"
                  componentId="TUTOR"
                  dataField="tutorName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "TUTOR") }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                react={{ and: FILTERS }}
                defaultQuery={getDefaultQuery}
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th width="25%">Volontaire</th>
                        <th width="25%">Mission candidatée</th>
                        <th>Dates</th>
                        <th>Places</th>
                        <th width="20%">Statut de la candidature</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit
                          key={hit._id}
                          hit={hit}
                          onClick={() => handleClick(hit)}
                          selected={panel?.application?._id === hit._id}
                          mission={missions.find((m) => m._id === hit.missionId)}
                        />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel
            value={panel?.young}
            application={panel?.application}
            onChange={() => {
              setPanel(null);
            }}
          />
        </div>
      </ReactiveBase>
    </div>
  );
}

const Hit = ({ hit, onClick, selected, mission }) => {
  const history = useHistory();
  return (
    <tr style={{ backgroundColor: selected ? "#f1f1f1" : "transparent" }} onClick={onClick}>
      <td>
        <TeamMember>
          <div>
            <h2>{`${hit.youngFirstName} ${hit.youngLastName}`}</h2>
            <p>
              {hit.youngBirthdateAt ? `${getAge(hit.youngBirthdateAt)} ans` : null} {`• ${hit.youngCity || ""} (${hit.youngDepartment || ""})`}
            </p>
          </div>
        </TeamMember>
      </td>
      <td>
        <TeamMember>
          <div>
            <h2>
              <span>CHOIX {hit.priority}</span> : {hit.missionName}
            </h2>
            <p>{formatStringLongDate(hit.createdAt)}</p>
          </div>
        </TeamMember>
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
      <td>
        <SelectStatusApplication
          hit={hit}
          callback={(status) => {
            if (status === "VALIDATED") {
              history.push(`/volontaire/${hit.youngId}/phase2/application/${hit._id}/contrat`);
            }
          }}
        />
        {hit.status === "VALIDATED" || hit.status === "IN_PROGRESS" || hit.status === "DONE" || hit.status === "ABANDON" ? (
          <ContractLink
            onClick={() => {
              history.push(`/volontaire/${hit.youngId}/phase2/application/${hit._id}/contrat`);
            }}>
            Contrat d&apos;engagement &gt;
          </ContractLink>
        ) : null}
      </td>
    </tr>
  );
};

const TeamMember = styled.div`
  h2 {
    color: #333;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 5px;
    span {
      color: #5245cc;
      font-size: 12px;
    }
  }
  p {
    color: #606266;
    font-size: 12px;
    margin: 0;
  }
`;
