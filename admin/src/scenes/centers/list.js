import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, ReactiveList, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { formatStringDate, translate, getFilterLabel, formatLongDateFR, formatDateFR, YOUNG_STATUS_COLORS } from "../../utils";
import SelectStatusMission from "../../components/selectStatusMission";
import VioletHeaderButton from "../../components/buttons/VioletHeaderButton";
import Loader from "../../components/Loader";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, TopResultStats, BottomResultStats, Header, Title, MultiLine } from "../../components/list";
import Badge from "../../components/Badge";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "PLACES", "LOCATION", "TUTOR", "REGION", "DEPARTMENT", "STRUCTURE"];

export default () => {
  const [center, setCenter] = useState(null);
  const user = useSelector((state) => state.Auth.user);
  const getDefaultQuery = () => {
    return { query: { match_all: {} } };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: 10000 });

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="cohesioncenter" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Centres</Title>
              </div>
              <ExportComponent
                title="Exporter les centres"
                defaultQuery={getExportQuery}
                collection="cohesioncenter"
                react={{ and: FILTERS }}
                transform={(data) => {
                  return {
                    Nom: data.name,
                    Code: data.code,
                    Pays: data.country,
                    COR: data.COR,
                    Adresse: data.address,
                    Ville: data.city,
                    "Code Postal": data.zip,
                    "N˚ Département": data.departmentCode,
                    Département: data.department,
                    Région: data.region,
                    "Places total": data.placesTotal,
                    "Places disponibles": data.placesLeft,
                    "Tenues livrées": data.outfitDelivered,
                    Observations: data.observations,
                    "Créé lé": formatLongDateFR(data.createdAt),
                    "Mis à jour le": formatLongDateFR(data.updatedAt),
                  };
                }}
              />
              <Link to={`/centre/create`}>
                <VioletHeaderButton>
                  <p>Créer un nouveau centre</p>
                </VioletHeaderButton>
              </Link>
            </Header>
            <Filter>
              <DataSearch
                defaultQuery={getDefaultQuery}
                showIcon={false}
                placeholder="Rechercher par mots clés, ville, code postal..."
                componentId="SEARCH"
                dataField={["name", "city", "zip"]}
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
                  placeholder="Places restantes"
                  componentId="PLACES"
                  dataField="placesLeft"
                  react={{ and: FILTERS.filter((e) => e !== "PLACES") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={false}
                />
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
                        <th style={{ width: "40%" }}>Centres</th>
                        <th style={{ width: "30%" }}>Places</th>
                        <th style={{ width: "30%" }}>Disponibilité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit, i) => (
                        <Hit key={i} hit={hit} onClick={() => setCenter(hit)} selected={center?._id === hit._id} />
                      ))}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
          <Panel center={center} onChange={() => setCenter(null)} />
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
          <p>{`${hit.city || ""} • ${hit.department || ""}`}</p>
        </MultiLine>
      </td>
      <td>
        <MultiLine>
          <h2>{hit.placesLeft} places disponibles</h2>
          <p>sur {hit.placesTotal} places proposées</p>
        </MultiLine>
        {/* {hit.placesTotal <= 1 ? `${hit.placesTotal} place` : `${hit.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {hit.placesTotal - hit.placesLeft} / {hit.placesTotal}
        </div> */}
      </td>
      <td>{hit.placesLeft > 0 ? <Badge text="Places disponibles" color="#6CC763" /> : <Badge text="Complet" />}</td>
    </tr>
  );
};
