import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import { capture } from "../../../sentry";
import { debounce } from "../../../utils";
import MissionFilters from "./components/MissionFilters";
import MissionList from "./components/MissionList";
import Loader from "../../../components/Loader";
import { RiHeartFill } from "react-icons/ri";
import useAuth from "@/services/useAuth";
import Container from "@/components/layout/Container";
import plausibleEvent from "@/services/plausible";

export default function List() {
  const { young } = useAuth();
  const [data, setData] = useState();
  const urlParams = new URLSearchParams(window.location.search);
  const canDoMilitaryPreparation = young?.frenchNationality === "true";

  const [filters, setFilters] = useState({
    domains: [],
    distance: 50,
    location: young?.location || {},
    period: "",
    subPeriod: [],
    searchbar: "",
    fromDate: undefined,
    toDate: undefined,
    hebergement: false,
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sort, setSort] = useState("geo");

  const updateOnFilterChange = useCallback(
    debounce(async (filters, page, size, sort, setData) => {
      try {
        if (!filters.location?.lat || !filters.distance) return;
        if (filters.period === "CUSTOM") {
          if (filters.fromDate === "") delete filters.fromDate;
          if (filters.toDate === "") delete filters.toDate;
        }
        const res = await api.post("/elasticsearch/mission/young/search", { filters, page, size, sort });
        setData(res.data);
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la recherche des missions", e);
      }
    }, 250),
    [],
  );

  useEffect(() => {
    const isMilitaryPreparation = urlParams.get("MILITARY_PREPARATION");
    if (isMilitaryPreparation || !canDoMilitaryPreparation) {
      setFilters({ ...filters, isMilitaryPreparation: canDoMilitaryPreparation && isMilitaryPreparation });
    }
  }, []);

  useEffect(() => {
    updateOnFilterChange(filters, page, size, sort, setData);
  }, [filters, page, size, sort]);

  return (
    <Container title="Trouvez un engagement">
      <Link className="block" to="/phase2/mes-engagements?tab=settings" onClick={() => plausibleEvent("Phase2/Missions/CTA - Mes préférences")}>
        <p className="group flex justify-center items-center gap-1 text-center underline">
          <RiHeartFill className="text-[#111827] inline-block align-text-bottom mr-1" />
          Mes préférences
        </p>
      </Link>

      <div className="max-w-6xl mx-auto px-[1rem]">
        <MissionFilters filters={filters} setFilters={setFilters} />
        {data ? <MissionList data={data} location={filters.location} page={page} setPage={setPage} size={size} setSize={setSize} setSort={setSort} /> : <Loader />}
      </div>

      <div className="mt-[2rem] mx-auto md:max-w-6xl md:px-[1rem]">
        <div id="par-vous-meme" className="px-4 pt-8 pb-10 text-center bg-blue-france-sun-113 md:rounded-lg">
          <p className="text-4xl">🔍</p>
          <p className="text-white font-medium text-2xl md:text-3xl mt-3 text-center">Trouvez un engagement par vous-même</p>
          <p className="text-white font-light mt-2 text-center">Candidatez en autonomie à un programme d'engagement pour valider votre SNU.</p>
          <Link
            to="/phase2#sectionEngagement"
            onClick={() => plausibleEvent("Phase2/Missions/CTA - Comment ça marche")}
            className="text-white font-light underline underline-offset-2 hover:underline">
            <p className="mt-4">Comment ça marche ?</p>
          </Link>
        </div>
      </div>
    </Container>
  );
}
