import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EngagementCard from "./EngagementCard";
import { toastr } from "react-redux-toastr";
import API from "@/services/api";

export default function EngagementPrograms() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, ok } = await API.get("/program/public/engagements");
      if (!ok) return toastr.error("Une erreur est survenue.");
      setPrograms(data);
    })();
  }, []);

  return (
    <>
      <h2 className="my-4 text-xl font-bold">Découvrez d’autres formes d’engagement</h2>
      <div className="flex gap-8 overflow-x-auto md:grid md:grid-cols-2">
        {programs.slice(0, 4).map((program) => (
          <div className="w-72 flex-none md:w-full" key={program._id}>
            <EngagementCard program={program} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Link
          className="mx-auto my-4 w-full border-[1px] border-blue-france-sun-113 p-2 text-center text-blue-france-sun-113 hover:border-blue-france-sun-113-hover hover:text-blue-france-sun-113-hover md:w-96 underline-none"
          to="/public-engagements">
          Voir plus de formes d’engagement
        </Link>
      </div>
    </>
  );
}
