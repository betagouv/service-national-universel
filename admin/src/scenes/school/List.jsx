import React, { useState } from "react";
import { useSelector } from "react-redux";
import { ROLES, academyList, departmentToAcademy, getDepartmentNumber, region2department } from "snu-lib";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters } from "../../components/filters-system-v2";
import { BsDownload } from "react-icons/bs";
import { Title } from "../centersV2/components/commons";
import { getCohortNameList } from "@/services/cohort.service";

export default function List() {
  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);

  const [data, setData] = React.useState([]);
  const pageId = "etablissementYoung";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({ page: 0 });
  const [size, setSize] = useState(10);

  const filterArray = [
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          title: "Région",
          name: "region",
          missingLabel: "Non renseignée",
          defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
          parentGroup: "Établissement",
        }
      : null,
    {
      title: "Département",
      name: "departmentName",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      parentGroup: "Établissement",
    },
    { title: "Cohorte", name: "cohort", parentGroup: "Volontaire", disabledBaseQuery: true, options: getCohortNameList(cohorts).map((e) => ({ key: e })) },
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          title: "Académie",
          name: "academy",
          parentGroup: "Volontaire",
          disabledBaseQuery: true,
          options:
            user.role === ROLES.REFERENT_REGION
              ? [...new Set(region2department[user.region].map((d) => departmentToAcademy[d]))].map((a) => ({ key: a }))
              : academyList.map((a) => ({ key: a })),
        }
      : null,
  ].filter((e) => e);

  return (
    <div className="flex w-full flex-1 flex-col gap-8 p-8">
      <Title>Établissements</Title>
      <div className="flex-column flex-1 flex-wrap rounded-lg bg-white py-4">
        <div className="mx-4">
          <div className="flex w-full flex-row justify-between">
            <Filters
              pageId={pageId}
              route="/elasticsearch/schoolramses/search"
              setData={(value) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par mots clés, ville, code postal..."
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
              size={size}
            />
            <div>
              <ExportComponent
                title="Exporter"
                filters={filterArray}
                route="/elasticsearch/schoolramses/export"
                exportTitle="Établissements"
                fieldsToExport={["uai", "fullName", "postcode", "type", "departmentName", "region", "city", "country", "adresse", "department", "codeCity", "codePays"]}
                transform={async (all) => {
                  return all?.map((data) => {
                    return {
                      Id: data._id.toString(),
                      UAI: data.uai,
                      Nom: data.fullName,
                      Ville: data.city,
                      "Code postal": data.postcode,
                      Département: data.departmentName,
                      Région: data.region,
                      "Nombre de volontaires": data?.total || 0,
                      "Nombre de volontaires au sein du département": data?.inDepartment || 0,
                      "Pourcentage de volontaires au sein du département": (((data.inDepartment || 0) * 100) / (data.total || 1)).toFixed(0),
                    };
                  });
                }}
                selectedFilters={selectedFilters}
                icon={<BsDownload className="text-gray-400" />}
                customCss={{
                  override: true,
                  button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
                  loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
                }}
              />
            </div>
          </div>
          <div className="mt-2 flex flex-row flex-wrap items-center">
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
            <div className="mt-6 mb-2 flex w-full flex-col border-y-[1px] border-gray-100">
              <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
                <div className="w-[70%] uppercase">Établissements</div>
                <div className="w-[30%] uppercase">Volontaires</div>
              </div>
              {data.map((hit) => (
                <Hit key={hit._id} hit={hit} />
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
}

const Hit = ({ hit, isLoading }) => {
  return (
    <div className="flex cursor-pointer items-center border-t-[1px] border-gray-100 py-3 px-4 hover:bg-gray-50">
      <div className="flex w-[70%] flex-col gap-1">
        <div className="truncate text-base font-bold leading-6 text-gray-900">{hit?.fullName}</div>
        <div className="text-xs font-normal leading-4 text-gray-500">{`${hit?.city || ""} • ${hit?.departmentName || ""}`}</div>
      </div>
      <div className="flex w-[30%] flex-col gap-2">
        {isLoading ? (
          <Loading width="w-[80%]" />
        ) : (
          <>
            <div className="text-xs font-normal leading-none text-gray-900">
              <strong>{hit.total || 0}</strong> Volontaires
            </div>
            <div className="text-xs font-normal uppercase leading-none text-gray-500">
              Dont <strong>{hit.inDepartment || 0}</strong> au sein du département ({(((hit.inDepartment || 0) * 100) / (hit.total || 1)).toFixed(0)}%)
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Loading = ({ width }) => {
  return (
    <div className={`flex animate-pulse space-x-4 ${width}`}>
      <div className="flex-1 space-y-6">
        <div className="grid grid-cols-3 gap-4 ">
          <div className="col-span-2 h-2 rounded bg-gray-300"></div>
          <div className="col-span-1 h-2 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
};
