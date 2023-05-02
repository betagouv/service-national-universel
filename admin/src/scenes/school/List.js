import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { COHORTS, ES_NO_LIMIT, ROLES, academyList, departmentToAcademy, getDepartmentNumber, region2department } from "snu-lib";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters } from "../../components/filters-system-v2";
import { BsDownload } from "react-icons/bs";
import { Title } from "../centersV2/components/commons";
import API from "../../services/api";

const getAggregSchool = async (schoolIds, filters, user) => {
  const body = {
    query: { bool: { must: { match_all: {} }, filter: [{ terms: { "schoolId.keyword": schoolIds } }] } },
    aggs: {
      school: {
        terms: { field: "schoolId.keyword", size: ES_NO_LIMIT },
        aggs: { departments: { terms: { field: "department.keyword" } }, firstUser: { top_hits: { size: 1 } } },
      },
    },
    size: 0,
    track_total_hits: true,
  };
  if (filters.cohort?.filter?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filters.cohort.filter } });
  if (filters.academy?.filter?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filters.academy.filter } });

  let route = "young";
  if (user.role === ROLES.REFERENT_DEPARTMENT) route = "young-having-school-in-department/inscriptions";
  if (user.role === ROLES.REFERENT_REGION) route = "young-having-school-in-region/inscriptions";

  const { responses } = await API.esQuery("young", body, route);
  let reducedSchool = responses[0]?.aggregations?.school?.buckets?.reduce((acc, school) => {
    if (school.key === "") return acc;
    const schoolInfo = school.firstUser?.hits?.hits[0]?._source;
    const total = school.doc_count;
    const isThereDep = school.departments?.buckets?.find((f) => f.key === schoolInfo.schoolDepartment) || {};
    const inDepartment = isThereDep.doc_count || 0;
    const outDepartment = total - inDepartment;

    if (!acc[school.key]) {
      acc[school.key] = {
        schoolId: school.key,
        total,
        inDepartment,
        outDepartment,
      };
    }

    return acc;
  }, {});

  for (const id of schoolIds) {
    if (!reducedSchool[id]) {
      reducedSchool[id] = {
        schoolId: id,
      };
    }
  }
  return Object.values(reducedSchool);
};

export default function List() {
  const user = useSelector((state) => state.Auth.user);

  const [youngBySchool, setYoungBySchool] = React.useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolIds, setSchoolIds] = React.useState([]);
  const [data, setData] = React.useState([]);
  const pageId = "etablissementYoung";
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const [paramData, setParamData] = React.useState({ page: 0 });

  const filterArray = [
    ![ROLES.REFERENT_DEPARTMENT].includes(user.role)
      ? {
          title: "Région",
          name: "region",
          datafield: "region.keyword",
          missingLabel: "Non renseignée",
          defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
          parentGroup: "Établissement",
        }
      : null,
    {
      title: "Département",
      name: "department",
      datafield: "departmentName.keyword",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      parentGroup: "Établissement",
    },
    { title: "Cohorte", name: "cohort", parentGroup: "Volontaire", disabledBaseQuery: true, options: COHORTS.map((e) => ({ key: e })) },
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

  const searchBarObject = {
    placeholder: "Rechercher par mots clés, ville, code postal...",
    datafield: ["fullName", "departmentName", "city", "uai", "zip", "code2022"],
  };

  const getDefaultQuery = () => {
    return {
      query: { bool: { must: [{ match_all: {} }] } },
      size: 0,
      track_total_hits: true,
    };
  };

  //Get List of Cohesion Center Ids
  useEffect(() => {
    if (data) setSchoolIds(data.map((center) => center._id));
  }, [data]);

  //fetch list young by session phase 1
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const list = await getAggregSchool(schoolIds, selectedFilters, user);
      setYoungBySchool(list);
      setIsLoading(false);
    })();
  }, [schoolIds, selectedFilters]);

  return (
    <div className="flex w-full flex-1 flex-col gap-8 p-8">
      <Title>Établissements</Title>
      <div className="flex-column flex-1 flex-wrap rounded-lg bg-white py-4">
        <div className="mx-4">
          <div className="flex w-full flex-row justify-between">
            <Filters
              pageId={pageId}
              esId="schoolramses"
              esRoute="schoolramses-limited-roles"
              defaultQuery={getDefaultQuery()}
              setData={(value) => setData(value)}
              filters={filterArray}
              searchBarObject={searchBarObject}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
            />
            <div>
              <ExportComponent
                title="Exporter"
                defaultQuery={getDefaultQuery()}
                filters={filterArray}
                exportTitle="Établissements"
                index="schoolramses-limited-roles"
                fieldsToExport={["uai", "fullName", "postcode", "type", "departmentName", "region", "city", "country", "adresse", "department", "codeCity", "codePays"]}
                transform={async (all) => {
                  const ids = all?.map((school) => school._id.toString());
                  const dataSchool = await getAggregSchool(ids, selectedFilters, user);

                  return all?.map((data) => {
                    const infoYoungs = dataSchool.find((e) => e.schoolId === data._id.toString());
                    return {
                      Id: data._id.toString(),
                      UAI: data.uai,
                      Nom: data.fullName,
                      Ville: data.city,
                      "Code postal": data.postcode,
                      Département: data.departmentName,
                      Région: data.region,
                      "Nombre de volontaires": infoYoungs?.total || 0,
                      "Nombre de volontaires au sein du département": infoYoungs?.inDepartment || 0,
                      "Pourcentage de volontaires au sein du département": (((infoYoungs.inDepartment || 0) * 100) / (infoYoungs.total || 1)).toFixed(0),
                    };
                  });
                }}
                selectedFilters={selectedFilters}
                searchBarObject={searchBarObject}
                icon={<BsDownload className="text-gray-400" />}
                css={{
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
          render={
            <div className="mt-6 mb-2 flex w-full flex-col border-y-[1px] border-gray-100">
              <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
                <div className="w-[70%] uppercase">Établissements</div>
                <div className="w-[30%] uppercase">Volontaires</div>
              </div>
              {data.map((hit) => (
                <Hit key={hit._id} hit={hit} infoYoungs={youngBySchool?.find((e) => e.schoolId === hit._id.toString()) || {}} />
              ))}
            </div>
          }
        />
      </div>
    </div>
  );
}

const Hit = ({ hit, infoYoungs, isLoading }) => {
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
              <strong>{infoYoungs.total || 0}</strong> Volontaires
            </div>
            <div className="text-xs font-normal uppercase leading-none text-gray-500">
              Dont <strong>{infoYoungs.inDepartment || 0}</strong> au sein du département ({(((infoYoungs.inDepartment || 0) * 100) / (infoYoungs.total || 1)).toFixed(0)}%)
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
