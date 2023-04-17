import React, { useState, useEffect } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import ModalExport from "../../components/modals/ModalExport";
import { structureExportFields } from "snu-lib/excelExports";
import api from "../../services/api";
import { apiURL } from "../../config";
import { translate, corpsEnUniforme, formatLongDateFR, ES_NO_LIMIT, ROLES, getFilterLabel, colors } from "../../utils";
import { RegionFilter, DepartmentFilter } from "../../components/filters";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";
import plausibleEvent from "../../services/plausible";
import DeleteFilters from "../../components/buttons/DeleteFilters";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Title } from "../centersV2/components/commons";
import { BsDownload } from "react-icons/bs";
import FilterIcon from "../../assets/icons/Filter";
import { formatStringLongDate } from "snu-lib";

const FILTERS = ["SEARCH", "LEGAL_STATUS", "STATUS", "DEPARTMENT", "REGION", "CORPS", "WITH_NETWORK", "LOCATION", "MILITARY_PREPARATION", "TYPE", "SOUS-TYPE"];

export default function List() {
  const history = useHistory();
  const [structureIds, setStructureIds] = useState([]);
  const [missions, setMissions] = useState([]);
  const [responsibles, setResponsibles] = useState([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

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
        const { responses: responsibleResponses } = await api.esQuery("referent", {
          size: ES_NO_LIMIT,
          query: { bool: { must: { match_all: {} }, filter: [{ terms: { "structureId.keyword": structureIds } }] } },
        });
        if (responses.length) {
          setResponsibles(responsibleResponses[0]?.hits?.hits || []);
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
        {user.role === ROLES.SUPERVISOR ? <Title>Mes structures affiliées</Title> : <Title>Toutes les structures</Title>}
        <Link
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:brightness-110 active:brightness-125"
          to="/structure/create"
          onClick={() => plausibleEvent("Structure/CTA - Inviter nouvelle structure")}
        >
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
        <main className="m-8 rounded-xl bg-white shadow-sm">
          <div className="flex h-[90px] gap-4 border-b-[1px] border-gray-100 p-4">
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
            <button onClick={handleShowFilter} className="group flex items-center gap-2 rounded-lg bg-gray-100 py-2 px-3 transition hover:bg-gray-400">
              <FilterIcon className="fill-gray-400 transition group-hover:fill-gray-100" />
              <p className="text-gray-400 transition group-hover:text-gray-100">Filtres</p>
            </button>
            <button className="ml-auto flex items-center gap-2 rounded-lg border-[1px] border-gray-300 px-3 text-sm hover:bg-gray-100" onClick={() => setIsExportOpen(true)}>
              <BsDownload className="text-gray-400" />
              <p>Exporter</p>
            </button>
          </div>
          <div className={`flex items-center gap-2 py-2 px-4 ${!filterVisible ? "hidden" : ""}`}>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-x-2">
                <div className="mr-2 text-xs uppercase text-blue-600">Généralités</div>
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
                  renderLabel={(items) => <div>{getFilterLabel(items, "Statut juridique", "Statut juridique")}</div>}
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
                  renderLabel={(items) => <div>{getFilterLabel(items, "Type", "Type")}</div>}
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
                  renderLabel={(items) => <div>{getFilterLabel(items, "Sous-type", "Sous-type")}</div>}
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
              </div>
              <div className="flex items-center gap-x-2">
                <div className="mr-2 text-xs uppercase text-blue-600">Spécificités</div>
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
              </div>
              <DeleteFilters />
            </div>
          </div>

          <div className="reactive-result">
            <ReactiveListComponent
              defaultQuery={getDefaultQuery}
              react={{ and: FILTERS }}
              paginationAt="bottom"
              showTopResultStats={false}
              onData={({ rawData }) => {
                if (rawData?.hits?.hits) setStructureIds(rawData.hits.hits.map((e) => e._id));
              }}
              render={({ data }) => {
                return (
                  <table className="w-full table-fixed">
                    <thead className="text-xs font-semibold uppercase text-gray-500">
                      <tr className="border-b-[1px] border-gray-100">
                        <th className="w-1/3 py-3 pl-8">Structures</th>
                        <th>Equipe</th>
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
                          responsibles={responsibles.filter((e) => e._source.structureId === hit._id)}
                          onClick={() => history.push(`/structure/${hit._id}`)}
                        />
                      ))}
                    </tbody>
                  </table>
                );
              }}
            />
          </div>
        </main>

        {/* <Panel value={structure} onChange={() => setStructure(null)} /> */}
      </ReactiveBase>
    </>
  );
}

const Hit = ({ hit, onClick, missions, responsibles }) => {
  const missionsInfo = {
    count: missions.length || "0",
    placesTotal: missions.reduce((acc, e) => acc + e._source.placesTotal, 0),
  };
  const responsiblesInfo = {
    count: responsibles.length || "0",
  };
  return (
    <tr className="border-b-[1px] border-gray-100 text-xs hover:bg-gray-50" onClick={onClick}>
      <td className="space-y-1 py-3 pl-8">
        <p className="text-base font-semibold">{hit.name}</p>
        <p>
          {translate(hit.legalStatus)} • Créée le {formatStringLongDate(hit.createdAt)}
        </p>
      </td>
      <td>
        <p>
          {responsiblesInfo.count} responsable{responsiblesInfo.count > 1 && "s"}
        </p>
      </td>
      <td>
        <p>{missionsInfo.count} missions</p>
        <p>{missionsInfo.placesTotal} places</p>
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
