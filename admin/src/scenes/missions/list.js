import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactiveBase, MultiDropdownList, DataSearch, ReactiveComponent } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";

import ExportComponent from "../../components/ExportXlsx";
import api from "../../services/api";
import { apiURL, supportURL } from "../../config";
import Panel from "./panel";
import { formatStringDateTimezoneUTC, translate, getFilterLabel, formatLongDateFR, formatDateFRTimezoneUTC, ES_NO_LIMIT, ROLES } from "../../utils";
import SelectStatusMission from "../../components/selectStatusMission";
import VioletButton from "../../components/buttons/VioletButton";
import Loader from "../../components/Loader";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine, Help, HelpText, LockIcon } from "../../components/list";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import plausibleEvent from "../../services/pausible";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import DatePickerWrapper from "../../components/filters/DatePickerWrapper";
import { HiAdjustments } from "react-icons/hi";
import LockedSvg from "../../assets/lock.svg";
import UnlockedSvg from "../../assets/lock-open.svg";
const FILTERS = ["DOMAIN", "SEARCH", "STATUS", "PLACES", "LOCATION", "TUTOR", "REGION", "DEPARTMENT", "STRUCTURE", "MILITARY_PREPARATION", "DATE", "SOURCE"];
import Breadcrumbs from "../../components/Breadcrumbs";

export default function List() {
  const [mission, setMission] = useState(null);
  const [structure, setStructure] = useState();
  const [structureIds, setStructureIds] = useState();
  const [filterVisible, setFilterVisible] = useState(false);
  const user = useSelector((state) => state.Auth.user);
  const [infosHover, setInfosHover] = useState(false);
  const [infosClick, setInfosClick] = useState(false);
  const toggleInfos = () => {
    setInfosClick(!infosClick);
  };

  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    if (user.role === ROLES.SUPERVISOR) return { query: { bool: { filter: { terms: { "structureId.keyword": structureIds } } } }, track_total_hits: true };
    return { query: { match_all: {} }, track_total_hits: true };
  };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  useEffect(() => {
    if (user.role !== ROLES.SUPERVISOR) return;
    (async () => {
      const { data } = await api.get(`/structure/${user.structureId}/children`);
      const ids = data.map((s) => s._id);
      setStructureIds([...ids, user.structureId]);
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
      <Breadcrumbs items={[{ label: "Missions" }]} />
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
                handleClick={() => plausibleEvent("Mission/CTA - Exporter missions")}
                title="Exporter les missions"
                defaultQuery={getExportQuery}
                exportTitle="Missions"
                index="mission"
                react={{ and: FILTERS }}
                transform={async (data) => {
                  let all = data;
                  const tutorIds = [...new Set(data.map((item) => item.tutorId).filter((e) => e))];
                  if (tutorIds?.length) {
                    const { responses } = await api.esQuery("referent", { size: ES_NO_LIMIT, query: { ids: { type: "_doc", values: tutorIds } } });
                    if (responses.length) {
                      const tutors = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
                      all = data.map((item) => ({ ...item, tutor: tutors?.find((e) => e._id === item.tutorId) }));
                    }
                  }
                  return all.map((data) => {
                    return {
                      _id: data._id,
                      "Titre de la mission": data.name,
                      Description: data.description,
                      "Id de la structure": data.structureId,
                      "Nom de la structure": data.structureName,
                      "Id du tuteur": data.tutorId || "La mission n'a pas de tuteur",
                      "Nom du tuteur": data.tutor?.lastName,
                      "Prénom du tuteur": data.tutor?.firstName,
                      "Email du tuteur": data.tutor?.email,
                      "Téléphone du tuteur": data.tutor?.mobile || data.tutor?.phone,
                      "Domaine principal de la mission": translate(data.mainDomain) || "Non renseigné",
                      "Domaine(s) secondaire(s) de la mission": data.mainDomain ? data.domains.filter((d) => d !== data.mainDomain)?.map(translate) : data.domains?.map(translate),
                      "Date du début": formatDateFRTimezoneUTC(data.startAt),
                      "Date de fin": formatDateFRTimezoneUTC(data.endAt),
                      Format: translate(data.format),
                      Fréquence: data.frequence,
                      Période: data.period?.map(translate)?.join(", "),
                      "Places total": data.placesTotal,
                      "Places disponibles": data.placesLeft,
                      "Actions concrètes confiées au(x) volontaire(s)": data.actions,
                      "Contraintes spécifiques": data.contraintes,
                      Adresse: data.address,
                      "Code postal": data.zip,
                      Ville: data.city,
                      Département: data.department,
                      Région: data.region,
                      Statut: translate(data.status),
                      Motif: data.statusComment,
                      "Créé lé": formatLongDateFR(data.createdAt),
                      "Mis à jour le": formatLongDateFR(data.updatedAt),
                    };
                  });
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
                  dataField={["name.folded", "structureName.folded", "city.folded", "zip"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  // fuzziness={1}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  URLParams={true}
                  queryFormat="and"
                  autosuggest={false}
                />
                <HiAdjustments onClick={handleShowFilter} className="text-xl text-coolGray-700 cursor-pointer hover:scale-105" />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Général</div>
                <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
                <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? [user.department] : []} />
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
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Source"
                  componentId="SOURCE"
                  dataField="isJvaMission.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "SOURCE") }}
                  renderItem={(e, count) => {
                    const text = e === "true" ? "JVA" : "SNU";
                    return `${text} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  renderLabel={(items) => {
                    if (Object.keys(items).length === 0) return "Source";
                    const translated = Object.keys(items).map((item) => {
                      return item === "true" ? "JVA" : "SNU";
                    });
                    let value = translated.join(", ");
                    return value;
                  }}
                />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Modalités</div>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Domaine"
                  componentId="DOMAIN"
                  dataField="mainDomain.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DOMAIN") }}
                  renderItem={(e, count) => {
                    return `${translate(e)} (${count})`;
                  }}
                  title=""
                  URLParams={true}
                  showSearch={false}
                  renderLabel={(items) => getFilterLabel(items, "Domaine d’action principal", "Domaine d’action principal")}
                  showMissing
                  missingLabel="Non renseigné"
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
                  selectAllLabel="Tout sélectionner"
                  renderLabel={(items) => getFilterLabel(items, "Places restantes", "Places restantes")}
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
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <div className="uppercase text-xs text-snu-purple-800">Dates</div>
                <ReactiveComponent
                  componentId="DATE"
                  URLParams={true}
                  defaultValue={[]}
                  render={(props) => {
                    return <DatePickerWrapper setQuery={props.setQuery} value={props.value} />;
                  }}
                />
                <Help onClick={toggleInfos} onMouseEnter={() => setInfosHover(true)} onMouseLeave={() => setInfosHover(false)}>
                  {infosClick ? <LockIcon src={LockedSvg} /> : <LockIcon src={UnlockedSvg} />}
                  Aide
                </Help>
              </FilterRow>
              <FilterRow visible={filterVisible}>
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
                <DeleteFilters />
              </FilterRow>
            </Filter>
            {infosHover || infosClick ? (
              <HelpText>
                <div>
                  <div style={{ height: "0.5rem" }} />
                  <div>
                    <span className="title">Général :</span>concerne toutes les informations générales de la mission . <strong>La source </strong>
                    correspond à la plateforme sur laquelle a été déposée la mission
                    <a href={`${supportURL}/base-de-connaissance/missions-de-la-plateforme-jeveuxaidergouvfr`} target="_blank" rel="noreferrer">
                      JVA & SNU
                    </a>
                  </div>
                  <div>
                    <span className="title">Modalités :</span>concerne toutes les condtions de réalisation de la mission.
                  </div>
                  <div>
                    <span className="title">Dates :</span>permettent de filtrer les missions dont les dates de début et de fin sont inclues dans la borne temporelle. Attention les
                    missions dont seulement 1 jour est inclus seront également affichées.
                  </div>
                </div>
              </HelpText>
            ) : null}
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
                        <th style={{ width: "100px" }}>Sources</th>
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
}

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
          <span className="font-bold text-black">{value.name}</span>
          <p>
            {value.structureName} {`• ${value.city} (${value.department})`}
          </p>
        </MultiLine>
      </td>
      <td>
        <span>
          {value.isJvaMission === "true" ? (
            <img src={require("../../assets/JVA_round.png")} className="h-9 w-9 group-hover:scale-105 mx-auto" />
          ) : (
            <img src={require("../../assets/logo-snu.png")} className="h-9 w-9 group-hover:scale-105 mx-auto" />
          )}
        </span>
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
