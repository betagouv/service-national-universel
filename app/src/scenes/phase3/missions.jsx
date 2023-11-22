import React, { useCallback, useEffect } from "react";
import Img4 from "../../assets/observe.svg";
import Img3 from "../../assets/left.svg";
import Img2 from "../../assets/right.svg";
import styled from "styled-components";
import api from "../../services/api";
import { debounce } from "../../utils";
import { JVA_MISSION_DOMAINS } from "snu-lib";
import { capture } from "../../sentry";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { Col, Container, CustomInput, Row } from "reactstrap";
import MissionCard from "./components/missionCard";
import Pagination from "../../components/nav/Pagination";
import { Link } from "react-router-dom";
import { HeroContainer } from "@/components/Content";

export default function MissionsComponent() {
  const young = useSelector((state) => state.Auth.young);
  const [filters, setFilters] = React.useState({
    search: "",
    location: {
      lat: young?.location?.lat,
      lon: young?.location?.lon,
    },
    distance: 50,
    domain: "",
  });
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);
  const [sort, setSort] = React.useState("geo");
  const [data, setData] = React.useState({});

  const domainOptions = Object.entries(JVA_MISSION_DOMAINS).map(([key, value]) => ({ value: key, label: value }));

  const updateOnFilterChange = useCallback(
    debounce(async (filters, page, size, sort, setData) => {
      try {
        if (!young) return;
        const res = await api.post("/elasticsearch/missionapi/search", { filters, page, size, sort });
        if (!res?.data) return toastr.error("Oups, une erreur est survenue lors de la recherche des missions");
        setData(res.data);
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la recherche des missions", e);
      }
    }, 250),
    [],
  );

  useEffect(() => {
    if (!young.location?.lat) return;
    updateOnFilterChange(filters, page, size, sort, setData);
  }, [filters, page, size, sort]);

  return (
    <HeroContainer>
      <Missions>
        <Heading>
          <p>TROUVEZ UNE MISSION DE BÉNÉVOLAT</p>
          <h1>Missions disponibles près de chez vous ou à distance</h1>
        </Heading>
        <Filters style={{ marginBottom: 20 }}>
          <SearchBox md={4}>
            <input
              type="text"
              placeholder="Recherche..."
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full text-sm p-2 border-gray-300 border-[1px] rounded-sm"
            />
          </SearchBox>
          <Col md={4}>
            <CustomInput type="select" id="dist" defaultValue="50" onChange={(e) => setFilters({ ...filters, distance: e.target.value })}>
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
            <CustomInput type="select" id="dist" defaultValue="" onChange={(e) => setFilters({ ...filters, domain: e.target.value })}>
              <option value="">Filtrer par domaines</option>
              {domainOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </CustomInput>
          </DomainsFilter>
        </Filters>

        {!young.location?.lat ? (
          <div className="flex flex-col gap-2 w-full justify-center items-center">
            <p className="text-center text-sm text-gray-600">Veuillez renseigner à nouveau votre adresse pour nous permettre de vous proposer des missions près de chez vous.</p>
            <Link className="text-blue-600 cursor-pointer text-center" to="/account/general">
              Cliquez ici pour mettre à jour votre adresse
            </Link>
          </div>
        ) : null}

        {data?.total ? (
          <>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <p>
                {data?.total.value} mission{data?.total.value > 1 ? "s" : ""}
              </p>
              <select name="selectedSort" onChange={(e) => setSort(e.target.value)}>
                <option value="geo" defaultValue>
                  La plus proche
                </option>
                <option value="recent">La plus récente</option>
              </select>
            </div>
            {data?.hits.map((e) => (
              <MissionCard mission={e._source} key={e._id} image={Img4} />
            ))}
            <Pagination
              currentPageNumber={page}
              setCurrentPageNumber={setPage}
              itemsCountTotal={data.total.value}
              itemsCountOnCurrentPage={data.hits.length}
              size={size}
              setSize={setSize}
            />
          </>
        ) : null}
      </Missions>
    </HeroContainer>
  );
}

const Filters = styled(Row)`
  > * {
    margin-bottom: 0.5rem;
  }
`;

const Missions = styled(Container)`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  @media (max-width: 1000px) {
    font-size: 1.5rem;
    padding: 10px 15px;
  }
  .info {
    flex: 1;
    text-align: center;
    font-size: 0.8rem;
    color: #767a83;
  }
  .pagination {
    display: flex;
    justify-content: flex-end;
    padding: 10px 25px;
    margin: 0;
    background: #fff;
    a {
      background: #f7fafc;
      color: #242526;
      padding: 3px 10px;
      font-size: 12px;
      margin: 0 5px;
    }
    a.active {
      font-weight: 700;
      /* background: #5245cc;
      color: #fff; */
    }
    a:first-child {
      background-image: url(${Img3});
    }
    a:last-child {
      background-image: url(${Img2});
    }
    a:first-child,
    a:last-child {
      font-size: 0;
      height: 24px;
      width: 30px;
      background-position: center;
      background-repeat: no-repeat;
      background-size: 8px;
    }
  }
`;

const Heading = styled.div`
  margin-bottom: 40px;
  h1 {
    margin-top: 25px;
    color: #161e2e;
    font-size: 2.5rem;
    font-weight: 700;
    @media (max-width: 1000px) {
      font-size: 1.3rem;
    }
  }
  p {
    color: #42389d;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 5px;
    @media (max-width: 1000px) {
      font-size: 0.8rem;
    }
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
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }
`;
