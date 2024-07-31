import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { capture } from "../../sentry";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters } from "../../components/filters-system-v2";
import { ES_NO_LIMIT, ROLES, getDepartmentNumber, translate } from "snu-lib";
import Association from "./components/Association";
import Breadcrumbs from "../../components/Breadcrumbs";
import { BsDownload } from "react-icons/bs";

export default function List() {
  const [associations, setAssociations] = useState([]);
  const [missionsInfo, setMissionsInfo] = useState({});
  const user = useSelector((state) => state.Auth.user);

  const [data, setData] = React.useState([]);
  const pageId = "association";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  const filterArray = [
    { title: "Région", name: "coordonnees_adresse_region", missingLabel: "Non renseignée", defaultValues: user.role === ROLES.REFERENT_REGION ? [user.region] : [] },
    {
      title: "Département",
      name: "coordonnees_adresse_departement",
      missingLabel: "Non renseignée",
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
    { title: "Domaine", name: "activites_lib_theme1", missingLabel: "Non renseignée", translate },
  ];

  useEffect(() => {
    (async () => {
      if (associations.length === 0) return;
      const rnas = associations.map((a) => a.id_rna);
      const raw = JSON.stringify({
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: [
                    {
                      terms: { "associationRNA.keyword": rnas },
                    },
                    {
                      terms: { "organizationRNA.keyword": rnas },
                    },
                  ],
                },
              },
            ],
          },
        },
        size: ES_NO_LIMIT,
      });

      const result = {};

      try {
        const res = await fetch("https://api.api-engagement.beta.gouv.fr/v0/mission/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: raw,
          redirect: "follow",
        }).then((response) => response.json());

        if (res.hits?.hits?.length > 0) {
          for (const association of associations) {
            const hits = res.hits.hits.filter((e) => e._source.associationRNA === association._source.id_rna || e._source.organizationRNA === association._source.id_rna);
            result[association._id] = {
              countMissions: hits.length,
              countPlaces: hits.reduce((prev, curr) => (curr._source.places ? prev + curr._source.places : 0), 0),
              missions: hits.map((el) => ({ id: el._id, ...el._source })),
            };
          }
        }
      } catch (err) {
        capture(err);
        console.log(err);
        toastr.error("Erreur lors de la récupération des missions");
        for (const association of associations) {
          result[association._id] = {
            countMissions: 0,
            countPlaces: 0,
            missions: [],
          };
        }
      }
      setMissionsInfo(result);
    })();
  }, [associations]);

  return (
    <div className="mb-8">
      <Breadcrumbs items={[{ label: "Associations" }]} />
      <div className="flex flex-col gap-6 py-2 px-8">
        <div className="flex flex-1 justify-between items-center">
          <div className="text-2xl font-bold leading-7 text-[#242526]">Annuaire des associations</div>

          {/* fixme: make it work ? worth it ? */}
          <ExportComponent
            title="Exporter les associations"
            exportTitle="Associations"
            route="/elasticsearch/association/export"
            filters={filterArray}
            selectedFilters={selectedFilters}
            icon={<BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />}
            customCss={{
              override: true,
              button: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
              loadingButton: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
            }}
            transform={(data) =>
              data.map((association) => ({
                "Nom association": association.identite_nom,
                Description: association.description || association.activites_objet,
                Adresse: association.coordonnees_adresse_nom_complet,
                SIREN: association.identite_id_siren || association.id_siren,
                "Statut juridique": association.statut_juridique || association.identite_lib_forme_juridique,
                "Domaine d’action": association.activites_lib_theme1,
                RNA: association.id_rna,
                "Nombre de mission publiées sur la plateforme": missionsInfo[association._id]?.countMissions || 0,
                "Nombre de places disponible sur la plateforme": missionsInfo[association._id]?.countPlaces || 0,
                Mail: association.coordonnees_courriel,
                Téléphone: association.coordonnees_telephone,
                "Lien facebook": association.facebook,
                "Lien linkedin": association.linkedin,
                "Lien web": association.url,
                "Lien twitter": association.twitter,
              }))
            }
          />
        </div>

        <div className="flex flex-col bg-white px-4 py-4 rounded-xl">
          <Filters
            pageId={pageId}
            route="/elasticsearch/association/search"
            setData={(value) => {
              setData(value);
              setAssociations(value);
            }}
            filters={filterArray}
            searchPlaceholder="Rechercher par mots clés, nom, ville, description…"
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
            size={size}
          />
          <div className="flex flex-row flex-wrap items-center mt-2">
            <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
            <SelectedFilters
              filterArray={filterArray}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
          </div>
        </div>

        <ResultTable
          paramData={paramData}
          setParamData={setParamData}
          currentEntryOnPage={data?.length}
          size={size}
          setSize={setSize}
          render={
            <div className="flex flex-col gap-5">
              <p className="text-lg text-gray-500">
                <b>{paramData?.count >= ES_NO_LIMIT ? `Plus de ${ES_NO_LIMIT.toLocaleString()}` : Number(paramData?.count).toLocaleString()} associations</b> correspondent à vos
                critères
              </p>
              {data.map((hit) => (
                <Association
                  hit={hit}
                  missionsInfo={
                    missionsInfo[hit._id] || {
                      countMissions: 0,
                      countPlaces: 0,
                      missions: [],
                    }
                  }
                  key={hit._id}
                />
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
}
