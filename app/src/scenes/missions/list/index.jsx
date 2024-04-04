import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import { capture } from "../../../sentry";
import { debounce } from "../../../utils";
import MissionFilters from "./components/MissionFilters";
import MissionList from "./components/MissionList";
import Loader from "../../../components/Loader";
import { HiOutlineAdjustments } from "react-icons/hi";
import useAuth from "@/services/useAuth";

export default function List() {
  const { young, isCLE } = useAuth();
  const [data, setData] = useState();
  const urlParams = new URLSearchParams(window.location.search);
  const isMilitaryPreparation = Boolean(urlParams.get("MILITARY_PREPARATION"));

  const [filters, setFilters] = useState({
    domains: [],
    distance: 50,
    location: young?.location || {},
    isMilitaryPreparation: isMilitaryPreparation || false,
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
        if (isCLE) filters.isMilitaryPreparation = "false";
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
    updateOnFilterChange(filters, page, size, sort, setData);
  }, [filters, page, size, sort]);

  return (
    <div className="bg-white p-[1rem] md:p-[3rem] md:m-10 md:pb-[2rem] md:rounded-xl md:shadow-xl">
      {/* BEGIN HEADER */}
      <div className="space-y-6">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800">Trouvez une mission d&apos;intérêt général</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm font-normal text-gray-700">
            Vous devez réaliser vos 84 heures de mission dans l&apos;année qui suit votre séjour de cohésion.{" "}
            <a
              className="font-medium underline hover:text-gray-700 hover:underline"
              href="https://support.snu.gouv.fr/base-de-connaissance/de-combien-de-temps-je-dispose-pour-realiser-ma-mig"
              target="_blank"
              rel="noreferrer">
              En savoir plus
            </a>
            .
            <br />
            Astuce : si les missions proposées ne correspondent pas à votre zone géographique, pensez à{" "}
            <Link className="font-medium underline hover:text-gray-700 hover:underline" to="/account">
              vérifier votre adresse
            </Link>
            .
          </p>
          <Link className="hidden md:block" to="/preferences">
            <div className="group flex items-center gap-1 rounded-[10px] border-[1px] border-blue-700 py-2.5 px-3 hover:bg-blue-700 hover:text-[#ffffff]">
              <HiOutlineAdjustments className="text-blue-700 group-hover:text-[#ffffff]" />
              <div className="flex-1 text-sm text-blue-700 group-hover:text-[#ffffff]">Renseigner mes préférences</div>
            </div>
          </Link>
        </div>
      </div>
      {/* END HEADER */}
      <MissionFilters filters={filters} setFilters={setFilters} />
      {data ? <MissionList data={data} location={filters.location} page={page} setPage={setPage} size={size} setSize={setSize} setSort={setSort} /> : <Loader />}
    </div>
  );
}
