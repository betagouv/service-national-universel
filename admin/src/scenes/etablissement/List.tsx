import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HiHome, HiPlus } from "react-icons/hi";
import { Link, useHistory } from "react-router-dom";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";

import { AuthState } from "@/redux/auth/reducer";
import { Badge, Button, Container, Header, Page } from "@snu/ds/admin";
import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { getDepartmentNumber, translate, YoungDto, isAdmin } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";

import { exportExcelSheet, EtablissementExport } from "./utils";

export default function List() {
  const [youngs, setYoungs] = useState<YoungDto[]>([]);
  const user = useSelector((state: AuthState) => state.Auth.user);
  const pageId = "etablissement-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);
  const filterArray = [
    { title: "Nom", name: "name", missingLabel: "Non renseigné" },
    { title: "UAI", name: "uai", missingLabel: "Non renseigné" },
    { title: "Département", name: "department", missingLabel: "Non renseigné", translate: (e) => getDepartmentNumber(e) + " - " + e },
    { title: "Région", name: "region", missingLabel: "Non renseigné" },
    { title: "Ville", name: "city", missingLabel: "Non renseigné" },
    { title: "Type", name: "type", missingLabel: "Non renseigné" },
    { title: "Secteur", name: "sector", missingLabel: "Non renseigné" },
    { title: "Académie", name: "academy", missingLabel: "Non renseigné", translate },
    { title: "Années scolaires", name: "schoolYears", missingLabel: "Non renseigné", defaultValue: ["2024-2025"] },
    { title: "État", name: "state", missingLabel: "Non renseigné", translate },
  ];

  const exportData = async () => {
    try {
      const res = await api.post(`/elasticsearch/cle/etablissement/export?needReferentInfo=true`, {
        filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
          return { ...e, [key]: (value as any).filter };
        }, {}),
      });
      const etablissements: EtablissementExport[] = res.data;
      const result = await exportExcelSheet(etablissements);
      const buffer = XLSX.write(result.workbook, { bookType: "xlsx", type: "array" });
      FileSaver.saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }), result.fileName);
    } catch (error) {
      capture(error);
    }
  };

  const getActionsList = () => {
    const actionsList = [<Button key="export" title="Exporter" onClick={() => exportData()} />];
    if (isAdmin(user)) {
      actionsList.push(
        <Link to="/etablissement/create">
          <Button type="wired" leftIcon={<HiPlus size={20} className="mt-1" />} title="Créer un établissement" className="ml-2" />
        </Link>,
      );
    }
    return actionsList;
  };

  return (
    <Page>
      <Header
        title="Liste des établissements"
        breadcrumb={[{ title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" />, to: "/" }, { title: "Établissements" }]}
        actions={getActionsList()}
      />
      <Container className="!p-0">
        <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
          <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
            <Filters
              pageId={pageId}
              route="/elasticsearch/cle/etablissement/search"
              setData={(value) => setYoungs(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par mots clés, ville, code postal..."
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
              size={size}
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
            currentEntryOnPage={youngs?.length}
            size={size}
            setSize={setSize}
            render={
              <table className="mt-6 mb-2 flex w-full flex-col table-auto divide-y divide-gray-100 border-gray-100">
                <thead>
                  <tr className="flex items-center py-3 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
                    <span className="w-[50%]">Nom et adresse</span>
                    <span className="w-[20%]">UAI</span>
                    <span className="w-[15%]">Classes</span>
                    <span className="w-[15%]">Élèves</span>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {youngs.map((hit) => (
                    <Hit key={hit._id} hit={hit} />
                  ))}
                </tbody>
                <tr className="flex items-center py-3 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
                  <span className="w-[50%]">Nom et adresse</span>
                  <span className="w-[20%]">UAI</span>
                  <span className="w-[15%]">Classes</span>
                  <span className="w-[15%]">Élèves</span>
                </tr>
              </table>
            }
          />
        </div>
      </Container>
    </Page>
  );
}

const Hit = ({ hit }) => {
  const history = useHistory();
  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50" onClick={() => history.push(`/etablissement/${hit._id}`)}>
      <td className="flex w-[50%] cursor-pointer items-center gap-4">
        <div className="flex w-full flex-col justify-center">
          <div className="m-0 table w-full table-fixed border-collapse">
            {hit?.name ? (
              <div className="table-cell truncate font-bold text-gray-900 text-base leading-5">{hit.name}</div>
            ) : (
              <div className="table-cell  text-gray-400 italic leading-5">Nom à préciser</div>
            )}
          </div>
          <div className="m-0 mt-1 table w-full table-fixed border-collapse">
            <div className="table-cel truncate text-xs leading-5 text-gray-500 ">
              {hit.address} {hit.zip} {hit.city}
            </div>
          </div>
        </div>
      </td>
      <td className="flex w-[20%] flex-col gap-2">
        <p className="text-sm leading-5 font-normal text-gray-500">{hit.uai}</p>
      </td>
      <td className="flex w-[15%] flex-col gap-2">
        <Badge title={hit.nb_classe} />
      </td>
      <td className="w-[15%]">
        <Badge title={hit.nb_young} />
      </td>
    </tr>
  );
};
