import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ES_NO_LIMIT, translateGrade } from "snu-lib";
import api from "../../services/api";
import ListFiltersPopOver from "./ListFiltersPopOver";

export default function test() {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filters, setFilters] = useState([]);
  const [count, setCount] = useState(0);
  const history = useHistory();
  const urlParams = new URLSearchParams(window.location.search);
  const mounted = React.useRef(false);

  const filterArray = [
    { title: "Cohorte", name: "cohort", datafield: "cohort.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Région", name: "region", datafield: "region.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Département", name: "department", datafield: "department.keyword", parentGroup: "Général", missingLabel: "Non renseignée" },
    { title: "Classe", name: "grade", datafield: "grade.keyword", parentGroup: "Dossier", translate: translateGrade, missingLabel: "Non renseignée" },
    { title: "Custom", name: "example", datafield: "example.keyword", parentGroup: "Dossier", customComponent: "example" },
  ];
  const getDefaultQuery = () => {
    return { query: { bool: { must: [{ match_all: {} }] }, track_total_hits: true } };
  };

  const init = async () => {
    const filters = getURLParam();
    setSelectedFilters(filters);
    const res = await buildMissions("id", filters, null, 1, 25, getDefaultQuery(), filterArray);
    if (!res) return;
    setFilters({ ...filters, ...res.newFilters });
    setCount(res.count);
    mounted.current = true;
  };

  const getData = async () => {
    const res = await buildMissions("id", selectedFilters, null, 1, 25, getDefaultQuery(), filterArray);
    if (!res) return;
    setFilters({ ...filters, ...res.newFilters });
    setCount(res.count);
  };

  const setURL = () => {
    const length = Object.keys(selectedFilters).length;
    let index = 0;
    const url = Object.keys(selectedFilters)?.reduce((acc, curr) => {
      console.log(selectedFilters[curr]);
      if (selectedFilters[curr]?.filter?.length > 0) {
        acc += `${curr}=${selectedFilters[curr]?.filter.join(",")}${index < length - 1 ? "&" : ""}`;
      }
      index++;
      return acc;
    }, "");
    history.replace({ search: `?${url}` });
  };

  //extract dans utils ou logique du filtre ?
  const getURLParam = () => {
    console.log(urlParams);
    const filters = {};
    urlParams.forEach((value, key) => {
      filters[key] = { filter: value.split(",") };
    });
    setSelectedFilters(filters);
    return filters;
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (mounted.current) {
      getData();
      setURL();
    }
  }, [selectedFilters]);

  return (
    <div className="bg-white h-full">
      <div>Test Filtre sur Centres</div>
      <div>{count} résultats</div>
      <div className="flex flex-col gap-8 m-4">
        <ListFiltersPopOver filters={filterArray} data={filters} setSelectedFilters={setSelectedFilters} selectedFilters={selectedFilters} onChangeFilter={getData} />
      </div>
    </div>
  );
}

//extarct dans utils ou logique du filtre ? en passant l'index en param ?
const buildMissions = async (id, selectedFilters, search, page = 1, size = 25, query = null, filterArray) => {
  if (!query || !query.bool || !query.bool.must) query = { bool: { must: [{ match_all: {} }] } };

  let bodyQuery = {
    query,
    aggs: {},
    size: size,
    from: size * (page - 1),
    sort: [{ createdAt: { order: "desc" } }],
    track_total_hits: true,
  };

  let bodyAggs = {
    query: { bool: { must: [{ match_all: {} }] } },
    aggs: {},
    size: 0,
    track_total_hits: true,
  };

  const getAggsFilters = (name) => {
    let aggregfiltersObject = {
      bool: {
        must: [],
      },
    };
    Object.keys(selectedFilters).map((key) => {
      if (key === name) return;
      if (selectedFilters[key].filter.length > 0) {
        let datafield = filterArray.find((f) => f.name === key).datafield;
        aggregfiltersObject.bool.must.push({ terms: { [datafield]: selectedFilters[key].filter } });
      }
    });
    return aggregfiltersObject;
  };

  //ajouter les aggregations pour count
  filterArray.map((f) => {
    bodyAggs.aggs[f.name] = {
      filter: { ...getAggsFilters(f.name) },
      aggs: {
        names: { terms: { field: filterArray.find((e) => f.name === e.name).datafield, missing: filterArray.find((e) => f.name === e.name).missingLabel, size: ES_NO_LIMIT } },
      },
    };
  });

  if (selectedFilters && Object.keys(selectedFilters).length) {
    Object.keys(selectedFilters).forEach((key) => {
      if (selectedFilters[key].customQuery) {
        // on a une custom query
        console.log("CUSTOM");
        console.log(selectedFilters[key].customQuery);
        //body.query.bool.must.push(selectedFilters[key].customQuery);
      } else if (selectedFilters[key].filter.length > 0) {
        let datafield = filterArray.find((f) => f.name === key).datafield;
        bodyQuery.query.bool.must.push({ terms: { [datafield]: selectedFilters[key].filter } });
      }
    });
  }

  /* 
  if (search) {
    body[1].query.bool.must.push({
      multi_match: { query: search, fields: ["title", "clientId", "organizationName"], type: "best_fields", operator: "or", fuzziness: 2 },
    });
  }
  */

  //maybe piquet le cal de l'api engagement pour dexu body en une req
  const resAggs = await api.esQuery("young", bodyAggs);
  if (!resAggs || !resAggs.responses || !resAggs.responses[0]) return;

  const resQuery = await api.esQuery("young", bodyQuery);
  if (!resAggs || !resAggs.responses || !resAggs.responses[0]) return;

  const aggs = resAggs.responses[0].aggregations;
  const data = resQuery.responses[0].hits.hits.map((h) => ({ ...h._source, _id: h._id }));
  const count = resQuery.responses[0].hits.total.value;
  const newFilters = {};

  // map a travers les aggregations pour recuperer les filtres

  filterArray.map((f) => {
    newFilters[f.name] = aggs[f.name].names.buckets.map((b) => ({ value: b.key, count: b.doc_count }));
  });

  return { data, count, newFilters };
};

// function FilterButton({ onClick }) {
//   return (
//     <div onClick={onClick} className="cursor-pointer bg-[#F3F4F6] w-24 h-10 rounded-md flex flex-row justify-center items-center">
//       <svg width={12} height={11} viewBox="0 0 12 11" fill="#9CA3AF" xmlns="http://www.w3.org/2000/svg">
//         <path
//           d="M0 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1.252a1 1 0 0 1-.293.708l-4.08 4.08a1 1 0 0 0-.294.708v1.171a1 1 0 0 1-.293.707l-.666.667c-.63.63-1.707.184-1.707-.707V7.748a1 1 0 0 0-.293-.708L.293 2.96A1 1 0 0 1 0 2.252V1Z"
//           fill="#9CA3AF"
//         />
//       </svg>
//       <div className="ml-2 text-grey-700">Filtres</div>
//     </div>
//   );
// }

// const getRegionCustomQuery = (data) => {
//   console.log("getRegionCustomQuery", data);
//   const arrayFilter = data?.map((e) => e.value) || [];
//   let departmentArray = [];
//   if (arrayFilter && Array.isArray(arrayFilter)) {
//     arrayFilter?.map((e) => {
//       departmentArray = departmentArray.concat(region2department[e]);
//     });
//   }
//   if (departmentArray.length > 0) return { terms: { "department.keyword": departmentArray } };
//   return null;
// };
/* 
  {label: "", name: "", customQuery, datafield: ""}
  */

// const Filter = ({ name, title, filter = [], selectedFilters, setSelectedFilters, customQuery = null, openedFilter, setOpenedFilter }) => {
//   // build query in filter and pass it to parent
//   const handleSelect = (value) => {
//     let newFilters = [];
//     // store localement les filtres
//     if (selectedFilters[name]) {
//       if (selectedFilters[name].filter.includes(value)) {
//         newFilters = selectedFilters[name].filter.filter((f) => f !== value);
//       } else {
//         newFilters = selectedFilters[name].filter.concat(value);
//       }
//     } else {
//       newFilters = [value];
//     }
//     setSelectedFilters({ ...selectedFilters, [name]: { filter: newFilters, customQuery } });
//   };

//   /*
//     [
//         { value: "filterName", filters: ["filtre1", "filtre2", "filtre3"] },
//         { value: "filterName2", filters: ["filtre1", "filtre2", "filtre3"] },
//     ]

//     {
//         "filterName":{filter: ["filtre1", "filtre2", "filtre3"}, customQuery],
//         "filterName2":["filtre1", "filtre2", "filtre3"],
//     }

//   */

//   /*
//   const handleSelect = (value) => {
//     if (selectedFilters[name]) {
//       if (selectedFilters[name] === value) {
//         const newFilters = { ...selectedFilters };
//         delete newFilters[name];
//         setSelectedFilters(newFilters);
//       } else {
//         setSelectedFilters({ ...selectedFilters, [name]: value });
//       }
//     } else {
//       setSelectedFilters({ ...selectedFilters, [name]: value });
//     }
//   };
//   */
//   const selectedSubFilter = selectedFilters[name] ? selectedFilters[name].filter.length : 0;
//   return (
//     <div className="flex flex-row">
//       <div className="flex flex-row justify-around w-[288px] border-gray-500 border-[1px] p-2 cursor-pointer bg-red-50" onClick={() => setOpenedFilter(name)}>
//         <div className="self-start">{title}</div>
//         {selectedSubFilter > 0 ? <div className="bg-red-500 p-1 rounded-full text-white text-xs ml-2">{selectedSubFilter}</div> : <></>}
//       </div>

//       <div className="absolute">
//         {openedFilter === name && (
//           <div className=" bg-white relative left-[288px]">
//             {filter.map((f, i) => (
//               <div onClick={() => handleSelect(f.value)} key={i} className="flex flex-row justify-between">
//                 <div className="flex flex-row border-2">
//                   <input checked={selectedFilters[name] && selectedFilters[name].filter.includes(f.value)} className="cursor-pointer" type="checkbox" onChange={() => null} />
//                   <div>{f.value}</div>
//                 </div>
//                 <div>{f.count}</div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
