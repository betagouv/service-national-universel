import React, { useState, useEffect } from "react";
import { region2department } from "snu-lib";
import api from "../../services/api";

const fields = ["cohort", "region"];

export default function test() {
  const [selectedFilters, setSelectedFilters] = useState({});
  const [query, setQuery] = useState(null);
  const [filters, setFilters] = useState({});
  const [count, setCount] = useState(0);

  const getDefaultQuery = () => {
    return { query: { bool: { must: [{ match_all: {} }] }, track_total_hits: true } };
  };
  const getData = async () => {
    const res = await buildMissions("id", selectedFilters, null, 1, 25, getDefaultQuery(), fields);
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
  return (
    <div>
      <div>Test Filtre sur Centres</div>
      <div>{count} résultats</div>
      <Filter
        //customQuery={getRegionCustomQuery(filters.region)}
        filter={filters.region}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        /*
        transformData={(data) => {
          const newData = [];
          data.map((d) => {
            const region = department2region[d.key];
            const val = newData.find((e) => e.key === region);
            if (val) {
              newData[newData.indexOf(val)].doc_count += d.doc_count;
            } else {
              newData.push({ key: region, doc_count: d.doc_count });
            }
          });
          return newData;
        }}
        */
        defaultQuery={getDefaultQuery}
        name="region.keyword"
        title="Région"
      />
      <Filter title="Cohorte" name="cohort.keyword" filter={filters.cohorts} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
    </div>
  );
}

const Filter = ({ name, title, filter = [], selectedFilters, setSelectedFilters, customQuery = null }) => {
  // build query in filter and pass it to parent
  const [open, setOpen] = useState(false);

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
  return (
    <div>
      <div className="border-gray-500 border-[1px] w-fit p-2 cursor-pointer" onClick={() => setOpen((open) => !open)}>
        {title}
      </div>
      {open && (
        <div className=" bg-white">
          {filter.map((f, i) => (
            <div onClick={() => handleSelect(f.value)} key={i}>
              {f.value} {f.count} {selectedFilters[name] && selectedFilters[name].filter.includes(f.value) && "selected"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const buildMissions = async (id, selectedFilters, search, page = 1, size = 25, query = null, fields) => {
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
  fields.map((f) => {
    body.aggs[f] = { terms: { field: `${f}.keyword` } };
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

  fields.map((f) => {
    newFilters[f] = aggs[f].buckets.map((b) => ({ value: b.key, count: b.doc_count }));
  });

  return { data, count, newFilters };
};
