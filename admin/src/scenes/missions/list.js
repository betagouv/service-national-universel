import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { formatStringDate, translate, getFilterLabel, formatLongDateFR, formatDateFR, ES_NO_LIMIT } from "../../utils";
import SelectStatusMission from "../../components/selectStatusMission";
import VioletButton from "../../components/buttons/VioletButton";
import Loader from "../../components/Loader";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine } from "../../components/list";
import ReactiveListComponent from "../../components/ReactiveListComponent";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "PLACES", "LOCATION", "TUTOR", "REGION", "DEPARTMENT", "STRUCTURE"];

export default () => {
  const [mission, setMission] = useState(null);
  const [structureIds, setStructureIds] = useState();
  const user = useSelector((state) => state.Auth.user);
  const getDefaultQuery = () => {
    if (user.role === "supervisor") return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } } };
    return { query: { match_all: {} } };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  useEffect(() => {
    if (user.role !== "supervisor") return;
    (async () => {
      const { data } = await api.get(`/structure/network/${user.structureId}`);
      const ids = data.map((s) => s._id);
      setStructureIds(ids);
    })();
    return;
  }, []);
  if (user.role === "supervisor" && !structureIds) return <Loader />;

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Missions</Title>
              </div>
              {user.role === "responsible" && user.structureId && (
                <Link to={`/mission/create/${user.structureId}`}>
                  <VioletButton>
                    <p>Nouvelle mission</p>
                  </VioletButton>
                </Link>
              )}
              <ExportComponent
                title="Exporter les missions"
                defaultQuery={getExportQuery}
                collection="mission"
                react={{ and: FILTERS }}
                transformAll={async (data) => {
                  const tutorIds = [...new Set(data.map((item) => item.tutorId).filter((e) => e))];
                  if (tutorIds?.length) {
                    const { responses } = await api.esQuery([
                      { index: "referent", type: "_doc" },
                      { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: tutorIds } } },
                    ]);
                    const tutors = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                    return data.map((item) => ({ ...item, tutor: tutors?.find((e) => e._id === item.tutorId) }));
                  }
                  return data;
                }}
                transform={(data) => {
                  return {
                    _id: data._id,
                    "Titre de la mission": data.name,
                    Description: data.description,
                    "Id de la structure": data.structureId,
                    "Nom de la structure": data.structureName,
                    "Id du tuteur": data.tutorId,
                    "Nom du tuteur": data.tutor?.lastName,
                    "Prénom du tuteur": data.tutor?.firstName,
                    "Email du tuteur": data.tutor?.email,
                    "Téléphone du tuteur": data.tutor?.mobile ? data.tutor?.mobile : data.tutor?.phone,
                    "Liste des domaines de la mission": data.domains,
                    "Date du début": formatDateFR(data.startAt),
                    "Date de fin": formatDateFR(data.endAt),
                    Format: data.format,
                    Fréquence: data.frequence,
                    Période: data.period,
                    "Places total": data.placesTotal,
                    "Places disponibles": data.placesLeft,
                    "Actions concrètes confiées au(x) volontaire(s)": data.actions,
                    "Contraintes spécifiques": data.contraintes,
                    Adresse: data.address,
                    "Code postal": data.zip,
                    Ville: data.city,
                    Département: data.department,
                    Région: data.region,
                    Statut: data.status,
                    "Créé lé": formatLongDateFR(data.createdAt),
                    "Mis à jour le": formatLongDateFR(data.updatedAt),
                  };
                }}
              />
            </Header>
            <Filter>
              <DataSearch
                defaultQuery={getDefaultQuery}
                showIcon={false}
                placeholder="Rechercher par mots clés, ville, code postal..."
                componentId="SEARCH"
                dataField={["name", "structureName", "city", "zip"]}
                react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                // fuzziness={1}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
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
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === "referent_region" ? [user.region] : []} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === "referent_department" ? [user.department] : []} />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Domaine"
                  componentId="DOMAIN"
                  dataField="domains.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Domaine")}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Places restantes"
                  componentId="PLACES"
                  dataField="placesLeft"
                  react={{ and: FILTERS.filter((e) => e !== "PLACES") }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  sortBy="asc"
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Tuteur"
                  componentId="TUTOR"
                  dataField="tutorName.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "TUTOR") }}
                  title=""
                  URLParams={true}
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                />
                {user.role === "supervisor" ? (
                  <MultiDropdownList
                    defaultQuery={getDefaultQuery}
                    className="dropdown-filter"
                    placeholder="Structure"
                    componentId="STRUCTURE"
                    dataField="structureName.keyword"
                    react={{ and: FILTERS.filter((e) => e !== "STRUCTURE") }}
                    title=""
                    URLParams={true}
                    showSearch={false}
                    sortBy="asc"
                  />
                ) : null}
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th>Mission</th>
                        <th style={{ width: "200px" }}>Dates</th>
                        <th style={{ width: "90px" }}>Places</th>
                        <th style={{ width: "250px" }}>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit key={hit._id} hit={hit} onClick={() => setMission(hit)} selected={mission?._id === hit._id} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel mission={mission} onChange={() => setMission(null)} />
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit, onClick, selected }) => {
  // console.log("h", hit);
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={onClick}>
      <td>
        <MultiLine>
          <h2>{hit.name}</h2>
          <p>
            {hit.structureName} {`• ${hit.city} (${hit.department})`}
          </p>
        </MultiLine>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDate(hit.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDate(hit.endAt)}
        </div>
      </td>
      <td>
        {hit.placesTotal <= 1 ? `${hit.placesTotal} place` : `${hit.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {hit.placesTotal - hit.placesLeft} / {hit.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusMission hit={hit} />
      </td>
    </tr>
  );
};
