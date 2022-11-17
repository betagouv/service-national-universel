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
  console.log("🚀 ~ file: schools.js ~ line 14 ~ Schools ~ filter", filter);
  const [schools, setSchools] = useState([]);
  console.log("🚀 ~ file: schools.js ~ line 16 ~ Schools ~ schools", schools);
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);

  const getDefaultQuery = () => {
    let body = {
      query: { bool: { must: { match_all: {} }, filter: [] } },
      aggs: {
        names: {
          terms: { field: "schoolId.keyword" },
          aggs: { departments: { terms: { field: "department.keyword" } }, firstUser: { top_hits: { size: 1 } } },
        },
      },
      size: 0,
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
      {/* <Missions> */}
      <ReactiveList
        defaultQuery={getDefaultQuery}
        componentId="result"
        // react={{ and: FILTERS }}
        pagination={true}
        paginationAt="bottom"
        size={10}
        showLoader={true}
        loader="Chargement..."
        innerClass={{ pagination: "pagination" }}
        dataField="created_at"
        renderResultStats={({ numberOfResults }) => {
          return <div className="text-gray-700 my-3 text-sm w-28 basis-3/4">{`${numberOfResults} établissement${numberOfResults > 1 ? "s" : ""}`}</div>;
        }}
        // sortOptions={[
        //   { label: "La plus récente", dataField: "createdAt.keyword", sortBy: "asc" },
        //   { label: "La plus proche", dataField: "sort.keyword", sortBy: "asc" },
        //   { label: "La plus longue", dataField: "duration.keyword", sortBy: "desc" },
        //   { label: "La plus courte", dataField: "duration.keyword", sortBy: "asc" },
        // ]}
        // defaultSortOption="La plus proche"
        render={({ data }) => {
          console.log("🚀 ~ file: schools.js ~ line 80 ~ data", data);
          return data.map((e) => {
            const tags = [];

            //     const totalHits = responses[0].hits.total.value;
            // console.log("🚀 ~ file: schools.js ~ line 42 ~ totalHits", totalHits);
            // const arr = responses[0].aggregations.names.buckets.map((e) => {
            //   const schoolInfo = e.firstUser?.hits?.hits[0]?._source;
            //   const total = e.doc_count;
            //   const isThereDep = e.departments?.buckets?.find((f) => f.key === schoolInfo.department) || {};
            //   const inDepartment = isThereDep.doc_count || 0;

            //   return {
            //     id: e.key,
            //     count: {
            //       total,
            //       department: inDepartment,
            //       outOfDepartment: total - inDepartment,
            //     },
            //     percent: {
            //       total: round1Decimal((total / totalHits) * 100),
            //       department: round1Decimal((inDepartment / total) * 100),
            //       outOfDepartment: round1Decimal(((total - inDepartment) / total) * 100),
            //     },
            //     name: schoolInfo.schoolName,
            //     city: schoolInfo.schoolCity,
            //     zip: schoolInfo.schoolZip,
            //     department: schoolInfo.schoolDepartment,
            //     type: schoolInfo.schoolType,
            //   };
            // });
            // setSchools(arr);

            // e.city && tags.push(e.city + (e.zip ? ` - ${e.zip}` : ""));
            // // tags.push(e.remote ? "À distance" : "En présentiel");
            // e.domains.forEach((d) => tags.push(translate(d)));
            // return <CardSchool key={e._id} school={e} />;
            return null;
          });
        }}
        renderNoResults={() => (
          <div className="text-gray-700 mb-3 text-sm">
            Aucune mission ne correspond à votre recherche. Merci de{" "}
            <a className="underline hover:underline font-medium hover:text-gray-700" href="/account" target="_blank" rel="noreferrer">
              vérifier votre adresse
            </a>
            .
          </div>
        )}
      />
      {/* </Missions> */}
    </ReactiveBase>
    // <TableWrapper>
    //   <Table>
    //     <thead>
    //       <TableHeaderRow>
    //         <TableHeaderCell>Établissements</TableHeaderCell>
    //         <TableHeaderCell>Volontaires au sein du département</TableHeaderCell>
    //         <TableHeaderCell>Volontaires hors du département</TableHeaderCell>
    //         <TableHeaderCell>Total</TableHeaderCell>
    //       </TableHeaderRow>
    //     </thead>
    //     <tbody>
    //       {schools.map((e, i) => {
    //         return (
    //           <TableRow
    //             key={i}
    //             onClick={() =>
    //               // ! Le filtre SCHOOL ne marche pas sur la page des inscriptions
    //               user.role === ROLES.VISITOR ? null : handleClick(getLink({ base: `/inscription`, filter, filtersUrl: [`SCHOOL=%5B"${replaceSpaces(e.name)}"%5D`] }))
    //             }>
    //             <TableCell>
    //               {e.name}
    //               <div>
    //                 {e.zip} {e.city}
    //               </div>
    //             </TableCell>
    //             <TableCell>
    //               <TableCellContent>
    //                 <TableCellValue>{e.count.department}</TableCellValue>
    //                 <TableCellPercentage>{e.percent.department} %</TableCellPercentage>
    //               </TableCellContent>
    //             </TableCell>
    //             <TableCell>
    //               <TableCellContent>
    //                 <TableCellValue>{e.count.outOfDepartment}</TableCellValue>
    //                 <TableCellPercentage>{e.percent.outOfDepartment} %</TableCellPercentage>
    //               </TableCellContent>
    //             </TableCell>
    //             <TableCell>
    //               <TableCellContent>
    //                 <TableCellValue>{e.count.total}</TableCellValue>
    //                 <TableCellPercentage>{e.percent.total} %</TableCellPercentage>
    //               </TableCellContent>
    //             </TableCell>
    //           </TableRow>
    //         );
    //       })}
    //     </tbody>
    //   </Table>
    // </TableWrapper>
  );
}

const CardSchool = ({ school }) => {
  return null;
  // const tags = [];
  // school.city && tags.push(school.city + (school.zip ? ` - ${school.zip}` : ""));
  // school.domains.forEach((d) => tags.push(translate(d)));
  // return (
  //   <Link
  //     to={`/school/${school._id}`}
  //     className="bg-white relative flex w-full justify-between shadow-nina rounded-xl p-4 border-[1px] border-[#ffffff] mb-4 hover:translate-x-1 transition duration-200 ease-in z-10">
  //     <div className="flex flex-1">
  //       {/* icon */}
  //       <div className="flex items-center mr-3">
  //         <IconDomain domain={school?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : school?.mainDomain} />
  //       </div>
  //       {/* infos school */}
  //       <div className="flex flex-col flex-1">
  //         <div className="space-y-2">
  //           <div className="flex space-x-4">
  //             <div className="text-gray-500 text-xs uppercase font-medium">{school?.structureName}</div>
  //           </div>
  //           <div className="text-gray-900 font-bold text-base">{school?.name}</div>
  //           <div className="flex flex-wrap gap-2">
  //             {tags.map((e, i) => (
  //               <div key={i} className="flex justify-center items-center text-gray-600 border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">
  //                 {e}
  //               </div>
  //             ))}
  //             {school?.isMilitaryPreparation === "true" ? (
  //               <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full px-4 py-1 text-xs">Préparation militaire</div>
  //             ) : null}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //     <div className="flex flex-1 justify-between">
  //       {/* DISTANCE */}
  //       {youngLocation && school.location ? (
  //         <div className="flex basis-[60%] items-center justify-end space-x-2">
  //           <LocationMarker className="text-gray-400" />
  //           <div className="text-gray-800 text-base font-bold">à {getDistance(youngLocation.lat, youngLocation.lon, school.location.lat, school.location.lon).toFixed(1)} km</div>
  //         </div>
  //       ) : (
  //         <div />
  //       )}
  //       {/* END DISTANCE */}
  //       {/* STATUT */}
  //       <div className="flex basis-[40%] items-center justify-end">
  //         <div className="text-gray-500 text-xs font-medium">&nbsp;{school?.placesLeft} places disponibles</div>
  //       </div>
  //       {/* END STATUT */}
  //     </div>
  //   </Link>
  // );
};

// Table
const TableWrapper = styled.div`
  padding: 0 10px;
  border: 1px solid #e2e2ea;
  border-radius: 10px;
  border-spacing: 0 2px;
`;
const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 2px;
`;
const TableHeaderRow = styled.tr``;
const TableHeaderCell = styled.td`
  padding: 18px 20px;
  color: #696974;
  font-size: 14px;
  text-align: center;

  &:first-child {
    font-size: 16px;
    font-weight: bold;
    text-align: left;
  }
`;
const TableRow = styled.tr`
  background-color: white;
  border-radius: 8px;
`;
const TableCell = styled.td`
  text-align: center;
  padding: 18px 20px;

  :first-child {
    text-align: left;
    font-size: 16px;
    color: #171725;
    font-weight: bold;
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }

  :first-child > div {
    font-size: 12px;
    font-weight: normal;
    color: gray;
  }
  :last-child {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  :last-child > div {
    border-right: 0;
  }
`;

const TableCellContent = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid rgba(203, 203, 210, 0.6);
`;
const TableCellValue = styled.strong`
  color: #171725;
  font-weight: bold;
  font-size: 18px;
`;
const TableCellPercentage = styled.span`
  padding: 5px 7px;
  margin-left: 10px;
  display: block;
  border: 1px solid #e0e0e4;
  box-sizing: border-box;
  border-radius: 10px;
  font-size: 14px;
  color: #7c7c7c;
`;
