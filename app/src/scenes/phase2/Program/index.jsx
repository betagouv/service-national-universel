import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchProgram } from "../repo";
import Loader from "@/components/Loader";
import { useHistory } from "react-router-dom";
import { HiArrowLeft, HiChevronDown } from "react-icons/hi";
import { FAQ } from "../Home/components/FAQ";
import MissionList from "./MissionList";

export default function Program() {
  const { id } = useParams();
  const { hash } = useLocation();
  const { isPending, error, data } = useQuery({ queryKey: ["program", id], queryFn: () => fetchProgram(id) });
  const history = useHistory();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [hash]);

  if (isPending) return <Loader />;

  if (error) return <div>Erreur lors du chargement du programme.</div>;

  const imgUrl = `https://snu-bucket-prod.cellar-c2.services.clever-cloud.com/programmes-engagement/${data.imageString}`;

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
        className="relative w-full h-48 pt-4">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800 z-10"></div>
        <header className="mx-auto grid grid-cols-[10%_auto_10%] grid-rows-[33%_auto_33%] md:grid-rows-3 px-[1rem] md:px-[2.5rem] relative z-20">
          <button onClick={() => history.goBack()} className="flex items-center gap-1 row-start-1 md:row-start-2">
            <HiArrowLeft className="text-xl text-white" />
          </button>
          <div className="flex flex-row items-end row-start-2 md:row-start-1 col-start-2">
            <p className="w-fit mx-auto text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded uppercase line-clamp-1">{data.name}</p>
          </div>
          <div className="row-start-3 md:row-start-2 col-span-3 md:col-span-1">
            <h1 className="text-white text-center m-0 text-3xl md:text-5xl font-bold">Trouvez un engagement</h1>
          </div>
        </header>
      </div>

      <div className="max-w-4xl mx-auto p-[1rem] md:p-[2.5rem]">
        {data.publisherName ? (
          <>
            <Link to="#tout-savoir" className="p-3 rounded-xl border bg-gray-50 block mb-10 font-bold">
              Tout savoir sur ce programme
              <HiChevronDown className="inline-block text-xl align-text-bottom ml-2" />
            </Link>
            <MissionList publisherName={data.publisherName} />
          </>
        ) : (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md py-2.5 text-center block mb-4">
            Candidater sur le site web
          </a>
        )}

        <section id="tout-savoir" className="mt-[1rem]">
          <h2 className="text-2xl font-bold mb-4">Tout savoir sur ce programme</h2>
          <p className="mb-4">{data.description}</p>
          <hr />
          <h2 className="text-xl font-semibold my-4">C'est pour ?</h2>
          <p className="mb-4">{data.descriptionFor}</p>
          <hr />
          <h2 className="text-xl font-semibold my-4">Est-ce indemnisé ?</h2>
          <p className="mb-4">{data.descriptionMoney}</p>
          <hr />
          <h2 className="text-xl font-semibold my-4">Quelle durée d'engagement ?</h2>
          <p className="mb-4">{data.descriptionDuration}</p>
        </section>

        <hr className="mt-[1rem] md:mt-[3rem]" />

        <section id="questions-frequentes" className="mt-[1rem] md:mt-[3rem]">
          <h2 className="text-center font-bold text2xl md:text-4xl m-0 mt-12">Questions fréquentes</h2>
          <FAQ />
        </section>
      </div>
    </div>
  );
}
