import api from "../../../../services/api";
import { COHESION_STAY_START } from "snu-lib";

export const buildQuery = async (route, selectedFilters, page = 0, filterArray, sort) => {
  const resAlternative = await api.post(route, {
    page,
    filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
      if (value.filter.length === 1 && value.filter[0] === "") return e;
      return { ...e, [key]: value.filter.map((e) => String(e)) };
    }, {}),
    sort: sort ? { field: sort.field, order: sort.order } : null,
  });

  const aggs = resAlternative.responses[1].aggregations;
  const data = resAlternative.responses[0].hits.hits.map((h) => ({ ...h._source, _id: h._id, sort: h?.sort }));
  const count = resAlternative.responses[0].hits.total.value;
  const newFilters = {};

  // map a travers les aggregations pour recuperer les filtres
  filterArray.map((f) => {
    if (f.customComponent) return;
    if (f.disabledBaseQuery) return;
    newFilters[f.name] = aggs[f.name].names.buckets.filter((b) => b.doc_count > 0).map((b) => ({ key: b.key, doc_count: b.doc_count }));

    // check for any transformData function
    if (f.transformData) {
      newFilters[f.name] = f.transformData(newFilters[f.name]);
    }
  });

  return { data, count, newFilters };
};

export const getURLParam = (urlParams, setParamData, filters) => {
  const localFilters = {};
  urlParams.forEach((value, key) => {
    if (key === "page") {
      const int = parseInt(value.split(",")[0]);
      setParamData((paramData) => {
        return { ...paramData, page: int - 1 };
      });
    } else {
      // on check si c'est un custom component
      const customComponent = filters.find((f) => f.name === key);
      if (customComponent?.getQuery) {
        localFilters[key] = { filter: value.split("~"), customComponentQuery: customComponent.getQuery(value.split("+")[0]) };
      } else {
        localFilters[key] = { filter: value.split("~") };
      }
    }
  });
  return localFilters;
};
export const currentFilterAsUrl = (filters, page, filterArray, defaultUrlParam) => {
  let selectedFilters = {};
  Object.keys(filters)?.forEach((key) => {
    if (!filterArray.find((f) => f.name === key)) return;
    if (filters[key]?.filter?.length > 0) selectedFilters[key] = filters[key];
  });
  const length = Object.keys(selectedFilters).length;
  let index = 0;
  let url = Object.keys(selectedFilters)?.reduce((acc, curr) => {
    if (curr === "searchbar" && selectedFilters[curr]?.filter?.length > 0 && selectedFilters[curr]?.filter[0].trim() === "") return acc;
    if (selectedFilters[curr]?.filter?.length > 0) {
      acc += `${curr}=${selectedFilters[curr]?.filter.join("~")}${index < length - 1 ? "&" : ""}`;
      // check if custom component
    } else if (selectedFilters[curr]?.filter?.value?.length > 0 && selectedFilters[curr]?.filter?.value[0]?.trim() !== "") {
      acc += `${curr}=${selectedFilters[curr]?.filter?.value.join("~")}${index < length - 1 ? "&" : ""}`;
    } else return acc;

    index++;
    return acc;
  }, "");

  // add default url
  if (defaultUrlParam) url = defaultUrlParam + (url !== "" ? "&" : "") + url;

  // add pagination to url
  url += `${url !== "" ? "&" : ""}page=${page + 1}`;
  return url;
};

export const saveTitle = (selectedFilters, filters) => {
  const object = Object.keys(selectedFilters)
    .map((key) => {
      if (key === "searchbar") {
        if (selectedFilters[key]?.filter?.length > 0 && selectedFilters[key]?.filter[0]?.trim() !== "") return selectedFilters[key]?.filter[0];
        return;
      }
      if (selectedFilters[key]?.filter?.length > 0) {
        if (!filters.find((f) => f.name === key)) return undefined;
        return filters.find((f) => f.name === key)?.title + " (" + selectedFilters[key].filter.length + ")";
      }
    })
    .filter((item) => item !== undefined);
  return object;
};

export function normalizeString(s) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const orderCohort = (cohorts) => {
  for (const cohort of cohorts) {
    if (Object.prototype.hasOwnProperty.call(COHESION_STAY_START, cohort.key)) {
      cohort.date = COHESION_STAY_START[cohort.key];
    } else {
      cohort.date = new Date(2000, 0, 1);
    }
  }
  cohorts.sort((a, b) => b.date - a.date);
  return cohorts;
};
