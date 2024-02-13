import Img4 from "../../../assets/observe.svg";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import ArrowUpRight from "../../../assets/icons/ArrowUpRight";

import MissionCard from "../components/missionCard";
import api from "../../../services/api";
import ButtonLinkPrimary from "@/components/ui/buttons/ButtonLinkPrimary";
import EngagementCard from "@/scenes/preinscription/components/EngagementCard";

export default function WaitingRealisation() {
  const young = useSelector((state) => state.Auth.young) || {};
  const [programs, setPrograms] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get("/program/public/engagements");
      if (!ok) return toastr.error("Une erreur est survenue.");
      setPrograms(data);
    })();
    (async () => {
      if (!young.location?.lat) return;
      const filters = {
        location: {
          lat: young.location.lat,
          lon: young.location.lon,
        },
        distance: 0,
      };
      const res = await api.post("/elasticsearch/missionapi/search", { filters, page: 0, size: 3, sort: "geo" });
      if (!res?.data) return toastr.error("Oups, une erreur est survenue lors de la recherche des missions");
      setData(res.data);
    })();
  }, []);

  return (
    <div className="mb-4 pt-2 pb-4 sm:px-4 md:px-16 md:pb-6 md:pt-6 md:mx-6 md:mt-10 rounded-lg bg-white">
      <div className="mb-8">
        <h2 className="text-gray-900 text-2xl md:text-3xl font-bold mb-2">Les autres programmes d&apos;engagement</h2>
        <p className="text-gray-600 text-lg">Rejoignez plus de 100 000 jeunes français déjà engagés dans de grandes causes</p>
      </div>
      <div className="overflow-x-auto">
        <div className="flex flex-row gap-4 mb-4">
          {programs.slice(0, 3).map((p) => (
            <EngagementCard program={p} key={p.name} />
          ))}
        </div>
      </div>

      <ButtonLinkPrimary to="/les-programmes" className="flex w-full justify-center">
        Voir toutes les possibilités d'engagement
      </ButtonLinkPrimary>
      <hr className=" md:mt-24 h-px border-0 bg-gray-200" />
      <div className="mb-2">
        <h2 className="text-[#161e2e] text-4xl font-bold">Trouvez une mission de bénévolat ou de volontariat</h2>
        <p className="text-gray-500 text-xl mt-2">Plus de 30 000 missions disponibles pour poursuivre votre engagement</p>
      </div>
      <div className="mt-8 px-3">{data?.total ? data?.hits.map((e) => <MissionCard mission={e._source} key={e._id} image={Img4} />) : null}</div>
      <ButtonLinkPrimary to="/phase3/mission" className="flex w-full justify-center mb-8 md:mb-0">
        Rechercher une mission
      </ButtonLinkPrimary>
      <hr className="pb-8 mt-12 hidden md:block" />
      <div className="mb-2 flex flex-col md:flex-row md:space-x-5 px-1">
        <div className="flex mb-2 md:mb-0 md:w-1/2 cursor-pointer rounded-lg py-2 border-[1px] bg-white border-gray-200 hover:border-gray-300">
          <a
            href="https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1"
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-start justify-between gap-1 p-3">
            <div className="flex-1 font-bold text-gray-800">J’ai des questions sur la phase 2</div>
            <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
          </a>
        </div>
        <div className="flex md:w-1/2 mb-2 md:mb-0 cursor-pointer rounded-lg py-2 border-[1px] bg-white border-gray-200 hover:border-gray-300">
          <a
            href="https://support.snu.gouv.fr/base-de-connaissance/demander-la-reconnaissance-dun-engagement-deja-realise-1"
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-start justify-between gap-1 ml-0 p-3">
            <div className="flex-1 font-bold text-gray-800">J’ai des questions sur la reconnaissance d'engagement</div>
            <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
          </a>
        </div>
      </div>
    </div>
  );
}
