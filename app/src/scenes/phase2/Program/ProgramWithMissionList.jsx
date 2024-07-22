import React, { useCallback, useEffect } from "react";
import Img4 from "@/assets/observe.svg";
import styled from "styled-components";
import api from "@/services/api";
import { debounce } from "@/utils";
import { JVA_MISSION_DOMAINS } from "snu-lib";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { Col, CustomInput, Row } from "reactstrap";
import { Link, useHistory } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import Pagination from "@/components/nav/Pagination";
import MissionCard from "@/scenes/phase3/components/missionCard";
import { FAQ } from "../Home/components/FAQ";

const domainOptions = Object.entries(JVA_MISSION_DOMAINS).map(([key, value]) => ({ value: key, label: value }));

export default function ProgramWithMissionList({ program }) {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const publisherName = program?.publisherName;
  const [filters, setFilters] = React.useState({
    search: "",
    location: {
      lat: young?.location?.lat,
      lon: young?.location?.lon,
    },
    distance: 50,
    domain: "",
    publisherName,
  });

  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(20);
  const [sort, setSort] = React.useState("geo");
  const [data, setData] = React.useState({});

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

  const imgUrl = `https://snu-bucket-prod.cellar-c2.services.clever-cloud.com/programmes-engagement/${program.imageString}`;

  return (
    <div className="bg-white pb-12">
      <div
        style={{
          backgroundImage: `url(${imgUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
          zIndex: 1,
          overflow: "hidden",
        }}
        className="bg-gradient-to-b from-transparent to-gray-500 w-full h-48 pt-4">
        <header className="max-w-6xl mx-auto grid grid-cols-[10%_auto_10%] grid-rows-3">
          <div></div>
          <div className="flex flex-row items-end">
            <p className="w-fit mx-auto text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{decodeURIComponent(publisherName)}</p>
          </div>
          <div></div>
          <button onClick={() => history.goBack()} className="flex items-center gap-1">
            <HiArrowLeft className="text-xl text-white" />
          </button>
          <div>
            <h1 className="text-white text-center m-0text-4xl md:text-5xl font-bold">Trouvez un engagement</h1>
          </div>
        </header>
      </div>

      <div className="py-10 max-w-6xl mx-auto">
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
            <p className="text-center text-sm text-gray-600">Veuillez valider votre adresse pour trouver des missions près de chez vous.</p>
            <Link className="text-blue-600 cursor-pointer text-center" to="/account/general">
              Cliquez ici pour valider votre adresse
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
            <div className="px-3">
              {data?.hits.map((e) => (
                <MissionCard mission={e._source} key={e._id} image={Img4} />
              ))}
            </div>
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
      </div>

      <hr className="mt-[1rem] md:mt-[3rem] md:max-w-6xl mx-[1rem] md:mx-auto" />

      <section className="px-4 md:px-24 mt-12">
        <h2 className="text-center font-bold text2xl md:text-4xl m-0 mt-12">Questions fréquentes</h2>
        <FAQ />
      </section>
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
