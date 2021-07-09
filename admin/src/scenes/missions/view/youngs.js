import React, { useState } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";

import { apiURL, environment } from "../../../config";
import SelectStatusApplication from "../../../components/selectStatusApplication";
import api from "../../../services/api";
import MissionView from "./wrapper";
import Panel from "../../volontaires/panel";
import { formatStringLongDate, getFilterLabel, translate, getAge, ES_NO_LIMIT } from "../../../utils";
import Loader from "../../../components/Loader";
import ExportComponent from "../../../components/ExportXlsx";
const FILTERS = ["SEARCH", "STATUS"];
import { Filter, FilterRow, ResultTable, Table, MultiLine } from "../../../components/list";
import ReactiveListComponent from "../../../components/ReactiveListComponent";

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
                {environment !== "production" ? (
                  <ExportComponent
                    title="Exporter les volontaires"
                    defaultQuery={getExportQuery}
                    collection="volontaire"
                    react={{ and: FILTERS }}
                    transformAll={async (data) => {
                      const youngIds = [...new Set(data.map((item) => item.youngId))];
                      if (youngIds?.length) {
                        const { responses } = await api.esQuery([
                          { index: "young", type: "_doc" },
                          { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: youngIds } } },
                        ]);
                        const youngs = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                        return data.map((item) => ({ ...item, young: youngs.find((e) => e._id === item.youngId) }));
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
                        "Mode de transport": data.young.mobilityTransport?.map((t) => translate(t)),
                        "Autre mode de transport": data.young.mobilityTransportOther,
                        "Prénom représentant légal 1": data.young.parent1FirstName,
                        "Nom représentant légal 1": data.young.parent1LastName,
                        "Email représentant légal 1": data.young.parent1Email,
                        "Téléphone représentant légal 1": data.young.parent1Phone,
                        "Nom de la mission": data.missionName,
                        "Département de la mission": data.missionDepartment,
                        "Région de la mission": data.missionRegion,
                        "Candidature créée lé": data.createdAt,
                        "Candidature mise à jour le": data.updatedAt,
                        "Statut de la candidature": data.status,
                      };
                    }}
                  />
                ) : null}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Filter>
                  <DataSearch
                    defaultQuery={getDefaultQuery}
                    showIcon={false}
                    placeholder="Rechercher par prénom, nom, email"
                    componentId="SEARCH"
                    dataField={["youngEmail.keyword", "youngFirstName", "youngLastName"]}
                    react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                    // fuzziness={2}
                    style={{ flex: 2 }}
                    innerClass={{ input: "searchbox" }}
                    autosuggest={false}
                    queryFormat="and"
                  />
                  <FilterRow>
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
  return (
    <tr style={{ backgroundColor: (selected && "#e6ebfa") || (hit.status === "WITHDRAWN" && "#BE3B1211") }} onClick={onClick}>
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
      </td>
    </tr>
  );
};
