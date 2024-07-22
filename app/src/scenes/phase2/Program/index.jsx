import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchProgram } from "../repo";
import Loader from "@/components/Loader";
import { useHistory } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { FAQ } from "../Home/components/FAQ";
import MissionList from "./MissionList";

export default function Program() {
  const { id } = useParams();
  const { isPending, error, data } = useQuery({ queryKey: ["program", id], queryFn: () => fetchProgram(id) });
  const history = useHistory();

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
        <header className="max-w-6xl mx-auto grid grid-cols-[10%_auto_10%] grid-rows-[33%_auto_33%] md:grid-rows-3 px-[1rem] md:px-[2.5rem] relative z-20">
          <button onClick={() => history.goBack()} className="flex items-center gap-1 row-start-1 md:row-start-2">
            <HiArrowLeft className="text-xl text-white" />
          </button>
          <div className="flex flex-row items-end row-start-1 col-start-2">
            <p className="w-fit mx-auto text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">{decodeURIComponent(data.name)}</p>
          </div>
          <div className="row-start-2 col-start-2">
            <h1 className="text-white text-center m-0 text-3xl md:text-5xl font-bold">Trouvez un engagement</h1>
          </div>
        </header>
      </div>

      {data.publisherName ? <MissionList publisherName={data.publisherName} /> : null}

      <hr className="mt-[1rem] md:mt-[3rem] md:max-w-6xl mx-[1rem] md:mx-auto" />

      <section className="px-4 md:px-24 mt-12">
        <h2 className="text-center font-bold text2xl md:text-4xl m-0 mt-12">Questions fréquentes</h2>
        <FAQ />
      </section>
    </div>
  );
}
