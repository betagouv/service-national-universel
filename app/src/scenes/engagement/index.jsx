import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { RiArrowLeftSLine } from "react-icons/ri";

import api from "../../services/api";
import Loader from "../../components/Loader";
import EngagementCard from "@/scenes/preinscription/components/EngagementCard";

export default function Index() {
  const [programs, setPrograms] = useState();
  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get("/program");
      if (!ok) return toastr.error("nope");
      setPrograms(data);
    })();
  }, []);
  if (!programs) return <Loader />;
  return (
    <>
      <div className="pt-2 mb-4 pb-4 sm:px-4 md:px-16 md:pb-6 md:pt-6 md:mx-6 md:mt-10 rounded-lg bg-white">
        <Link to="/autres-engagements">
          <button className="mt-4 mb-6 flex py-2 px-2 border rounded-lg text-xs leading-4 font-medium">
            <RiArrowLeftSLine className="mr-2 text-lg" />
            Retour
          </button>
        </Link>
        <div className="mb-8">
          <h2 className="text-gray-900 text-2xl md:text-3xl font-bold mb-2">Tous les autres programmes d&apos;engagement</h2>
          <p className="text-gray-600 text-lg">Rejoignez plus de 100 000 jeunes français déjà engagés dans de grandes causes</p>
        </div>
        <div className="flex gap-8 overflow-x-auto md:grid md:grid-cols-3">
          {programs.map((program, index) => (
            <EngagementCard program={program} key={index} />
          ))}
        </div>
      </div>
    </>
  );
}
