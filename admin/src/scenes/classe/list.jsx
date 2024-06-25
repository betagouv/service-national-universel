import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { capture } from "@/sentry";
import api from "@/services/api";
import { Badge, Button, Container, Header, Label, Page } from "@snu/ds/admin";
import { HiPlus, HiUsers, HiOutlineOfficeBuilding } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { ROLES, translateStatusClasse, IS_CREATION_CLASSE_OPEN_CLE } from "snu-lib";

import dayjs from "@/utils/dayjs.utils";
import { statusClassForBadge } from "./utils";
import { getCohortGroups } from "@/services/cohort.service";

export default function List() {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);

  const [classes, setClasses] = useState(null);
  const [data, setData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [etablissements, setEtablissements] = useState(null);
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);

  const pageId = "classe-list";
  const exportv1 = new URLSearchParams(history.location.search).get("export-v1");

  useEffect(() => {
    (async () => {
      try {
        if ([ROLES.REFERENT_DEPARTMENT, ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role)) {
          const { data: etablissements } = await api.post(`/elasticsearch/cle/etablissement/export`, {
            filters: {},
            exportFields: ["name", "uai"],
          });
          setEtablissements(etablissements);
          setClasses(true);
          return;
        }
        const res = await api.post(`/elasticsearch/cle/classe/search`, { filters: {} });
        setClasses(res.responses[0].hits.total.value > 0);
        setEtablissements([]);
      } catch (e) {
        setClasses(false);
        capture(e);
      }
    })();
  }, []);

  const exportData = async ({ type }) => {
    setExportLoading(true);
    try {
      // TODO: reintégrer export ES une fois synchro ok
      let res;
      if (exportv1) {
        res = await api.post(`/elasticsearch/cle/classe/export?type=${type}`, {
          filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
            return { ...e, [key]: value.filter };
          }, {}),
        });
      } else {
        res = await api.post(
          `/cle/classe/export?type=${type}`,
          Object.entries(selectedFilters).reduce((e, [key, value]) => {
            return { ...e, [key]: value.filter };
          }, {}),
        );
      }
      const result = await exportExcelSheet({ data: res.data, type });
      const buffer = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
      FileSaver.saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }), result.fileName);
    } catch (error) {
      capture(error);
    }
    setExportLoading(false);
  };

  if (classes === null || !etablissements) return null;

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
    { title: "Statut phase 1", name: "statusPhase1", missingLabel: "Non renseigné" },
    { title: "Nom", name: "name", missingLabel: "Non renseigné" },
    { title: "Couleur", name: "coloration", missingLabel: "Non renseigné" },
    { title: "Type", name: "type", missingLabel: "Non renseigné" },
    { title: "Secteur", name: "sector", missingLabel: "Non renseigné" },
    { title: "Niveau", name: "grades", missingLabel: "Non renseigné" },
    { title: "Département", name: "department", missingLabel: "Non renseigné" },
    { title: "Région", name: "region", missingLabel: "Non renseigné" },
    { title: "Académie", name: "academy", missingLabel: "Non renseigné" },
    { title: "Année scolaire", name: "schoolYear", missingLabel: "Non renseigné" },
  ].filter(Boolean);

  if (classes === null) return null;
  const isCohortSelected = exportv1 || (selectedFilters.cohort && selectedFilters.cohort.filter?.length > 0);

  return (
    <Page>
      <Header
        title="Liste de mes classes"
        breadcrumb={[{ title: <HiOutlineOfficeBuilding size={20} /> }, { title: "Mes classes" }]}
        actions={[
          [ROLES.ADMINISTRATEUR_CLE].includes(user.role) && IS_CREATION_CLASSE_OPEN_CLE && (
            <Link key="list" to="/classes/create" className="ml-2">
              <Button leftIcon={<HiOutlineOfficeBuilding size={16} />} title="Créer une classe" />
            </Link>
          ),
          [ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && (
            <div className="flex gap-2 items-center">
              <Button
                title="Exporter le SR"
                onClick={() => exportData({ type: "schema-de-repartition" })}
                loading={exportLoading}
                disabled={!isCohortSelected}
                tooltip="Vous devez selectionner une cohort pour pouvoir exporter le SR"
              />
            </div>
          ),
        ].filter(Boolean)}
      />
      {!classes && (
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
      {classes && (
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
                paramData={paramData}
                setParamData={setParamData}
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
                <table className="mt-6 mb-2 flex w-full flex-col table-auto divide-y divide-gray-100 border-gray-100">
                  <thead>
                    <tr className="flex items-center py-3 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
                      <span className="w-[40%]">Classes</span>
                      <span className="w-[20%]">Cohortes</span>
                      <span className="w-[20%]">Élèves</span>
                      <span className="w-[20%]">Statuts</span>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((hit) => (
                      <Hit key={hit._id} hit={hit} />
                    ))}
                  </tbody>
                  <tr className="flex items-center py-3 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
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

const Hit = ({ hit }) => {
  const history = useHistory();
  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50" onClick={() => history.push(`/classes/${hit._id}`)}>
      <td className="flex w-[40%] cursor-pointer items-center gap-4">
        <div className="flex w-full flex-col justify-center">
          <div className="m-0 table w-full table-fixed border-collapse">
            {hit?.name ? (
              <div className="table-cell truncate font-bold text-gray-900 text-base leading-5">{hit.name}</div>
            ) : (
              <div className="table-cell  text-gray-400 italic leading-5">Nom à préciser</div>
            )}
          </div>
          <div className="m-0 mt-1 table w-full table-fixed border-collapse">
            <div className="table-cell truncate text-xs leading-5 text-gray-500 ">id: {hit.uniqueKeyAndId}</div>
          </div>
          {hit?.referentClasse && (
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cell truncate text-xs leading-5 text-gray-900 ">
                {hit.referentClasse[0]?.firstName} {hit.referentClasse[0]?.lastName}
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="flex w-[20%] flex-col gap-2">
        <Badge title={hit.cohort} leftIcon={<HiUsers color="#EC4899" size={20} />} />
      </td>
      <td className="flex w-[20%] flex-col gap-2">{hit?.totalSeats ? <Badge title={hit.seatsTaken + "/" + hit.totalSeats} /> : <Badge title="À préciser" />}</td>
      <td className="w-[20%]">
        <Badge title={translateStatusClasse(hit.status)} status={statusClassForBadge(hit.status)} />
      </td>
    </tr>
  );
};

function exportExcelSheet({ data: classes, type }) {
  let sheetData = classes.map((c) => ({
    id: c._id.toString(),
    uniqueKeyAndId: c.uniqueKeyAndId,
    name: c.name,
    cohort: c.cohort,
    students: (c.seatsTaken ?? 0) + "/" + (c.totalSeats ?? 0),
    coloration: c.coloration,
    status: translateStatusClasse(c.status),
    updatedAt: dayjs(c.updatedAt).format("DD/MM/YYYY HH:mm"),
    createdAt: dayjs(c.createdAt).format("DD/MM/YYYY HH:mm"),
  }));
  let headers = ["ID", "Identifiant", "Nom", "Cohorte", "Élèves", "Coloration", "Statut", "Date de dernière modification", "Date de création"];

  if (type === "schema-de-repartition") {
    sheetData = classes.map((c) => ({
      cohort: c.cohort,
      id: c._id.toString(),
      name: c.name,
      coloration: c.coloration,
      updatedAt: dayjs(c.updatedAt).format("DD/MM/YYYY HH:mm"),
      region: c.etablissement?.region,
      department: c.etablissement?.department,
      uai: c.etablissement?.uai,
      etablissementName: c.etablissement?.name,
      classeRefLastName: c.referentClasse ? c.referentClasse[0]?.lastName : "",
      classeRefFirstName: c.referentClasse ? c.referentClasse[0]?.firstName : "",
      classeRefEmail: c.referentClasse ? c.referentClasse[0]?.email : "",
      youngsVolume: c.totalSeats ?? 0,
      studentInProgress: c.studentInProgress,
      studentWaiting: c.studentWaiting,
      studentValidated: c.studentValidated,
      studentAbandoned: c.studentAbandoned,
      studentNotAutorized: c.studentNotAutorized,
      studentWithdrawn: c.studentWithdrawn,
      centerId: c.cohesionCenterId,
      centerName: c.cohesionCenter ? `${c.cohesionCenter?.name}, ${c.cohesionCenter?.address}, ${c.cohesionCenter?.zip} ${c.cohesionCenter?.city}` : "",
      centerDepartment: c.cohesionCenter?.department,
      centerRegion: c.cohesionCenter?.region,
      pointDeRassemblementId: c.pointDeRassemblementId,
      pointDeRassemblementName: c.pointDeRassemblement?.name,
      pointDeRassemblementAddress: c.pointDeRassemblement ? `${c.pointDeRassemblement?.address}, ${c.pointDeRassemblement?.zip} ${c.pointDeRassemblement?.city}` : "",
    }));

    // tri par centre
    sheetData.sort((a, b) => {
      const aname = a.centerName;
      const bname = b.centerName;

      if (aname) {
        if (bname) return aname.localeCompare(bname);
        return -1;
      } else {
        if (bname) return 1;
        return 0;
      }
    });

    // --- fix header names
    headers = [
      "Cohorte",
      "ID de la classe",
      "Nom de la classe",
      "Coloration",
      "Date de dernière modification",
      "Région des volontaires",
      "Département des volontaires",
      "UAI de l'établissement",
      "Nom de l'établissement",
      "Nom du référent de classe",
      "Prénom du référent de classe",
      "Email du référent de classe",
      "Nombre de places total",
      "Nombre d'élèves en cours",
      "Nombre d'élèves en attente",
      "Nombre d'élèves validés",
      "Nombre d'élèves abandonnés",
      "Nombre d'élèves non autorisés",
      "Nombre d'élèves désistés",
      "ID centre",
      "Désignation du centre",
      "Département du centre",
      "Région du centre",
      "ID du point de rassemblement",
      "Désignation du point de rassemblement",
      "Adresse du point de rassemblement",
    ];
  }

  let sheet = XLSX.utils.json_to_sheet(sheetData);
  XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: "A1" });

  // --- create workbook
  let workbook = XLSX.utils.book_new();
  // ⚠️ Becareful, sheet name length is limited to 31 characters
  XLSX.utils.book_append_sheet(workbook, sheet, type === "schema-de-repartition" ? "Répartition des classes" : "Liste des classes");
  const fileName = "classes-schema-repartition.xlsx";
  return { workbook, fileName };
}
