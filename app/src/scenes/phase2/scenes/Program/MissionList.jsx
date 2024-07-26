import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@uidotdev/usehooks";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { fetchMissionsFromApiEngagement } from "../../engagement.repository";
import Loader from "@/components/Loader";
import { Col, CustomInput, Row } from "reactstrap";
import { JvaDomainOptions } from "../../engagement.utils";
import MissionCard from "@/scenes/phase3/components/missionCard";
import Pagination from "@/components/nav/Pagination";
import Img4 from "@/assets/observe.svg";
import styled from "styled-components";

export default function MissionList({ publisherName }) {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();

  const params = new URLSearchParams(window.location.search);
  const { page, size, sort, distance, domain } = Object.fromEntries(params);
  function setParams(label, value) {
    params.set(label, value);
    history.replace({ search: params.toString() });
  }

  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, 500);

  const filters = {
    search: debouncedSearch,
    location: {
      lat: young?.location?.lat,
      lon: young?.location?.lon,
    },
    distance: distance || 50,
    domain: domain || "",
    page: page || 0,
    size: size || 20,
    sort: sort || "geo",
    publisherName,
  };

  const { data, isError, isPending } = useQuery({
    queryKey: ["missions", filters],
    queryFn: () => fetchMissionsFromApiEngagement(filters, page, size, sort),
    enabled: !!young.location?.lat,
  });

  return (
    <div className="mt-4 mb-12">
      <Filters style={{ marginBottom: 20 }}>
        <SearchBox md={4}>
          <input
            type="text"
            placeholder="Recherche..."
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            className="w-full text-sm p-2 border-gray-300 border-[1px] rounded-sm"
          />
        </SearchBox>
        <Col md={4}>
          <CustomInput type="select" id="dist" defaultValue="50" onChange={(e) => setParams("distance", e.target.value)} value={distance}>
            <option value="null" disabled>
              Rayon de recherche maximum
            </option>
            <option value={2}>Distance max. 2km</option>
            <option value={5}>Distance max. 5km</option>
            <option value={10}>Distance max. 10km</option>
            <option value={20}>Distance max. 20km</option>
            <option value={50}>Distance max. 50km</option>
            <option value={100}>Distance max. 100km</option>
            <option value={0}>Pas de limite de distance</option>
          </CustomInput>
        </Col>
        <DomainsFilter md={4}>
          <CustomInput type="select" id="dist" defaultValue="" onChange={(e) => setParams("domain", e.target.value)} value={domain}>
            <option value="">Filtrer par domaines</option>
            {JvaDomainOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </CustomInput>
        </DomainsFilter>
      </Filters>

      {!young.location?.lat ? (
        <div className="flex flex-col gap-2 w-full justify-center items-center">
          <p className="text-center text-sm text-gray-600">Veuillez valider votre adresse pour trouver des missions près de chez vous.</p>
          <Link className="text-blue-600 cursor-pointer text-center" to="/account/general">
            Cliquez ici pour valider votre adresse
          </Link>
        </div>
      ) : null}

      {isPending ? (
        <Loader />
      ) : isError ? (
        <div className="text-center text-gray-500">Erreur lors du chargement des missions</div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <p>
              {data?.total.value} mission{data?.total.value > 1 ? "s" : ""}
            </p>
            <select name="selectedSort" onChange={(e) => setParams("sort", e.target.value)} value={sort}>
              <option value="geo" defaultValue>
                La plus proche
              </option>
              <option value="recent">La plus récente</option>
            </select>
          </div>
          <div className="px-3">
            {data?.hits.map((e) => (
              <MissionCard mission={e._source} key={e._id} image={Img4} />
            ))}
          </div>
          <Pagination
            currentPageNumber={page || 0}
            setCurrentPageNumber={() => setParams("page", page)}
            itemsCountTotal={data.total.value}
            itemsCountOnCurrentPage={data.hits.length}
            size={size || 20}
            setSize={(e) => setParams("size", e)}
          />
        </>
      )}
    </div>
  );
}

const Filters = styled(Row)`
  > * {
    margin-bottom: 0.5rem;
  }
`;

const SearchBox = styled(Col)`
  input {
    height: auto;
    background-color: transparent;
  }
  .search-icon {
    position: relative;
    top: -7px;
    height: 14px;
    path {
      fill: #767a83;
    }
  }
`;

const DomainsFilter = styled(Col)`
  button {
    width: 100%;
    height: auto;
    min-height: 0;
    padding: 8px 12px;
    font-size: 16px;
    font-weight: 400;
    color: #495057;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    transition:
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;
  }
`;
