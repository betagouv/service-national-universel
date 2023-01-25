import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import ModalExport from "../../components/modals/ModalExport";
import { structureExportFields } from "snu-lib/excelExports";
import api from "../../services/api";
import { apiURL } from "../../config";
import Panel from "./panel";
import { translate, corpsEnUniforme, formatLongDateFR, ES_NO_LIMIT, ROLES, getFilterLabel, colors } from "../../utils";
import VioletButton from "../../components/buttons/VioletButton";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import { Filter, FilterRow, ResultTable, Table, Header, MultiLine, Help, LockIcon, HelpText } from "../../components/list";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import plausibleEvent from "../../services/plausible";
import { HiAdjustments } from "react-icons/hi";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import UnlockedSvg from "../../assets/lock-open.svg";
import LockedSvg from "../../assets/lock.svg";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Title } from "../centersV2/components/commons";

const FILTERS = ["SEARCH", "LEGAL_STATUS", "STATUS", "DEPARTMENT", "REGION", "CORPS", "WITH_NETWORK", "LOCATION", "MILITARY_PREPARATION", "TYPE", "SOUS-TYPE"];
const formatLongDate = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
};

export default function List() {
  const [structure, setStructure] = useState(null);
  // List of structure IDS currently displayed in results
  const [structureIds, setStructureIds] = useState([]);
  // List of missions associated to the structures
  const [missions, setMissions] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [infosHover, setInfosHover] = useState(false);
  const [infosClick, setInfosClick] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const toggleInfos = () => {
    setInfosClick(!infosClick);
  };
  const handleShowFilter = () => setFilterVisible(!filterVisible);

  useEffect(() => {
    (async () => {
      if (structureIds?.length) {
        const { responses } = await api.esQuery("mission", {
          size: ES_NO_LIMIT,
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "structureId.keyword": structureIds } }] } },
        });
        if (responses.length) {
          setMissions(responses[0]?.hits?.hits || []);
        }
      }
    })();
  }, [structureIds]);

  const user = useSelector((state) => state.Auth.user);
  const getDefaultQuery = () =>
    user.role === ROLES.SUPERVISOR
      ? { query: { bool: { filter: { term: { "networkId.keyword": user.structureId } } } }, track_total_hits: true }
      : { query: { match_all: {} }, track_total_hits: true };
  const getExportQuery = () => ({ ...getDefaultQuery(), size: ES_NO_LIMIT });

  async function transform(data, values) {
    let all = data;
    if (values.includes("team")) {
      const structureIds = [...new Set(data.map((item) => item._id).filter((e) => e))];
      if (structureIds?.length) {
        const { responses } = await api.esQuery("referent", {
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "structureId.keyword": structureIds } }] } },
          size: ES_NO_LIMIT,
        });
        if (responses.length) {
          const referents = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
          all = data.map((item) => ({ ...item, team: referents?.filter((e) => e.structureId === item._id) }));
        }
      }
    }
    return all.map((data) => {
      if (!data.team) data.team = [];
      const allFields = {
        structureInfo: {
          "Nom de la structure": data.name,
          "Statut juridique": translate(data.legalStatus),
          "Type(s) de structure": data.types.toString(),
          "Sous-type de structure": data.sousTypes,
          "Présentation de la structure": data.description,
        },
        location: {
          "Adresse de la structure": data.address,
          "Code postal de la structure": data.zip,
          "Ville de la structure": data.city,
          "Département de la structure": data.department,
          "Région de la structure": data.region,
        },
        details: {
          "Site internet": data.website,
          Facebook: data.facebook,
          Twitter: data.twitter,
          Instagram: data.instagram,
          "Numéro de SIRET": data.siret,
        },
        network: {
          "Est une tête de réseau": translate(data.isNetwork),
          "Nom de la tête de réseau": data.networkName,
        },
        team: {
          "Taille d'équipe": data.team?.length,
          "Membre 1 - Nom": data.team[0]?.lastName,
          "Membre 1 - Prénom": data.team[0]?.firstName,
          "Membre 1 - Email": data.team[0]?.email,
          "Membre 2 - Nom": data.team[1]?.lastName,
          "Membre 2 - Prénom": data.team[1]?.firstName,
          "Membre 2 - Email": data.team[1]?.email,
          "Membre 3 - Nom": data.team[2]?.lastName,
          "Membre 3 - Prénom": data.team[2]?.firstName,
          "Membre 3 - Email": data.team[2]?.email,
        },
        status: {
          "Créé lé": formatLongDateFR(data.createdAt),
          "Mis à jour le": formatLongDateFR(data.updatedAt),
          "Statut général": translate(data.status),
        },
      };
      let fields = { ID: data._id };
      for (const element of values) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      return fields;
    });
  }

  return (
    <>
      <Breadcrumbs items={[{ label: "Structures" }]} />
      <header className="m-8 flex items-center justify-between">
        <Title>Mes structures affiliées</Title>
        <Link
          className="px-3 py-2 bg-blue-600 rounded-lg text-sm text-[#ffffff] border-[1px] border-blue-600 hover:bg-white hover:text-[#2563eb]"
          to="/structure/create"
          onClick={() => plausibleEvent("Structure/CTA - Inviter nouvelle structure")}>
          Inviter une nouvelle structure
        </Link>
      </header>
      <ReactiveBase url={`${apiURL}/es`} app="structure" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <ModalExport
          isOpen={isExportOpen}
          setIsOpen={setIsExportOpen}
          index="structure"
          transform={transform}
          exportFields={structureExportFields}
          filters={FILTERS}
          getExportQuery={getExportQuery}
        />
        {infosHover || infosClick ? (
          <HelpText>
            <div>
              Pour filtrer les structures, cliquez sur les éléments ci-dessus.
              <div style={{ height: "0.5rem" }} />
              <div>
                <span className="title">Corps en uniforme :</span>rassemble toutes les structures déclarées en tant que corps en uniforme
              </div>
              <div>
                <span className="title">Affiliation à un réseau national :</span>rassemble les structures liées par une structure mère et pilotée par un superviseur (responsable)
              </div>
              <div>
                <span className="title">Préparation militaire:</span>rassemble toutes les structures qui proposent des PM
              </div>
            </div>
          </HelpText>
        ) : null}
        <main className="bg-white rounded-lg m-8 shadow-sm">
          <div className="flex p-4 gap-4 border-b-[1px] border-gray-100 h-[90px]">
            <DataSearch
              defaultQuery={getDefaultQuery}
              showIcon={false}
              placeholder="Rechercher par mots clés, ville, code postal..."
              componentId="SEARCH"
              dataField={["name", "city", "zip"]}
              react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
              innerClass={{ input: "searchbox" }}
              className="datasearch-searchfield"
              autosuggest={false}
              URLParams={true}
              queryFormat="and"
            />
            <button onClick={handleShowFilter} className="rounded-lg px-3 text-sm border-[1px] bg-gray-100 border-gray-100 text-gray-500 hover:bg-white">
              Filtres
            </button>
            <button className="rounded-lg px-3 text-sm border-[1px] border-gray-300 hover:bg-gray-100 ml-auto" onClick={() => setIsExportOpen(true)}>
              Exporter
            </button>
          </div>
          <FilterRow visible={filterVisible}>
            <div className="uppercase text-xs text-snu-purple-800">Général</div>
            <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_DEPARTMENT ? user.department : []} />
            <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} defaultValue={user.role === ROLES.REFERENT_REGION ? [user.region] : []} />
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Statut juridique"
              componentId="LEGAL_STATUS"
              dataField="legalStatus.keyword"
              react={{ and: FILTERS.filter((e) => e !== "LEGAL_STATUS") }}
              renderItem={(e, count) => {
                return `${translate(e)} (${count})`;
              }}
              title=""
              URLParams={true}
              showSearch={false}
              renderLabel={(items) => getFilterLabel(items, "Statut juridique", "Statut juridique")}
            />
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Type"
              componentId="TYPE"
              dataField="types.keyword"
              react={{ and: FILTERS.filter((e) => e !== "TYPE") }}
              renderItem={(e, count) => {
                return `${translate(e)} (${count})`;
              }}
              title=""
              URLParams={true}
              showSearch={false}
              renderLabel={(items) => getFilterLabel(items, "Type", "Type")}
            />
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Sous-type"
              componentId="SOUS-TYPE"
              dataField="sousType.keyword"
              react={{ and: FILTERS.filter((e) => e !== "SOUS-TYPE") }}
              renderItem={(e, count) => {
                return `${translate(e)} (${count})`;
              }}
              title=""
              URLParams={true}
              showSearch={false}
              renderLabel={(items) => getFilterLabel(items, "Sous-type", "Sous-type")}
            />
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Affiliation à un réseau national"
              componentId="WITH_NETWORK"
              dataField="networkName.keyword"
              title=""
              react={{ and: FILTERS.filter((e) => e !== "WITH_NETWORK") }}
              URLParams={true}
              showSearch={true}
              searchPlaceholder="Rechercher..."
              sortBy="asc"
            />
          </FilterRow>
          <FilterRow visible={filterVisible}>
            <div className="uppercase text-xs text-snu-purple-800">Spécificité</div>
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
            <MultiDropdownList
              defaultQuery={getDefaultQuery}
              className="dropdown-filter"
              placeholder="Corps en uniforme"
              componentId="CORPS"
              dataField="structurePubliqueEtatType.keyword"
              transformData={(data) => {
                return data.filter((d) => corpsEnUniforme.includes(d.key));
              }}
              react={{ and: FILTERS.filter((e) => e !== "CORPS") }}
              renderItem={(e, count) => {
                return `${translate(e)} (${count})`;
              }}
              title=""
              URLParams={true}
              showSearch={false}
            />
            <Help onClick={toggleInfos} onMouseEnter={() => setInfosHover(true)} onMouseLeave={() => setInfosHover(false)}>
              {infosClick ? <LockIcon src={LockedSvg} /> : <LockIcon src={UnlockedSvg} />}
              Aide
            </Help>
          </FilterRow>
          <FilterRow className="flex justify-center" visible={filterVisible}>
            <DeleteFilters />
          </FilterRow>

          <ReactiveListComponent
            defaultQuery={getDefaultQuery}
            react={{ and: FILTERS }}
            sortOptions={[
              { label: "Date de création (récent > ancien)", dataField: "createdAt", sortBy: "desc" },
              { label: "Date de création (ancien > récent)", dataField: "createdAt", sortBy: "asc" },
              { label: "Nom de la structure (A > Z)", dataField: "name.keyword", sortBy: "asc" },
              { label: "Nom de la structure (Z > A)", dataField: "name.keyword", sortBy: "desc" },
            ]}
            onData={({ rawData }) => {
              if (rawData?.hits?.hits) setStructureIds(rawData.hits.hits.map((e) => e._id));
            }}
            render={({ data }) => {
              return (
                <table>
                  <thead>
                    <tr>
                      <th>Structures</th>
                      <th>Missions</th>
                      <th>Contexte</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((hit) => (
                      <Hit
                        hit={hit}
                        key={hit._id}
                        missions={missions.filter((e) => e._source.structureId === hit._id)}
                        onClick={() => setStructure(hit)}
                        selected={structure?._id === hit._id}
                      />
                    ))}
                  </tbody>
                </table>
              );
            }}
          />
        </main>

        {/* <Panel value={structure} onChange={() => setStructure(null)} /> */}
      </ReactiveBase>
    </>
  );
}

const Hit = ({ hit, onClick, selected, missions }) => {
  const missionsInfo = {
    count: missions.length || "0",
    placesTotal: missions.reduce((acc, e) => acc + e._source.placesTotal, 0),
  };
  return (
    <tr onClick={onClick}>
      <td>
        <div>
          <span className="">{hit.name}</span>
          <p>
            {translate(hit.legalStatus)} • Créée le {formatLongDate(hit.createdAt)}
          </p>
        </div>
      </td>
      <td>
        <div>{missionsInfo.count} missions</div>
        <div>{missionsInfo.placesTotal} places</div>
      </td>
      <td>
        {hit.status === "DRAFT" ? <Badge text={translate(hit.status)} color={colors.lightGold} minTooltipText={translate(hit.status)} /> : null}
        {hit.isNetwork === "true" ? <Badge text="Tête de réseau" color={colors.darkBlue} minTooltipText="Tête de réseau" /> : null}
        {hit.networkName ? (
          <Link to={`structure/${hit.networkId}`}>
            <Badge text={hit.networkName} color={colors.purple} minTooltipText={hit.networkName} />
          </Link>
        ) : null}
        {hit.department ? <Badge text={translate(hit.department)} minify={false} /> : null}
        {corpsEnUniforme.includes(hit.structurePubliqueEtatType) ? <Badge text="Corps en uniforme" minify={false} /> : null}
      </td>
    </tr>
  );
};
