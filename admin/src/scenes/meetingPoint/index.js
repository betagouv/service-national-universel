import React, { useState, useEffect, useRef } from "react";
import { ReactiveBase, MultiDropdownList, DataSearch } from "@appbaseio/reactivesearch";

import api from "../../services/api";
import { apiURL } from "../../config";
import { Filter, FilterRow, ResultTable, Table, Header, Title, MultiLine } from "../../components/list";
import Chevron from "../../components/Chevron";
import Badge from "../../components/Badge";
import ReactiveListComponent from "../../components/ReactiveListComponent";

const FILTERS = ["SEARCH", "CENTER", "DEPARTMENT", "BUS"];

export default () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const handleShowFilter = () => setFilterVisible(!filterVisible);
  const getDefaultQuery = () => {
    return { query: { match_all: {} } };
  };

  return (
    <div>
      <ReactiveBase url={`${apiURL}/es`} app="meetingpoint" headers={{ Authorization: `JWT ${api.getToken()}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
          <div style={{ flex: 2, position: "relative" }}>
            <Header>
              <div style={{ flex: 1 }}>
                <Title>Points de rassemblement</Title>
              </div>
            </Header>
            <Filter>
              <FilterRow visible>
                <DataSearch
                  defaultQuery={getDefaultQuery}
                  showIcon={false}
                  placeholder="Rechercher..."
                  componentId="SEARCH"
                  dataField={["centerCode", "departureAddress", "busExcelId"]}
                  react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                  style={{ flex: 1, marginRight: "1rem" }}
                  innerClass={{ input: "searchbox" }}
                  autosuggest={false}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Département"
                  componentId="DEPARTMENT"
                  dataField="departureDepartment.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "DEPARTMENT") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                />
                <Chevron color="#444" style={{ cursor: "pointer", transform: filterVisible && "rotate(180deg)" }} onClick={handleShowFilter} />
              </FilterRow>
              <FilterRow visible={filterVisible}>
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Centre"
                  componentId="CENTER"
                  dataField="centerCode.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "CENTER") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                />
                <MultiDropdownList
                  defaultQuery={getDefaultQuery}
                  className="dropdown-filter"
                  placeholder="Transport"
                  componentId="BUS"
                  dataField="busExcelId.keyword"
                  react={{ and: FILTERS.filter((e) => e !== "BUS") }}
                  title=""
                  URLParams={true}
                  sortBy="asc"
                  showSearch={true}
                  searchPlaceholder="Rechercher..."
                  size={1000}
                />
              </FilterRow>
            </Filter>
            <ResultTable>
              <ReactiveListComponent
                defaultQuery={getDefaultQuery}
                react={{ and: FILTERS }}
                render={({ data }) => (
                  <Table>
                    <thead>
                      <tr>
                        <th>Departement départ</th>
                        <th>Adresse</th>
                        <th>Centre</th>
                        <th>Transport</th>
                        <th>places dispo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => {
                        return <Hit key={hit._id} hit={hit} />;
                      })}
                    </tbody>
                  </Table>
                )}
              />
            </ResultTable>
          </div>
        </div>
      </ReactiveBase>
    </div>
  );
};

const Hit = ({ hit }) => {
  let mounted = useRef(true);
  const [bus, setBus] = useState();
  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get(`/bus/${hit.busId}`);
      if (!ok) return;
      if (data && mounted) setBus(data);
    })();
    return () => (mounted = false);
  }, [hit]);
  return (
    <tr>
      <td>{hit.departureDepartment}</td>
      <td>{hit.departureAddress}</td>
      <td>
        <a href={`/centre/${hit.centerId}`} target="_blank">
          {hit.centerCode}
        </a>
      </td>
      <td>{hit.busExcelId}</td>
      {bus && mounted ? (
        <td>
          <MultiLine>
            {bus.placesLeft === 0 ? <Badge text="Complet" /> : <h2>{bus.placesLeft} places disponibles</h2>}
            <p>sur {bus.capacity} places proposées</p>
          </MultiLine>
        </td>
      ) : (
        <td>chargement...</td>
      )}
    </tr>
  );
};
