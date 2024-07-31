import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import React, { useState } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Title } from "../pointDeRassemblement/components/common";
import plausibleEvent from "../../services/plausible";
import { colors, ROLES, translate, structureExportFields, getDepartmentNumber, formatLongDateFR, formatStringLongDate } from "snu-lib";
import { Filters, ModalExport, ResultTable, Save, SelectedFilters } from "../../components/filters-system-v2";
import { BsDownload } from "react-icons/bs";
import { corpsEnUniforme } from "../../utils";
import Badge from "../../components/Badge";
import { transformExistingField } from "@/components/filters-system-v2/components/filters/utils";

export default function ListV3() {
  const user = useSelector((state) => state.Auth.user);

  return (
    <div className="mb-8">
      <Breadcrumbs items={[{ label: "Centres" }]} />
      <div className="flex flex-row">
        <div className="flex w-full flex-1 flex-col px-8">
          <div className="flex items-center justify-between py-8">
            <Title>{user.role === ROLES.SUPERVISOR ? "Mes structures affiliées" : "Toutes les structures"}</Title>
            <Link
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white hover:brightness-110 active:brightness-125"
              to="/structure/create"
              onClick={() => plausibleEvent("Structure/CTA - Inviter nouvelle structure")}>
              Inviter une nouvelle structure
            </Link>
          </div>
          <div className="relative mb-8 items-start rounded-b-lg rounded-tr-lg bg-white">
            <div className="flex w-full flex-col pt-4">
              <ListStructure />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ListStructure = () => {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const [data, setData] = useState([]);
  const pageId = "structureList";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({ page: 0 });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [size, setSize] = useState(10);

  const filterArray = [
    {
      title: "Région",
      name: "region",
      missingLabel: "Non renseignée",
      defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    },
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
    },
    {
      title: "Statut juridique",
      name: "legalStatus",
      missingLabel: "Non renseignée",
      translate,
    },
    {
      title: "Type",
      name: "types",
      missingLabel: "Non renseignée",
    },
    {
      title: "Sous-type",
      name: "sousType",
      missingLabel: "Non renseignée",
    },
    {
      title: "Affiliation à un réseau national",
      name: "networkExist",
      missingLabel: "Non renseignée",
      transformData: transformExistingField,
      translate,
    },
    {
      title: "Réseau national d'affiliation",
      name: "networkName",
      missingLabel: "Non renseignée",
    },
    {
      title: "Préparation militaire",
      name: "isMilitaryPreparation",
      missingLabel: "Non renseignée",
      translate,
    },
    {
      title: "Corps en uniforme",
      name: "structurePubliqueEtatType",
      missingLabel: "Non renseignée",
      filter: (d) => corpsEnUniforme.includes(d.key),
    },
  ];

  return (
    <div className="flex-column flex-1 flex-wrap bg-white mb-4 rounded-xl">
      <div className="mx-4">
        <div className="flex w-full flex-row justify-between">
          <Filters
            pageId={pageId}
            route="/elasticsearch/structure/search"
            setData={(value) => setData(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher par mots clés, ville, code postal..."
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
            size={size}
          />
          <button className="ml-auto flex items-center gap-2 rounded-lg border-[1px] border-gray-300 px-3 text-sm hover:bg-gray-100" onClick={() => setIsExportOpen(true)}>
            <BsDownload className="text-gray-400" />
            <p>Exporter</p>
          </button>
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center">
          <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
      </div>

      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={data?.length}
        size={size}
        setSize={setSize}
        render={
          <div className="mt-6 mb-2 flex w-full flex-col gap-1">
            <hr />
            <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
              <div className="w-[40%]">Structure</div>
              <div className="w-[15%]">Equipe</div>
              <div className="w-[15%]">Missions</div>
              <div className="w-[30%]">Contexte</div>
            </div>
            {data.map((hit) => (
              <Hit key={hit._id} hit={hit} history={history} onClick={() => history.push(`/structure/${hit._id}`)} />
            ))}
            <hr />
          </div>
        }
      />
      <ModalExport
        isOpen={isExportOpen}
        setIsOpen={setIsExportOpen}
        transform={exportTransform}
        exportFields={structureExportFields}
        route="/elasticsearch/structure/export"
        exportTitle="Structure"
        selectedFilters={selectedFilters}
      />
    </div>
  );
};
const Hit = ({ hit, onClick }) => {
  const missionsInfo = {
    count: hit.missions ? hit.missions.length : 0,
    placesTotal: hit.missions ? hit.missions.reduce((acc, e) => acc + e.placesTotal, 0) : 0,
  };
  const responsiblesInfo = {
    count: hit.team ? hit.team.length : 0,
  };

  return (
    <>
      <hr />
      <div onClick={onClick} className="flex cursor-pointer items-center py-3 px-4 hover:bg-gray-50">
        <div className="flex w-[40%] flex-col gap-1">
          <div className="font-bold leading-6 text-gray-900">{hit.name}</div>
          <div className="text-sm font-normal leading-4 text-gray-500">
            {translate(hit.legalStatus)} • Créée le {formatStringLongDate(hit.createdAt)}
          </div>
        </div>
        <div className="w-[15%]">
          <div className="text-sm font-normal leading-4 text-gray-500">
            {responsiblesInfo.count} responsable{responsiblesInfo.count > 1 && "s"}
          </div>
        </div>
        <div className="flex w-[15%] flex-col gap-1">
          <div className="text-sm font-normal leading-4 text-gray-500">
            {missionsInfo.count} mission{missionsInfo.count > 1 && "s"}
          </div>
          <div className="text-sm font-normal leading-4 text-gray-500">
            {missionsInfo.placesTotal} place{missionsInfo.placesTotal > 1 && "s"}
          </div>
        </div>
        <div className="w-[30%]">
          {hit.status === "DRAFT" ? <Badge text={translate(hit.status)} color={colors.lightGold} minTooltipText={translate(hit.status)} /> : null}
          {hit.isNetwork === "true" ? <Badge text="Tête de réseau" color={colors.darkBlue} minTooltipText="Tête de réseau" /> : null}
          {hit.networkName ? (
            <Link to={`structure/${hit.networkId}`}>
              <Badge text={hit.networkName} color={colors.purple} minTooltipText={hit.networkName} />
            </Link>
          ) : null}
          {hit.department ? <Badge text={translate(hit.department)} minify={false} /> : null}
          {corpsEnUniforme.includes(hit.structurePubliqueEtatType) ? <Badge text="Corps en uniforme" minify={false} /> : null}
        </div>
      </div>
    </>
  );
};

async function exportTransform(all, values) {
  return all.map((data) => {
    if (!data.team) data.team = [];
    const allFields = {
      structureInfo: {
        ["Nom de la structure"]: data.name,
        ["Statut juridique"]: translate(data.legalStatus),
        ["Type(s) de structure"]: data.types.toString(),
        ["Sous-type de structure"]: data.sousTypes,
        ["Présentation de la structure"]: data.description,
      },
      location: {
        ["Adresse de la structure"]: data.address,
        ["Code postal de la structure"]: data.zip,
        ["Ville de la structure"]: data.city,
        ["Département de la structure"]: data.department,
        ["Région de la structure"]: data.region,
      },
      details: {
        ["Site internet"]: data.website,
        ["Facebook"]: data.facebook,
        ["Twitter"]: data.twitter,
        ["Instagram"]: data.instagram,
        ["Numéro de SIRET"]: data.siret,
      },
      network: {
        ["Est une tête de réseau"]: translate(data.isNetwork),
        ["Nom de la tête de réseau"]: data.networkName,
      },
      team: {
        ["Taille d'équipe"]: data.team?.length,
        ["Membre 1 - Nom"]: data.team[0]?.lastName,
        ["Membre 1 - Prénom"]: data.team[0]?.firstName,
        ["Membre 1 - Email"]: data.team[0]?.email,
        ["Membre 2 - Nom"]: data.team[1]?.lastName,
        ["Membre 2 - Prénom"]: data.team[1]?.firstName,
        ["Membre 2 - Email"]: data.team[1]?.email,
        ["Membre 3 - Nom"]: data.team[2]?.lastName,
        ["Membre 3 - Prénom"]: data.team[2]?.firstName,
        ["Membre 3 - Email"]: data.team[2]?.email,
      },
      status: {
        ["Créé lé"]: formatLongDateFR(data.createdAt),
        ["Mis à jour le"]: formatLongDateFR(data.updatedAt),
        ["Statut général"]: translate(data.status),
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
