import React, { useState } from "react";
import { Badge, Button, Container, Header, Page } from "@snu/ds/admin";
import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { HiOutlineOfficeBuilding, HiUsers } from "react-icons/hi";
import { useHistory } from "react-router-dom";
import { getDepartmentNumber } from "snu-lib";

export default function List() {
  const [data, setData] = useState([]);
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
  ];

  return (
    <Page>
      <Header title="Liste des établissements" breadcrumb={[{ title: <HiOutlineOfficeBuilding size={20} /> }, { title: "Établissements" }]} />
      <Container className="!p-0">
        <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
          <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
            <Filters
              pageId={pageId}
              route="/elasticsearch/cle/etablissement/search"
              setData={(value) => setData(value)}
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
                    <span className="w-[50%]">Nom et adresse</span>
                    <span className="w-[20%]">UAI</span>
                    <span className="w-[15%]">Classes</span>
                    <span className="w-[15%]">Élèves</span>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.map((hit) => (
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
