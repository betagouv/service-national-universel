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

export const buildQuery = async (route, selectedFilters, page = 0, filterArray, sort) => {
  const resAlternative = await api.post(route, {
    page,
    filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
      return { ...e, [key]: value.filter };
    }, {}),
    sort: sort ? { field: sort.field, order: sort.order } : null,
  });

  const aggs = resAlternative.responses[1].aggregations;
  const data = resAlternative.responses[0].hits.hits.map((h) => ({ ...h._source, _id: h._id }));
  const count = resAlternative.responses[0].hits.total.value;
  const newFilters = {};

  // map a travers les aggregations pour recuperer les filtres
  filterArray.map((f) => {
    if (f.customComponent) return;
    if (f.disabledBaseQuery) return;
    console.log(f.name);
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
      acc += `${curr}=${selectedFilters[curr]?.filter.join(",")}${index < length - 1 ? "&" : ""}`;
      // check if custom component
    } else if (selectedFilters[curr]?.filter?.value?.length > 0 && selectedFilters[curr]?.filter?.value[0]?.trim() !== "") {
      acc += `${curr}=${selectedFilters[curr]?.filter?.value.join(",")}${index < length - 1 ? "&" : ""}`;
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
