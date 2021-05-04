import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import styled from "styled-components";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { formatStringDate, translate, getFilterLabel, formatLongDateFR, formatDateFR } from "../../utils";
import SelectStatusMission from "../../components/selectStatusMission";
import VioletHeaderButton from "../../components/buttons/VioletHeaderButton";
import Loader from "../../components/Loader";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, TopResultStats, BottomResultStats, Header, Title, MultiLine } from "../../components/list";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "PLACES", "LOCATION", "TUTOR", "REGION", "DEPARTMENT", "STRUCTURE"];

export default () => {
  const [mission, setMission] = useState(null);
  const [structureIds, setStructureIds] = useState();
  const user = useSelector((state) => state.Auth.user);
  const getDefaultQuery = () => {
    if (user.role === "supervisor") return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } } };
    return { query: { match_all: {} } };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: 10000 });

  useEffect(() => {
    if (user.role !== "supervisor") return;
    (async () => {
      const { data } = await api.get(`/structure/network/${user.structureId}`);
      const ids = data.map((s) => s._id);
      console.log(ids);
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
                  <VioletHeaderButton>
                    <p>Nouvelle mission</p>
                  </VioletHeaderButton>
                </Link>
              )}
              <ExportComponent
                title="Exporter les missions"
                defaultQuery={getExportQuery}
                collection="mission"
                react={{ and: FILTERS }}
                transform={(data) => {
                  return {
                    _id: data._id,
                    "Titre de la mission": data.name,
                    Description: data.description,
                    "Id de la structure": data.structureId,
                    "Nom de la structure": data.structureName,
                    Tuteur: data.tutorName,
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
                showIcon={false}
                placeholder="Rechercher par mots clés, mission ou structure..."
                componentId="SEARCH"
                dataField={["name"]}
                react={{ and: FILTERS }}
                // fuzziness={1}
                style={{ flex: 2 }}
                innerClass={{ input: "searchbox" }}
                autosuggest={false}
              />
              <FilterRow>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Ville ou code postal"
                  componentId="LOCATION"
                  dataField={["city", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "LOCATION") }}
                  style={{ flex: 2 }}
                  innerClass={{ input: "searchbox" }}
                  className="searchbox-city"
                  autosuggest={false}
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
              <ReactiveList
                defaultQuery={getDefaultQuery}
                componentId="result"
                react={{ and: FILTERS }}
                pagination={true}
                paginationAt="both"
                innerClass={{ pagination: "pagination" }}
                size={30}
                showLoader={true}
                dataField="createdAt"
                sortBy="desc"
                loader={<div style={{ padding: "0 20px" }}>Chargement...</div>}
                renderNoResults={() => <div style={{ padding: "10px 25px" }}>Aucun Résultat.</div>}
                renderResultStats={(e) => {
                  return (
                    <div>
                      <TopResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </TopResultStats>
                      <BottomResultStats>
                        Affiche {e.displayedResults * e.currentPage + 1} à {e.displayedResults * (e.currentPage + 1)} résultats sur {e.numberOfResults} résultats
                      </BottomResultStats>
                    </div>
                  );
                }}
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
                      {data.map((hit, i) => (
                        <Hit key={i} hit={hit} onClick={() => setMission(hit)} selected={mission?._id === hit._id} />
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
    <tr style={{ backgroundColor: selected ? "#f1f1f1" : "transparent" }} onClick={onClick}>
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
