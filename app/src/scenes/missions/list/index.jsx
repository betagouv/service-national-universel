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
    <>
      <div className="bg-white p-[1rem] md:p-[3rem] md:m-10 md:pb-[2rem] md:rounded-xl md:shadow-xl">
        {/* BEGIN HEADER */}
        <div className="space-y-6">
          <h1 className="text-2xl md:text-4xl text-center font-bold text-gray-800">Trouvez un Engagement</h1>
          <div className="flex items-center justify-center">
            <Link className="block" to="/preferences">
              <div className="group flex items-center gap-1 py-2.5 px-3">
                <RiHeartFill className="text-[#111827]" />
                <div className="flex-1 text-md leading-4 text-[#111827] underline">Mes préférences</div>
              </div>
            </Link>
          </div>
        </div>
        {/* END HEADER */}
        <MissionFilters filters={filters} setFilters={setFilters} />
        {data ? <MissionList data={data} location={filters.location} page={page} setPage={setPage} size={size} setSize={setSize} setSort={setSort} /> : <Loader />}
      </div>
      <div className="px-4 py-1 flex flex-col justify-center items-center h-[300px] bg-[#000091] w-full">
        <p className="text-4xl">🔍</p>
        <p className="uppercase px-2 bg-[#E8EDFF] text-[#0063CB] font-bold text-xs leading-5 w-fit rounded-md mt-4 text-center">Vous ne trouvez pas d'engagement ?</p>
        <h1 className="text-white font-medium text-xl md:text-3xl mt-2 text-center">Touvez un engagement par vous même</h1>
        <p className="text-white text-xs font-light mt-1 text-center">Candidatez en autonomie à un programme d'engagement pour valider votre SNU.</p>
        <Link className="text-white text-xs font-light mt-4 underline" to="/phase2#sectionEngagement">
          Comment ça marche ?
        </Link>
      </div>
    </>
  );
}
