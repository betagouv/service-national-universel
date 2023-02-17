import React, { useState, useEffect } from "react";
import { region2department } from "snu-lib";
import api from "../../services/api";

export default function test() {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [query, setQuery] = useState(null);
  const [filters, setFilters] = useState({});
  const [count, setCount] = useState(0);
  const [filterVisible, setFilterVisible] = useState(false);
  const [openedFilter, setOpenedFilter] = useState("");

  const getDefaultQuery = () => {
    return { query: { bool: { must: [{ match_all: {} }] }, track_total_hits: true } };
  };
  const getData = async () => {
    const res = await buildMissions("id", selectedFilters, null, 1, 25, getDefaultQuery(), filterArray);
    if (!res) return;
    setFilters({ ...filters, ...res.newFilters });
    setCount(res.count);
    console.log(res);
  };
  useEffect(() => {
    getData();
  }, [selectedFilters]);
  useEffect(() => {
    getData();
  }, []);
  const getRegionCustomQuery = (data) => {
    console.log("getRegionCustomQuery", data);
    const arrayFilter = data?.map((e) => e.value) || [];
    let departmentArray = [];
    if (arrayFilter && Array.isArray(arrayFilter)) {
      arrayFilter?.map((e) => {
        departmentArray = departmentArray.concat(region2department[e]);
      });
    }
    if (departmentArray.length > 0) return { terms: { "department.keyword": departmentArray } };
    return null;
  };
  /* 
  {label: "", name: "", customQuery, datafield: ""}
  */
  const filterArray = [
    { title: "Cohorte", name: "cohort", datafield: "cohort.keyword", parentGroup: "Général" },
    { title: "Région", name: "region", datafield: "cohort.keyword", parentGroup: "Général" },
    { title: "Département", name: "department", datafield: "cohort.keyword", parentGroup: "Général" },
    { title: "Classe", name: "grade", datafield: "cohort.keyword", parentGroup: "Dossier" },
  ];
  const orderFilters = (filters, search = "") => {
    if (search === "") return filters;
  };
  return (
    <div className="bg-white">
      <div>Test Filtre sur Centres</div>
      <div>{count} résultats</div>
      <div className="ml-4">
        <FilterButton onClick={() => setFilterVisible((filterVisible) => !filterVisible)} />
        {filterVisible && (
          <div className="mt-2 rounded-md border-gray-100 border-[1px]">
            {/*  SearchBar */}
            {orderFilters(filterArray).map((f, i) => (
              <Filter
                key={i}
                title={f.title}
                name={f.name}
                openedFilter={openedFilter}
                setOpenedFilter={setOpenedFilter}
                filter={filters[f.name]}
                selectedFilters={selectedFilters}
                setSelectedFilters={setSelectedFilters}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const Filter = ({ name, title, filter = [], selectedFilters, setSelectedFilters, customQuery = null, openedFilter, setOpenedFilter }) => {
  // build query in filter and pass it to parent
  const handleSelect = (value) => {
    let newFilters = [];
    // store localement les filtres
    if (selectedFilters[name]) {
      if (selectedFilters[name].filter.includes(value)) {
        newFilters = selectedFilters[name].filter.filter((f) => f !== value);
      } else {
        newFilters = selectedFilters[name].filter.concat(value);
      }
    } else {
      newFilters = [value];
    }
    setSelectedFilters({ ...selectedFilters, [name]: { filter: newFilters, customQuery } });
  };

  /* 
    [
        { value: "filterName", filters: ["filtre1", "filtre2", "filtre3"] },
        { value: "filterName2", filters: ["filtre1", "filtre2", "filtre3"] },
    ]

    {
        "filterName":{filter: ["filtre1", "filtre2", "filtre3"}, customQuery],
        "filterName2":["filtre1", "filtre2", "filtre3"],
    }
  
  */

  /*
  const handleSelect = (value) => {
    if (selectedFilters[name]) {
      if (selectedFilters[name] === value) {
        const newFilters = { ...selectedFilters };
        delete newFilters[name];
        setSelectedFilters(newFilters);
      } else {
        setSelectedFilters({ ...selectedFilters, [name]: value });
      }
    } else {
      setSelectedFilters({ ...selectedFilters, [name]: value });
    }
  };
  */
  const selectedSubFilter = selectedFilters[name] ? selectedFilters[name].filter.length : 0;
  return (
    <div className="flex flex-row">
      <div className="flex flex-row justify-around w-[288px] border-gray-500 border-[1px] p-2 cursor-pointer bg-red-50" onClick={() => setOpenedFilter(name)}>
        <div className="self-start">{title}</div>
        {selectedSubFilter > 0 ? <div className="bg-red-500 p-1 rounded-full text-white text-xs ml-2">{selectedSubFilter}</div> : <></>}
      </div>

      <div className="absolute">
        {openedFilter === name && (
          <div className=" bg-white relative left-[288px]">
            {filter.map((f, i) => (
              <div onClick={() => handleSelect(f.value)} key={i} className="flex flex-row justify-between">
                <div className="flex flex-row border-2">
                  <input checked={selectedFilters[name] && selectedFilters[name].filter.includes(f.value)} className="cursor-pointer" type="checkbox" onChange={() => null} />
                  <div>{f.value}</div>
                </div>
                <div>{f.count}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const buildMissions = async (id, selectedFilters, search, page = 1, size = 25, query = null, filterArray) => {
  if (!query || !query.bool || !query.bool.must) query = { bool: { must: [{ match_all: {} }] } };

  let body = {
    query,
    aggs: {},
    size: size,
    from: size * (page - 1),
    sort: [{ createdAt: { order: "desc" } }],
    track_total_hits: true,
  };

  //ajouter les aggregations pour count
  filterArray.map((f) => {
    body.aggs[f.name] = { terms: { field: `${f.name}.keyword` } };
  });

  if (selectedFilters && Object.keys(selectedFilters).length) {
    Object.keys(selectedFilters).forEach((key) => {
      if (selectedFilters[key].customQuery) {
        // on a une custom query
        console.log("CUSTOM");
        console.log(selectedFilters[key].customQuery);
        //body.query.bool.must.push(selectedFilters[key].customQuery);
      } else if (selectedFilters[key].filter.length > 0) {
        body.query.bool.must.push({ terms: { [key]: selectedFilters[key].filter } });
      }
    });
  }

  console.log(body);

  /* 
  if (search) {
    body[1].query.bool.must.push({
      multi_match: { query: search, fields: ["title", "clientId", "organizationName"], type: "best_fields", operator: "or", fuzziness: 2 },
    });
  }
  */

  const res = await api.esQuery("young", body);
  if (!res || !res.responses || !res.responses[0]) return;

  const aggs = res.responses[0].aggregations;
  const data = res.responses[0].hits.hits.map((h) => ({ ...h._source, _id: h._id }));
  const count = res.responses[0].hits.total.value;
  const newFilters = {};

  // map a travers les aggregations pour recuperer les filtres

  filterArray.map((f) => {
    if (!selectedFilters[f.name]) newFilters[f.name] = aggs[f.name].buckets.map((b) => ({ value: b.key, count: b.doc_count }));
  });

  return { data, count, newFilters };
};

function FilterButton({ onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer bg-[#F3F4F6] w-24 h-10 rounded-md flex flex-row justify-center items-center">
      <svg width={12} height={11} viewBox="0 0 12 11" fill="#9CA3AF" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M0 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1.252a1 1 0 0 1-.293.708l-4.08 4.08a1 1 0 0 0-.294.708v1.171a1 1 0 0 1-.293.707l-.666.667c-.63.63-1.707.184-1.707-.707V7.748a1 1 0 0 0-.293-.708L.293 2.96A1 1 0 0 1 0 2.252V1Z"
          fill="#9CA3AF"
        />
      </svg>
      <div className="ml-2 text-grey-700">Filtres</div>
    </div>
  );
}
