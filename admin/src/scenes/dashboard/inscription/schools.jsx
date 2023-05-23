import React from "react";

import api from "../../../services/api";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import { getLink, replaceSpaces } from "../../../utils";

import { apiURL } from "../../../config";
import { useHistory } from "react-router-dom";

function round1Decimal(num) {
  return Math.round((num + Number.EPSILON) * 10) / 10;
}

export default function Schools({ filter }) {
  const history = useHistory();
  const getDefaultQuery = () => {
    let body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        names: {
          terms: { field: "schoolId.keyword", size: 500 },
          aggs: { departments: { terms: { field: "department.keyword" } }, firstUser: { top_hits: { size: 1 } } },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    if (filter.status) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
    if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
    if (filter.department?.length) body.query.bool.filter.push({ terms: { "schoolDepartment.keyword": filter.department } });

    return body;
  };

  return (
    <ReactiveBase url={`${apiURL}/es`} app="young-having-school-in-department/inscriptions" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <ReactiveList
        defaultQuery={getDefaultQuery}
        componentId="result"
        react={{ and: filter }}
        size={300}
        showLoader={true}
        renderResultStats={({ numberOfResults, displayedResults }) => {
          return (
            <div className="mb-3 flex w-full items-end justify-between px-2">
              <div className="text-sm text-gray-700">{`${displayedResults}  établissement${numberOfResults > 1 ? "s" : ""} affichés sur ${numberOfResults}`}</div>
              <div className="flex flex-col">
                <div className="text-sm text-gray-800">Besoin d’exporter les inscrits scolarisés dans le département ?</div>
                <div className="inline text-xs text-gray-500">
                  Vous pouvez le faire depuis l’
                  <span className="cursor-pointer text-blue-600 underline" onClick={() => history.push("/inscription")}>
                    onglet Inscriptions
                  </span>
                  .
                </div>
              </div>
            </div>
          );
        }}
        loader="Chargement..."
        dataField="schoolName"
        renderNoResults={() => <></>} // ! Hide no results
        render={({ rawData }) => {
          const totalHits = rawData?.hits?.total.value;

          return (
            <table className="w-full border-separate rounded-xl border p-2">
              <thead className="">
                <tr className="text-xs uppercase text-[#73737D]">
                  <th className="pl-3 text-left">Établissements</th>
                  <th className="text-center">Volontaires au sein du département</th>
                  <th className="text-center">Volontaires hors du département</th>
                  <th className="w-[120px] text-center">Total</th>
                </tr>
              </thead>
              <tbody className="">
                {rawData?.aggregations?.names.buckets.map((e) => (
                  <CardSchool key={e.key} school={e} totalHits={totalHits} filter={filter} />
                ))}
              </tbody>
            </table>
          );
        }}
      />
    </ReactiveBase>
  );
}

const CardSchool = ({ school, totalHits, filter }) => {
  const schoolInfo = school.firstUser?.hits?.hits[0]?._source;
  const total = school.doc_count;
  const isThereDep = school.departments?.buckets?.find((f) => f.key === schoolInfo.schoolDepartment) || {};
  const inDepartment = isThereDep.doc_count || 0;
  const outDepartment = total - inDepartment;

  const history = useHistory();

  const handleClick = (link) => {
    history.push(link);
  };

  return (
    <tr className={`group bg-white`} onClick={() => handleClick(getLink({ base: `/inscription`, filter, filtersUrl: [`SCHOOL=%5B"${replaceSpaces(schoolInfo.schoolName)}"%5D`] }))}>
      <td className={`rounded-l-lg p-2 group-hover:bg-gray-200`}>
        <div className={`text-[15px] font-bold`}>{`${schoolInfo.schoolName}`}</div>
        <div className={`text-xs font-normal`}>{`${schoolInfo.schoolCity} - ${schoolInfo.schoolZip}`}</div>
      </td>
      <td className={`align-center text-center group-hover:bg-gray-200`}>
        <div className="flex items-center justify-center">
          <div className={`text-[15px] font-bold`}>{inDepartment}</div>
          <div className={`ml-1 box-border rounded-sm border border-[#e0e0e4] p-1 text-xs font-normal text-[#7c7c7c]`}>{`${round1Decimal((inDepartment / total) * 100)} %`}</div>
        </div>
      </td>
      <td className={`text-center group-hover:bg-gray-200`}>
        <div className="flex items-center justify-center">
          <div className={`text-[15px] font-bold`}>{outDepartment}</div>
          <div className={`ml-1 box-border rounded-sm border border-[#e0e0e4] p-1 text-xs font-normal text-[#7c7c7c]`}>{`${round1Decimal((outDepartment / total) * 100)} %`}</div>
        </div>
      </td>
      <td className={`rounded-r-lg text-center group-hover:bg-gray-200`}>
        <div className="flex items-center justify-center">
          <div className={`text-[15px] font-bold`}>{total}</div>
          <div className={`ml-1 box-border rounded-sm border border-[#e0e0e4] p-1 text-xs font-normal text-[#7c7c7c]`}>{`${round1Decimal((total / totalHits) * 100)} %`}</div>
        </div>
      </td>
    </tr>
  );
};
