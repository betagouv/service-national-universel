import React, { useState } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useHistory } from "react-router-dom";

import { apiURL } from "../../../config";
import SelectStatusApplication from "../../../components/selectStatusApplication";
import api from "../../../services/api";
import MissionView from "./wrapper";
import Panel from "../../volontaires/panel";
import { formatStringLongDate, getFilterLabel, translate, getAge, ES_NO_LIMIT, colors } from "../../../utils";
import Loader from "../../../components/Loader";
import ContractLink from "../../../components/ContractLink";
import ExportComponent from "../../../components/ExportXlsx";
import { DepartmentFilter } from "../../../components/filters";
import { Filter, FilterRow, ResultTable, Table, MultiLine } from "../../../components/list";
import ReactiveListComponent from "../../../components/ReactiveListComponent";

const FILTERS = ["SEARCH", "STATUS", "DEPARTMENT"];

export default ({ mission, applications }) => {
  const [missionTemp, setMissionTemp] = useState(mission);
  const [young, setYoung] = useState();
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
  });
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  const updateMission = async () => {
    const { data, ok } = await api.get(`/mission/${mission._id}`);
    if (ok) setMissionTemp(data);
  };

  if (!applications) return <Loader />;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
        <MissionView mission={missionTemp} tab="youngs">
          <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div style={{ float: "right", marginBottom: "1.5rem", marginRight: "1.5rem" }}>
              <div style={{ display: "flex" }}>
                <ExportComponent
                  title="Exporter les volontaires"
                  defaultQuery={getExportQuery}
                  exportTitle="Volontaire"
                  index="young"
                  react={{ and: FILTERS }}
                  transformAll={async (data) => {
                    const youngIds = [...new Set(data.map((item) => item.youngId))];
                    if (youngIds?.length) {
                      const { responses } = await api.esQuery("young", { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: youngIds } } });
                      if (responses.length) {
                        const youngs = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                        return data.map((item) => ({ ...item, young: youngs.find((e) => e._id === item.youngId) || {} }));
                      }
                    }
                    return data;
                  }}
                  transform={(data) => {
                    return {
                      _id: data._id,
                      Cohorte: data.youngCohort,
                      Prénom: data.youngFirstName,
                      Nom: data.youngLastName,
                      Email: data.youngEmail,
                      Téléphone: data.young.phone,
                      "Adresse du volontaire": data.young.address,
                      "Code postal du volontaire": data.young.zip,
                      "Ville du volontaire": data.young.city,
                      "Département du volontaire": data.young.department,
                      "Région du volontaire": data.young.region,
                      "Mobilité aux alentours de son établissement": data.young.mobilityNearSchool,
                      "Mobilité aux alentours de son domicile": data.young.mobilityNearHome,
                      "Mobilité aux alentours d'un de ses proches": data.young.mobilityNearRelative,
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
                      "Candidature créée lé": data.createdAt,
                      "Candidature mise à jour le": data.updatedAt,
                      "Statut de la candidature": data.status,
                    };
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
                        return `${translate(e)} (${count})`;
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
                            <th width="50%">Volontaire</th>
                            <th>Date</th>
                            <th width="20%">Statut pour la mission</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((hit) => (
                            <Hit key={hit._id} hit={hit} onClick={() => handleClick(hit)} selected={young?._id === hit._id} onChangeApplication={updateMission} />
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
};

const Hit = ({ hit, onClick, onChangeApplication, selected }) => {
  const history = useHistory();
  return (
    <tr style={{ backgroundColor: (selected && "#e6ebfa") || (hit.status === "WITHDRAWN" && colors.extraLightGrey) }} onClick={onClick}>
      <td>
        <MultiLine>
          <h2>{`${hit.youngFirstName} ${hit.youngLastName}`}</h2>
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
            }}
          >
            Contrat d'engagement &gt;
          </ContractLink>
        ) : null}
      </td>
    </tr>
  );
};
