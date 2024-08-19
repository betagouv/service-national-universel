import { toastr } from "react-redux-toastr";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";

export const buildQuery = async (route, selectedFilters, page = 0, filterArray, sort, size = 10) => {
  try {
    const resAlternative = await api.post(route, {
      page,
      filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
        if (value.filter.length === 1 && value.filter[0] === "") return e;
        return { ...e, [key]: value.filter.map((e) => String(e)) };
      }, {}),
      sort: sort ? { field: sort.field, order: sort.order } : null,
      size,
    });

    const aggs = resAlternative.responses[1].aggregations;
    const data = resAlternative.responses[0].hits.hits.map((h) => ({ ...h._source, _id: h._id, sort: h?.sort }));
    const count = resAlternative.responses[1].aggregations?.count?.total?.value || resAlternative.responses[0].hits?.total?.value || 0;
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
  } catch (e) {
    capture(e);
    toastr.error("Oups, une erreur est survenue lors du chargement des données, veuillez recharger la page.");
  }
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
  if (typeof s !== "string") {
    return "";
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const orderCohort = (cohorts) => {
  return cohorts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
};

export const transformExistingField = (data) => {
  const newData = [
    { key: "true", doc_count: 0 },
    { key: "false", doc_count: 0 },
  ];
  data.map((d) => {
    console.log(d);
    if (d.key === "N/A" || d.key === "") {
      newData.find((e) => e.key === "false").doc_count += d.doc_count;
    } else {
      newData.find((e) => e.key === "true").doc_count += d.doc_count;
    }
  });
  return newData;
};
