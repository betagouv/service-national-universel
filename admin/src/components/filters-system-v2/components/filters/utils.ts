import { toastr } from "react-redux-toastr";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import store from "@/redux/store";
import { Filter } from "../Filters";

// interface FilterValue {
//   filter: string[];
//   customComponentQuery?: any;
// }

interface SelectedFilters {
  [key: string]: Filter;
}

interface SortConfig {
  label?: string;
  field: string;
  order: string;
}

interface QueryResponse {
  data: any[];
  count: number;
  newFilters: Record<string, any[]>;
}

interface AggregationBucket {
  key: string;
  doc_count: number;
}

interface CohortData {
  key: string;
  dateStart?: string;
  doc_count: number;
}

export const buildQuery = async (
  route: string,
  selectedFilters: SelectedFilters,
  page: number = 0,
  filterArray: Filter[],
  sort: SortConfig | null,
  size: number = 10,
): Promise<QueryResponse | undefined> => {
  try {
    const resAlternative = await api.post(route, {
      page,
      filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
        if (value.filter?.length === 1 && value.filter[0] === "") return e;
        return { ...e, [key]: value.filter?.map((e) => String(e)) };
      }, {}),
      sort: sort ? { field: sort.field, order: sort.order } : null,
      size,
    });

    const aggs = resAlternative.responses[1].aggregations;
    const data = resAlternative.responses[0].hits.hits.map((h: any) => ({ ...h._source, _id: h._id, sort: h?.sort }));
    const count = resAlternative.responses[1].aggregations?.count?.total?.value || resAlternative.responses[0].hits?.total?.value || 0;
    const newFilters: Record<string, any[]> = {};

    // map a travers les aggregations pour recuperer les filtres
    filterArray.forEach((f) => {
      if (f.customComponent) return;
      if (f.disabledBaseQuery) return;
      newFilters[f.name!] = aggs[f.name!].names.buckets.filter((b: AggregationBucket) => b.doc_count > 0).map((b: AggregationBucket) => ({ key: b.key, doc_count: b.doc_count }));

      // check for any transformData function
      if (f.transformData) {
        newFilters[f.name!] = f.transformData(newFilters[f.name!]);
      }
    });

    return { data, count, newFilters };
  } catch (e) {
    capture(e);
    toastr.error("Oups, une erreur est survenue lors du chargement des données, veuillez recharger la page.", "");
    return;
  }
};

export const getURLParam = (urlParams: URLSearchParams, setParamData: (paramData: any) => void, filters: Filter[]): SelectedFilters => {
  const localFilters: SelectedFilters = {};
  urlParams.forEach((value, key) => {
    if (key === "page") {
      const int = parseInt(value.split(",")[0], 10);
      setParamData((paramData: any) => {
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

export const currentFilterAsUrl = (filters: SelectedFilters, page: number, filterArray: Filter[], defaultUrlParam?: string): string => {
  const selectedFilters: SelectedFilters = {};
  Object.keys(filters)?.forEach((key) => {
    if (!filterArray.find((f) => f.name === key)) return;
    if (filters[key]?.filter?.length) selectedFilters[key] = filters[key];
  });
  const length = Object.keys(selectedFilters).length;
  let index = 0;
  let url = Object.keys(selectedFilters)?.reduce((acc, curr) => {
    if (curr === "searchbar" && selectedFilters[curr]?.filter?.length && selectedFilters[curr]?.filter?.[0]?.trim() === "") return acc;
    if (selectedFilters[curr]?.filter?.length) {
      acc += `${curr}=${selectedFilters[curr]?.filter?.join("~")}${index < length - 1 ? "&" : ""}`;
      // check if custom component
      // @ts-ignore
    } else if (selectedFilters[curr]?.filter?.value?.length && selectedFilters[curr]?.filter?.value[0]?.trim() !== "") {
      // @ts-ignore
      acc += `${curr}=${selectedFilters[curr]?.filter?.value?.join("~")}${index < length - 1 ? "&" : ""}`;
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

export const saveTitle = (selectedFilters: SelectedFilters, filters: Filter[]): string[] => {
  const object = Object.keys(selectedFilters)
    .map((key) => {
      if (key === "searchbar") {
        if (selectedFilters[key]?.filter?.length && selectedFilters[key]?.filter?.[0]?.trim() !== "") return selectedFilters[key]?.filter?.[0];
        return;
      }
      if (selectedFilters[key]?.filter?.length) {
        if (!filters.find((f) => f.name === key)) return undefined;
        return filters.find((f) => f.name === key)?.title + " (" + selectedFilters[key].filter?.length + ")";
      }
    })
    .filter((item): item is string => item !== undefined);
  return object;
};

export function normalizeString(s: any): string {
  if (typeof s !== "string") {
    return "";
  }
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export const orderCohort = (cohorts: CohortData[]): CohortData[] => {
  const cohortList = store.getState().Cohorts;
  const enhancedCohorts = cohorts.map((cohort) => {
    const cohortData = cohortList.find((c: any) => c.name === cohort.key);
    return { ...cohort, dateStart: cohortData?.dateStart };
  });
  const sortedCohorts = enhancedCohorts.sort((a, b) => new Date(b.dateStart || "").getTime() - new Date(a.dateStart || "").getTime());
  return sortedCohorts;
};

export const transformExistingField = (data: AggregationBucket[]): AggregationBucket[] => {
  const newData: AggregationBucket[] = [
    { key: "true", doc_count: 0 },
    { key: "false", doc_count: 0 },
  ];
  data.forEach((d) => {
    if (d.key === "N/A" || d.key === "") {
      const falseEntry = newData.find((e) => e.key === "false");
      if (falseEntry) falseEntry.doc_count += d.doc_count;
    } else {
      const trueEntry = newData.find((e) => e.key === "true");
      if (trueEntry) trueEntry.doc_count += d.doc_count;
    }
  });
  return newData;
};

export const buildApiv2Query = (selectedFilters: SelectedFilters, fields: string[]) => {
  return {
    filters: Object.entries(selectedFilters).reduce(
      (acc, [key, value]) => {
        if (key === "searchbar") {
          return acc;
        }
        // @ts-ignore
        acc[key] = value.filter;
        return acc;
      },
      {} as Record<string, string | string[]>,
    ),
    fields,
    searchTerm: selectedFilters?.searchbar?.filter?.[0],
  };
};
