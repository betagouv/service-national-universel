import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { HiPlus, HiHome } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { AuthState } from "@/redux/auth/reducer";
import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { capture } from "@/sentry";
import api from "@/services/api";
import { Button, Container, Header, Page } from "@snu/ds/admin";
import { ROLES, translateStatusClasse, translate, EtablissementType, ClasseType } from "snu-lib";

import { getCohortGroups } from "@/services/cohort.service";
import ClasseRow from "./list/ClasseRow";
import { exportExcelSheet, ClasseExport } from "./utils";

interface ClasseProps extends ClasseType {
  referentClasse: { firstName: string; lastName: string }[];
}

export default function List() {
  const user = useSelector((state: AuthState) => state.Auth.user);

  const [isClasses, setIsClasses] = useState<boolean>(false);
  const [data, setData] = useState<ClasseProps[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});
  const [etablissements, setEtablissements] = useState<EtablissementType[]>([]);
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);

  const pageId = "classe-list";

  useEffect(() => {
    (async () => {
      try {
        if ([ROLES.REFERENT_DEPARTMENT, ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role)) {
          const { data: etablissements } = await api.post(`/elasticsearch/cle/etablissement/export`, {
            filters: {},
            exportFields: ["name", "uai"],
          });
          setEtablissements(etablissements);
          setIsClasses(true);
          return;
        }
        const res = await api.post(`/elasticsearch/cle/classe/search`, { filters: {} });
        setIsClasses(res.responses[0].hits.total.value > 0);
        setEtablissements([]);
      } catch (e) {
        setIsClasses(false);
        capture(e);
      }
    })();
  }, []);

  const exportData = async ({ type }) => {
    setExportLoading(true);
    try {
      const res = await api.post(`/elasticsearch/cle/classe/export?type=${type}`, {
        filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
          return { ...e, [key]: (value as any).filter };
        }, {}),
      });
      const classes: ClasseExport[] = res.data;
      const result = await exportExcelSheet(classes, type);
      const buffer = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
      FileSaver.saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }), result.fileName);
    } catch (error) {
      capture(error);
    }
    setExportLoading(false);
  };

  if (!isClasses || !etablissements) return null;

  const filterArray = [
    { title: "Cohorte", name: "cohort", missingLabel: "Non renseigné" },
    [ROLES.REFERENT_DEPARTMENT, ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && {
      title: "Établissement",
      name: "etablissementId",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A" || !etablissements.length) return item;
        const res = etablissements.find((option) => option._id.toString() === item);
        if (!res) return "N/A - Supprimé";
        return res?.name;
      },
    },

    { title: "Numéro d'identification", name: "uniqueKeyAndId", missingLabel: "Non renseigné" },
    { title: "Statut", name: "status", missingLabel: "Non renseigné", translate: translateStatusClasse },
    { title: "Statut phase 1", name: "statusPhase1", missingLabel: "Non renseigné", translate },
    { title: "Nom", name: "name", missingLabel: "Non renseigné" },
    { title: "Couleur", name: "coloration", missingLabel: "Non renseigné" },
    { title: "Type", name: "type", missingLabel: "Non renseigné" },
    { title: "Secteur", name: "sector", missingLabel: "Non renseigné" },
    { title: "Niveaux", name: "grades", missingLabel: "Non renseigné" },
    { title: "Département", name: "department", missingLabel: "Non renseigné" },
    { title: "Région", name: "region", missingLabel: "Non renseigné" },
    { title: "Académie", name: "academy", missingLabel: "Non renseigné" },
    { title: "Année scolaire", name: "schoolYear", missingLabel: "Non renseigné", defaultValue: ["2024-2025"] },
    {
      title: "Classe vide",
      name: "seatsTaken",
      missingLabel: "Non renseigné",
      filter: (item) => Number(item.key) === 0,
    },
  ].filter(Boolean);

  if (!isClasses) return null;
  const isCohortSelected = selectedFilters.cohort && selectedFilters.cohort.filter?.length > 0;

  return (
    <Page>
      <Header
        title="Liste de mes classes"
        breadcrumb={[{ title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" />, to: "/" }, { title: "Mes classes" }]}
        actions={[
          [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) && (
            <Button title="Exporter les classes" className="mr-2" onClick={() => exportData({ type: "export-des-classes" })} loading={exportLoading} />
          ),

          [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && (
            <Button
              title="Exporter le SR"
              onClick={() => exportData({ type: "schema-de-repartition" })}
              loading={exportLoading}
              disabled={!isCohortSelected}
              tooltip="Vous devez selectionner une cohort pour pouvoir exporter le SR"
            />
          ),
        ].filter(Boolean)}
      />
      {!isClasses && (
        <Container className="!p-8">
          <div className="py-6 bg-gray-50">
            <div className="flex items-center justify-center h-[136px] mb-4 text-lg text-gray-500 text-center">Vous n’avez pas encore créé de classe engagée</div>
            <div className="flex items-start justify-center h-[136px]">
              <Link to="/classes/create">
                <Button type="wired" leftIcon={<HiPlus />} title="Créer une première classe engagée" />
              </Link>
            </div>
          </div>
        </Container>
      )}
      {isClasses && (
        <Container className="!p-0">
          <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
            <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
              <Filters
                pageId={pageId}
                route="/elasticsearch/cle/classe/search?needRefInfo=true"
                setData={(value) => setData(value)}
                filters={filterArray}
                searchPlaceholder="Rechercher par mots clés, ville, code postal..."
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
                size={size}
                intermediateFilters={[getCohortGroups()]}
              />
              <SortOption
                sortOptions={[
                  { label: "Nom (A > Z)", field: "name.keyword", order: "asc" },
                  { label: "Nom (Z > A)", field: "name.keyword", order: "desc" },
                  { label: "Date de création (récent > ancien)", field: "createdAt", order: "desc" },
                  { label: "Date de création (ancien > récent)", field: "createdAt", order: "asc" },
                ]}
                selectedFilters={selectedFilters}
                pagination={paramData}
                onPaginationChange={setParamData}
              />
            </div>
            <div className="mt-2 flex flex-row flex-wrap items-center px-4">
              <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
              <SelectedFilters
                filterArray={filterArray}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
                paramData={paramData}
                setParamData={setParamData}
              />
            </div>

            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              size={size}
              setSize={setSize}
              render={
                <table className="mt-6 mb-2 flex w-full flex-col table-auto divide-y divide-gray-200 border-gray-100">
                  <thead>
                    <tr className="flex items-center py-2 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
                      <span className="w-[40%]">Classes</span>
                      <span className="w-[20%]">Cohortes</span>
                      <span className="w-[20%]">Élèves</span>
                      <span className="w-[20%]">Statuts</span>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.map((hit) => (
                      <ClasseRow key={hit._id} {...hit} />
                    ))}
                  </tbody>
                  <tr className="flex items-center py-2 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
                    <span className="w-[40%]">Classes</span>
                    <span className="w-[20%]">Cohortes</span>
                    <span className="w-[20%]">Élèves</span>
                    <span className="w-[20%]">Statuts</span>
                  </tr>
                </table>
              }
            />
          </div>
        </Container>
      )}
    </Page>
  );
}
