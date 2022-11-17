import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";

import api from "../../../services/api";
import { getLink, replaceSpaces, ROLES } from "../../../utils";
import { useSelector } from "react-redux";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";
import { apiURL } from "../../../config";
import { translate } from "snu-lib";

function round1Decimal(num) {
  return Math.round((num + Number.EPSILON) * 10) / 10;
}

export default function Schools({ filter }) {
  console.log("RENDER Schools");
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);

  const getDefaultQuery = () => {
    console.log("QUERY");
    let body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        names: {
          terms: { field: "schoolId.keyword" },
          aggs: { departments: { terms: { field: "department.keyword" } }, firstUser: { top_hits: { size: 1 } } },
        },
      },
      size: 0,
      track_total_hits: true,
    };

    if (filter.status) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
    if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
    if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
    if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
    if (filter.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filter.academy } });

    return body;
  };

  const handleClick = (link) => {
    history.push(link);
  };

  return (
    <ReactiveBase url={`${apiURL}/es`} app="young" headers={{ Authorization: `JWT ${api.getToken()}` }}>
      <ReactiveList
        defaultQuery={getDefaultQuery}
        componentId="result"
        react={{ and: filter }}
        pagination={true}
        paginationAt="bottom"
        size={10}
        showLoader={true}
        renderResultStats={({ numberOfResults, displayedResults }) => {
          return (
            <div className="text-gray-700 my-3 text-sm w-28 basis-3/4">{`${displayedResults}  établissement${numberOfResults > 1 ? "s" : ""} affichés sur ${numberOfResults}`}</div>
          );
        }}
        loader="Chargement..."
        // innerClass={{ pagination: "pagination" }}
        dataField="schoolName"
        sortOptions={[{ label: "A > Z", dataField: "schoolName.keyword", sortBy: "asc" }]}
        defaultSortOption="A > Z"
        render={({ rawData }) => {
          console.log("🚀 ~ file: schools.js ~ line 80 ~ data", rawData);

          const totalHits = rawData?.hits?.total.value;

          return (
            <table className="w-full p-2 border-separate border rounded-xl">
              <thead className="">
                <tr className="text-xs uppercase text-[#73737D]">
                  <th className="text-left ">Établissements</th>
                  <th className="text-center">Volontaires au sein du département</th>
                  <th className="text-center">Volontaires hors du département</th>
                  <th className="text-center w-[120px]">Total</th>
                </tr>
              </thead>
              <tbody className="">
                {rawData?.aggregations?.names.buckets.map((e) => (
                  <CardSchool key={e.key} school={e} totalHits={totalHits} />
                ))}
              </tbody>
            </table>
          );
        }}
        renderNoResults={() => <div className="text-gray-700 mb-3 text-sm">Aucuns établissements ne correspondent à ces filtres.</div>}
      />
    </ReactiveBase>

    //             onClick={() =>
    //               // ! Le filtre SCHOOL ne marche pas sur la page des inscriptions
    //               user.role === ROLES.VISITOR ? null : handleClick(getLink({ base: `/inscription`, filter, filtersUrl: [`SCHOOL=%5B"${replaceSpaces(e.name)}"%5D`] }))
  );
}

const CardSchool = ({ school, totalHits }) => {
  // console.log("🚀 ~ file: schools.js ~ line 183 ~ CardSchool ~ school", school);

  const schoolInfo = school.firstUser?.hits?.hits[0]?._source;
  const total = school.doc_count;
  const isThereDep = school.departments?.buckets?.find((f) => f.key === schoolInfo.department) || {};
  const inDepartment = isThereDep.doc_count || 0;
  const outDepartment = total - inDepartment;

  return (
    <tr className={`bg-white group`}>
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
