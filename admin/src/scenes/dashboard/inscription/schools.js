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
            <div className="flex items-end justify-between w-full mb-3 px-2">
              <div className="text-gray-700 text-sm">{`${displayedResults}  établissement${numberOfResults > 1 ? "s" : ""} affichés sur ${numberOfResults}`}</div>
              <div className="flex flex-col">
                <div className="text-gray-800 text-sm">Besoin d’exporter les inscrits scolarisés dans le département ?</div>
                <div className="text-gray-500 text-xs inline">
                  Vous pouvez le faire depuis l’
                  <span className="text-blue-600 underline cursor-pointer" onClick={() => history.push("/inscription")}>
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
            <table className="w-full p-2 border-separate border rounded-xl">
              <thead className="">
                <tr className="text-xs uppercase text-[#73737D]">
                  <th className="text-left pl-3">Établissements</th>
                  <th className="text-center">Volontaires au sein du département</th>
                  <th className="text-center">Volontaires hors du département</th>
                  <th className="text-center w-[120px]">Total</th>
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
  const isThereDep = school.departments?.buckets?.find((f) => f.key === schoolInfo.department) || {};
  const inDepartment = isThereDep.doc_count || 0;
  const outDepartment = total - inDepartment;

  const history = useHistory();

  const handleClick = (link) => {
    history.push(link);
  };

  return (
    <tr className={`bg-white group`} onClick={() => handleClick(getLink({ base: `/inscription`, filter, filtersUrl: [`SCHOOL=%5B"${replaceSpaces(schoolInfo.schoolName)}"%5D`] }))}>
      <td className={`group-hover:bg-gray-200 rounded-l-lg p-2`}>
        <div className={`font-bold text-[15px]`}>{`${schoolInfo.schoolName}`}</div>
        <div className={`font-normal text-xs`}>{`${schoolInfo.schoolCity} - ${schoolInfo.schoolZip}`}</div>
      </td>
      <td className={`group-hover:bg-gray-200 text-center align-center`}>
        <div className="flex justify-center items-center">
          <div className={`font-bold text-[15px]`}>{inDepartment}</div>
          <div className={`font-normal text-xs ml-1 p-1 border border-[#e0e0e4] box-border rounded-sm text-[#7c7c7c]`}>{`${round1Decimal((inDepartment / total) * 100)} %`}</div>
        </div>
      </td>
      <td className={`group-hover:bg-gray-200 text-center`}>
        <div className="flex justify-center items-center">
          <div className={`font-bold text-[15px]`}>{outDepartment}</div>
          <div className={`font-normal text-xs ml-1 p-1 border border-[#e0e0e4] box-border rounded-sm text-[#7c7c7c]`}>{`${round1Decimal((outDepartment / total) * 100)} %`}</div>
        </div>
      </td>
      <td className={`group-hover:bg-gray-200 rounded-r-lg text-center`}>
        <div className="flex justify-center items-center">
          <div className={`font-bold text-[15px]`}>{total}</div>
          <div className={`font-normal text-xs ml-1 p-1 border border-[#e0e0e4] box-border rounded-sm text-[#7c7c7c]`}>{`${round1Decimal((total / totalHits) * 100)} %`}</div>
        </div>
      </td>
    </tr>
  );
};
