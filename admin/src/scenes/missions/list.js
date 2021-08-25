import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { formatStringDateTimezoneUTC, translate, getFilterLabel, formatLongDateFR, formatDateFRTimezoneUTC, ES_NO_LIMIT, ROLES } from "../../utils";
import SelectStatusMission from "../../components/selectStatusMission";
import VioletButton from "../../components/buttons/VioletButton";
import Loader from "../../components/Loader";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine } from "../../components/list";
import Chevron from "../../components/Chevron";
import ReactiveListComponent from "../../components/ReactiveListComponent";

const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "PLACES", "LOCATION", "TUTOR", "REGION", "DEPARTMENT", "STRUCTURE", "MILITARY_PREPARATION"];

export default () => {
  const [mission, setMission] = useState(null);
  const [structure, setStructure] = useState();
  const [structureIds, setStructureIds] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    if (user.role === ROLES.SUPERVISOR) return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } } };
    return { query: { match_all: {} } };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  useEffect(() => {
    if (user.role !== ROLES.SUPERVISOR) return;
    (async () => {
      const { data } = await api.get(`/structure/${user.structureId}/children`);
      const ids = data.map((s) => s._id);
      setStructureIds(ids);
    })();
    return;
  }, []);
  useEffect(() => {
    (async () => {
      const { data } = await api.get(`/structure/${user.structureId}`);
      setStructure(data);
    })();
    return;
  }, []);
  if (user.role === ROLES.SUPERVISOR && !structureIds) return <Loader />;

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Missions</Title>
              </div>
              {user.role === ROLES.RESPONSIBLE && user.structureId && structure && structure.status !== "DRAFT" ? (
                <Link to={`/mission/create/${user.structureId}`}>
                  <VioletButton>
                    <p>Nouvelle mission</p>
                  </VioletButton>
                </Link>
              ) : null}
              <ExportComponent
                title="Exporter les missions"
                defaultQuery={getExportQuery}
                collection="mission"
                react={{ and: FILTERS }}
                transformAll={async (data) => {
                  const tutorIds = [...new Set(data.map((item) => item.tutorId).filter((e) => e))];
                  if (tutorIds?.length) {
                    const { responses } = await api.esQuery("referent", { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: tutorIds } } });
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
                    "Liste des domaines de la mission": data.domains?.map(translate),
                    "Date du début": formatDateFRTimezoneUTC(data.startAt),
                    "Date de fin": formatDateFRTimezoneUTC(data.endAt),
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
              <FilterRow visible>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Rechercher par mots clés, ville, code postal..."
                  componentId="SEARCH"
                  dataField={["name", "structureName", "city", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  // fuzziness={1}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  URLParams={true}
                  queryFormat="and"
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
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []} />
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
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Préparation Militaire"
                  componentId="MILITARY_PREPARATION"
                  dataField="isMilitaryPreparation.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "MILITARY_PREPARATION") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => getFilterLabel(items, "Préparation Militaire")}
                />
                {user.role === ROLES.SUPERVISOR ? (
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
                sortOptions={[
                  { label: "Date de création (récent > ancien)", dataField: "createdAt", sortBy: "desc" },
                  { label: "Date de création (ancien > récent)", dataField: "createdAt", sortBy: "asc" },
                  { label: "Nombre de place (croissant)", dataField: "placesLeft", sortBy: "asc" },
                  { label: "Nombre de place (décroissant)", dataField: "placesLeft", sortBy: "desc" },
                  { label: "Nom de la mission (A > Z)", dataField: "name.keyword", sortBy: "asc" },
                  { label: "Nom de la mission (Z > A)", dataField: "name.keyword", sortBy: "desc" },
                ]}
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
                        <Hit
                          key={hit._id}
                          hit={hit}
                          onClick={(m) => setMission(m)}
                          selected={mission?._id === hit._id}
                          callback={(e) => {
                            if (e._id === mission?._id) setMission(e);
                          }}
                        />
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

const Hit = ({ hit, onClick, selected, callback }) => {
  const [value, setValue] = useState(null);

  const onChangeStatus = (e) => {
    setValue(e);
    callback(e);
  };

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;
  return (
    <tr style={{ backgroundColor: selected && "#e6ebfa" }} onClick={() => onClick(value)}>
      <td>
        <MultiLine>
          <h2>{value.name}</h2>
          <p>
            {value.structureName} {`• ${value.city} (${value.department})`}
          </p>
        </MultiLine>
      </td>
      <td>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDateTimezoneUTC(value.startAt)}
        </div>
        <div>
          <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDateTimezoneUTC(value.endAt)}
        </div>
      </td>
      <td>
        {value.placesTotal <= 1 ? `${value.placesTotal} place` : `${value.placesTotal} places`}
        <div style={{ fontSize: 12, color: "rgb(113,128,150)" }}>
          {value.placesTotal - value.placesLeft} / {value.placesTotal}
        </div>
      </td>
      <td onClick={(e) => e.stopPropagation()}>
        <SelectStatusMission hit={value} callback={onChangeStatus} />
      </td>
    </tr>
  );
};
