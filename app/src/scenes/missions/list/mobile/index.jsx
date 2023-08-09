import React, { useCallback, useEffect, useState } from "react";
import api from "../../../../services/api";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { capture } from "../../../../sentry";
import { debounce } from "../../../../utils";
import MissionFilters from "./components/MissionFilters";
import MissionList from "./components/MissionList";

export default function List() {
  const young = useSelector((state) => state.Auth.young);
  const [data, setData] = useState();
  const [filters, setFilters] = useState({
    domains: [],
    distance: 50,
    location: young?.location || {},
    isMilitaryPreparation: undefined,
    period: "",
    subPeriod: [],
    searchbar: "",
    fromDate: new Date(),
    toDate: undefined,
    hebergement: false,
  });
  const [page, setPage] = useState(0);

  const updateOnFilterChange = useCallback(
    debounce(async (filters, page, setData) => {
      try {
        if (!filters.location || !filters.distance) return;
        const res = await api.post("/elasticsearch/mission/find", { filters, page });
        setData(res.data);
      } catch (e) {
        capture(e);
        toastr.error("Oups, une erreur est survenue lors de la recherche des missions", e);
      }
    }, 250),
    [],
  );

  useEffect(() => {
    updateOnFilterChange(filters, page, setData);
  }, [filters, page]);

  return (
    <div className="flex">
      <div className="w-full rounded-lg bg-white pb-12">
        {/* BEGIN HEADER */}
        <div className="flex justify-between p-3">
          <div>
            <h1 className="mb-3 text-2xl font-bold text-gray-800">Trouvez une mission d&apos;intérêt général</h1>
            <div className="text-sm font-normal text-gray-700">
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
              <a className="font-medium underline hover:text-gray-700 hover:underline" href="/account" target="_blank" rel="noreferrer">
                vérifier votre adresse
              </a>
              .
            </div>
          </div>
        </div>
        {/* END HEADER */}
        <MissionFilters filters={filters} setFilters={setFilters} />
        {data ? <MissionList missions={data.hits} page={page} setPage={setPage} total={data.total.value} /> : null}
      </div>
    </div>
  );
}
