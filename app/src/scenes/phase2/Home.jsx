import React, { useState, useEffect } from "react";
import EngagementSrc from "../../assets/engagement/engagement-home.png";
import api from "../../services/api";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import plausibleEvent from "../../services/plausible";
import { YOUNG_STATUS_PHASE2 } from "../../utils";
import { HiPlus, HiSearch } from "react-icons/hi";
import API from "../../services/api";
import { toastr } from "react-redux-toastr";
import { set } from "date-fns";

export default function HomePhase2() {
  const { young } = useSelector((state) => state.Auth);
  const [equivalences, setEquivalences] = useState([]);

  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, [young]);

  if (young?.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED) {
    return <div>todo</div>;
  }

  return (
    <div className="bg-white pt-8 md:pt-16">
      <header className="px-[1rem] md:px-[6rem]">
        <div className="mx-auto w-80">
          <img src={EngagementSrc} alt="engagement" />
        </div>
        <h1 className="mt-6 mx-auto text-center font-bold text-5xl max-w-xl leading-tight">Engagez-vous au service de la Nation&nbsp;!</h1>
        <div className="flex flex-col md:flex-row justify-center gap-4 my-6">
          <Link
            to="/mission"
            onClick={() => plausibleEvent("Phase 2/CTA - Realiser ma mission")}
            className="bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md px-3 py-2.5 text-center">
            <HiSearch className="inline-block mr-2 text-xl" />
            Trouver un engagement
          </Link>
          <Link to="/phase2/equivalence" className="border rounded-md px-3 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition-colors text-center">
            <HiPlus className="inline-block mr-2 text-xl" />
            Ajouter un engagement réalisé
          </Link>
        </div>
      </header>

      <hr className="my-12 max-w-7xl mx-auto" />

      <section className="px-4 md:px-24 bg-gray-50 h-64">
        <h2>Mes engagements</h2>
        <p>todo</p>
      </section>

      <section className=" mt-12 px-4 md:px-24">
        <p className="w-fit mx-auto text-xs font-medium text-blue-600 bg-blue-100 px-1 rounded">EXPLOREZ D'AUTRES POSSIBILITES</p>
        <h2 className="text-center font-bold text-4xl m-0 mt-2">Trouvez un engagement par vous-même</h2>

        <div className="mt-8 border rounded-xl p-3 max-w-4xl mx-auto">
          <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2">
            <div className="flex gap-4 items-center md:border-r border-b md:border-b-0 px-3 pb-[0.5rem] md:pb-0">
              <div className="rounded-full bg-blue-france-sun-113 flex justify-center w-6 h-6 flex-none">
                <p className="text-white text-sm">1</p>
              </div>
              <p>
                Candidatez à <strong>l'engagement de votre choix</strong> ci-dessous en toute autonomie
              </p>
            </div>
            <div className="flex gap-4 items-center px-3 pt-[0.5rem] md:p-0">
              <div className="rounded-full bg-blue-france-sun-113 flex justify-center w-6 h-6 flex-none">
                <p className="text-white text-sm">2</p>
              </div>
              <p>
                <strong>Une fois terminé</strong>, <Link className="underline underline-offset-2">ajoutez-le</Link> à vos engagements réalisés.
              </p>
            </div>
          </div>
        </div>

        <Programs />
      </section>

      <hr className="my-12 max-w-7xl mx-auto" />

      <section className="px-4 md:px-24 mt-12">
        <h2 className="text-center font-bold text-4xl m-0 mt-12">Questions fréquentes</h2>
        <p>lorem</p>
      </section>
    </div>
  );
}

function Programs() {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data, ok } = await API.get("/program/public/engagements");
        if (!ok) {
          toastr.error("Une erreur est survenue.");
          return;
        }
        setPrograms(data);
      } catch (e) {
        toastr.error("Une erreur est survenue.");
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="mt-12 max-w-7xl mx-auto grid grid-cols-3 border">
      {programs.map((program, index) => (
        <div key={index} className="border p-4">
          <h3>{program.name}</h3>
          <p>{program.description}</p>
        </div>
      ))}
    </div>
  );
}
