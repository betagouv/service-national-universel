import { ES_NO_LIMIT } from "snu-lib";
import api from "../../../../services/api";

/* 

  3 GRANDS cas de filtres : 

  - Filtre simple ex : 
  { 
    title: "Statut", 
    name: "statut", 
    datafield: "status.keyword", 
    parentGroup: "Ligne de Bus", 
    missingLabel: "Non renseignée", 
    translate: translate,
    defaultValue: ["value par défaut 1", "value par défaut 2", ...]
    isSingle: true/false (si true, le filtre ne peut avoir qu'une seule valeur)
    allowEmpty: true/false (si false, le filtre ne peut pas être vide, true par défaut)
  },
  - Filtre avec custom query ex : 
  { 
    title: "Type de mission", 
    name: "type", 
    datafield: "type.keyword", 
    parentGroup: "Ligne de Bus", m
    issingLabel: "Non renseignée", 
    customQuery: (value) => customQuery(value), 
    translate: translate 
  },

  transformData: prend en paramètre { key: <string>, doc_count: <number> } et doit retourner { key: <string>, doc_count: <number> }
  customQuery: prend en paramètre Array<string> et doit retourner { query: <object> } (query ES)


  - Filtre avec custom component ex : 
  { 
    title: "Type de mission", 
    name: "type", datafield: "type.keyword", 
    parentGroup: "Ligne de Bus",
    missingLabel: "Non renseignée", 
    customComponent: (setQuery, filter) => <CustomComponent setQuery={setQuery} value={filter} />,
    getQuery: (value) => getQuery(value), translate: translate,
  },

  Pour un custom component les querys sont gérées dans le composant lui même.
  (voir exemple sur src/components/filters-system/components/filters/custom-components/)

  /!\
  Un custom component doit avoir/exporter : 
    - une fonction getQuery
    - le composent lui même
    
  - Query vers ES pour récupérer les données + aggregations
      const buildQuery = async (esId, selectedFilters, page, size, defaultQuery = null, filterArray, searchBarObject, sortSelected)
        esId: id de l'index elastic
        selectedFilters: filtres selectionnés par l'utilisateur
        page: page actuelle (pour la pagination)
        size: nombre d'éléments par page
        defaultQuery: query par défaut
        filterArray: tableau des filtres définis dans le composant père
        searchBarObject: objet de la searchBar
        sortSelected: tri sélectionné

  - Récupérer les filtres depuis l'URL --> return object de filtres
      const getURLParam = (urlParams, setPage, filters)
        urlParams: paramètres de l'url
        setPage: fonction pour changer la page
        filters: tableau des filtres définis dans le composant principal

  - Stocker les filtres dans l'URL --> return URL
      const currentFilterAsUrl = (selectedFilters, page)
        selectedFilters: filtres selectionnés par l'utilisateur
        page: page actuelle (pour la pagination)

*/

export const buildBody = (selectedFilters, page, size, defaultQuery, filterArray, searchBarObject = null, sortSelected = null) => {
  let query = structuredClone(defaultQuery.query);
  let bodyQuery = {
    query: query,
    aggs: {},
    size: size,
    from: size * page,
    sort: sortSelected ? [{ [sortSelected.dataField]: { order: sortSelected.sortBy } }] : [{ createdAt: { order: "desc" } }],
    track_total_hits: true,
  };

  //apply filters to query
  if (selectedFilters && Object.keys(selectedFilters).length) {
    // ajouts des bases dans les querys
    if (!bodyQuery.query?.bool) bodyQuery.query.bool = { must: [], filter: [] };
    if (!bodyQuery.query.bool?.fitler) bodyQuery.query.bool.filter = [];
    if (!bodyQuery.query.bool?.must) bodyQuery.query.bool.must = [];
    if (!bodyQuery.query.bool?.should) bodyQuery.query.bool.should = [];

    Object.keys(selectedFilters).forEach((key) => {
      if (key === "searchbar") return;
      const currentFilter = filterArray.find((f) => f.name === key);
      if (currentFilter.disabledBaseQuery) return;
      if (currentFilter.customQuery) {
        // on a une custom query
        const currentQuery = currentFilter.customQuery(selectedFilters[key].filter).query;
        if (currentQuery) {
          // fonction qui va ajouter la query à la query principale
          bodyQuery.query = setPropertyToObject(currentQuery, bodyQuery.query);
        }
      } else if (currentFilter.customComponent) {
        const currentQuery = selectedFilters[key].customComponentQuery?.query?.query;
        if (currentQuery) {
          bodyQuery.query = setPropertyToObject(currentQuery, bodyQuery.query);
        }
      } else if (selectedFilters[key].filter.length > 0) {
        let datafield = currentFilter.datafield;
        // non renseigné
        if (selectedFilters[key].filter.includes("N/A")) {
          const filterWithoutNR = selectedFilters[key].filter.filter((e) => e !== "N/A");
          bodyQuery.query.bool.filter.push({
            bool: {
              should: [{ bool: { must_not: { exists: { field: datafield } } } }, { terms: { [datafield]: filterWithoutNR } }],
            },
          });
        } else {
          bodyQuery.query.bool.must.push({ terms: { [datafield]: selectedFilters[key].filter } });
        }
      }
    });
  }

  // query sur la searchBar
  if (selectedFilters?.searchbar?.filter[0] && selectedFilters?.searchbar?.filter[0]?.trim() !== "") {
    bodyQuery.query.bool.must.push({
      multi_match: { query: selectedFilters?.searchbar?.filter[0], fields: searchBarObject.datafield, type: "best_fields", operator: "or", fuzziness: 2 },
    });
  }

  return bodyQuery;
};

const buildAggs = (filterArray, selectedFilters, searchBarObject, defaultQuery) => {
  let aggsQuery = structuredClone(defaultQuery.query);
  let bodyAggs = {
    query: aggsQuery,
    aggs: {},
    size: 0,
    track_total_hits: true,
  };
  //ajouter les aggregations pour count
  filterArray.map((f) => {
    const currentFilter = filterArray.find((e) => f.name === e.name);
    if (currentFilter.disabledBaseQuery) return;
    if (currentFilter.customComponent) return;
    if (currentFilter.datafield.includes(".keyword")) {
      bodyAggs.aggs[f.name] = {
        filter: { ...getAggsFilters(f.name, selectedFilters, searchBarObject, bodyAggs, filterArray) },
        aggs: {
          names: { terms: { field: filterArray.find((e) => f.name === e.name).datafield, missing: "N/A", size: ES_NO_LIMIT } },
        },
      };
    } else {
      bodyAggs.aggs[f.name] = {
        filter: { ...getAggsFilters(f.name, selectedFilters, searchBarObject, bodyAggs, filterArray) },
        aggs: {
          names: {
            histogram: { field: filterArray.find((e) => f.name === e.name).datafield, interval: 1, min_doc_count: 1 },
          },
        },
      };
    }
  });
  return bodyAggs;
};

export const buildQuery = async (esId, selectedFilters, page = 0, size, defaultQuery = null, filterArray, searchBarObject, sortSelected) => {
  const bodyQuery = buildBody(selectedFilters, page, size, defaultQuery, filterArray, searchBarObject, sortSelected);
  const bodyAggs = buildAggs(filterArray, selectedFilters, searchBarObject, defaultQuery);

  const resAggs = await api.esQuery(esId, bodyAggs);
  if (!resAggs || !resAggs.responses || !resAggs.responses[0]) return;

  const resQuery = await api.esQuery(esId, bodyQuery);
  if (!resAggs || !resAggs.responses || !resAggs.responses[0]) return;

  const aggs = resAggs.responses[0].aggregations;
  const data = resQuery.responses[0].hits.hits.map((h) => ({ ...h._source, _id: h._id }));
  const count = resQuery.responses[0].hits.total.value;
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
        localFilters[key] = { filter: value.split(","), customComponentQuery: customComponent.getQuery(value.split(",")[0]) };
      } else {
        localFilters[key] = { filter: value.split(",") };
      }
    }
  });
  return localFilters;
};
export const currentFilterAsUrl = (selectedFilters, page) => {
  const length = Object.keys(selectedFilters).length;
  let index = 0;
  let url = Object.keys(selectedFilters)?.reduce((acc, curr) => {
    if (curr === "searchbar" && selectedFilters[curr]?.filter?.length > 0 && selectedFilters[curr]?.filter[0].trim() === "") return acc;
    if (selectedFilters[curr]?.filter?.length > 0) {
      acc += `${curr}=${selectedFilters[curr]?.filter.join(",")}${index < length - 1 ? "&" : ""}`;
      // check if custom component
    } else if (selectedFilters[curr]?.filter?.value?.length > 0 && selectedFilters[curr]?.filter?.value[0]?.trim() !== "") {
      acc += `${curr}=${selectedFilters[curr]?.filter?.value.join(",")}${index < length - 1 ? "&" : ""}`;
    } else return acc;

    index++;
    return acc;
  }, "");
  // add pagination to url
  url += `&page=${page + 1}`;
  return url;
};

const getAggsFilters = (name, selectedFilters, searchBarObject, bodyAggs, filterArray) => {
  let aggregfiltersObject = {
    bool: {
      must: [],
      filter: [],
    },
  };
  if (selectedFilters?.searchbar?.filter[0] && selectedFilters?.searchbar?.filter[0]?.trim() !== "") {
    aggregfiltersObject.bool.must.push({
      multi_match: { query: selectedFilters?.searchbar?.filter[0], fields: searchBarObject.datafield, type: "best_fields", operator: "or", fuzziness: 2 },
    });
  }

  if (!bodyAggs.query?.bool) bodyAggs.query.bool = { must: [], filter: [] };
  if (!bodyAggs.query.bool?.fitler) bodyAggs.query.bool.filter = [];
  if (!bodyAggs.query.bool?.must) bodyAggs.query.bool.must = [];

  Object.keys(selectedFilters).map((key) => {
    if (selectedFilters.customComponentQuery) return;

    if (key === "searchbar") return;
    if (key === name) return;

    const currentFilter = filterArray.find((f) => f.name === key);
    if (currentFilter.disabledBaseQuery) return;

    // check pour une customQuery
    if (currentFilter.customQuery) {
      const currentQuery = currentFilter.customQuery(selectedFilters[key].filter).query;
      aggregfiltersObject = setPropertyToObject(currentQuery, aggregfiltersObject);
    } else if (selectedFilters[key].filter.length > 0) {
      let datafield = currentFilter.datafield;
      if (selectedFilters[key].customComponentQuery) {
        aggregfiltersObject = setPropertyToObject(selectedFilters[key].customComponentQuery.query.query, aggregfiltersObject);
      } else {
        // deal with missingLabel
        if (selectedFilters[key].filter.includes("N/A")) {
          const filterWithoutNR = selectedFilters[key].filter.filter((e) => e !== "N/A");
          aggregfiltersObject.bool.filter.push({
            bool: {
              should: [{ bool: { must_not: { exists: { field: datafield } } } }, { terms: { [datafield]: filterWithoutNR } }],
            },
          });
        } else {
          aggregfiltersObject.bool.must.push({ terms: { [datafield]: selectedFilters[key].filter } });
        }
      }
    }
  });
  return aggregfiltersObject;
};

const setPropertyToObject = (currentQuery, object) => {
  Object.keys(currentQuery?.bool).forEach((key) => {
    if (object?.bool[key]) {
      object.bool[key] = object.bool[key].concat(currentQuery.bool[key]);
    } else {
      object.bool[key] = currentQuery.bool[key];
    }
  });
  return object;
};

export const saveTitle = (selectedFilters, filters) => {
  const object = Object.keys(selectedFilters)
    .map((key) => {
      if (key === "searchbar") {
        if (selectedFilters[key]?.filter?.length > 0 && selectedFilters[key]?.filter[0]?.trim() !== "") return selectedFilters[key]?.filter[0];
        return;
      }
      if (selectedFilters[key]?.filter?.length > 0) {
        return filters.find((f) => f.name === key)?.title + " (" + selectedFilters[key].filter.length + ")";
      }
    })
    .filter((item) => item !== undefined);
  return object;
};
