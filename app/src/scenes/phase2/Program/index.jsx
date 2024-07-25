import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchProgram } from "../engagement.repository";
import Loader from "@/components/Loader";
import { useHistory } from "react-router-dom";
import { HiArrowLeft, HiExternalLink } from "react-icons/hi";
import MissionList from "./MissionList";
import Header from "../components/Header";

export default function Program() {
  const { id } = useParams();
  const { isPending, error, data } = useQuery({ queryKey: ["program", id], queryFn: () => fetchProgram(id) });
  const history = useHistory();

  if (isPending) return <Loader />;

  if (error) return <div>Erreur lors du chargement du programme.</div>;

  const imgSrc = `https://snu-bucket-prod.cellar-c2.services.clever-cloud.com/programmes-engagement/${data.imageString}`;

  return (
    <div className="bg-white pb-12">
      <Header
        title={data.name}
        subtitle="Trouvez un engagement"
        backAction={
          <button onClick={() => history.goBack()} className="flex items-center gap-1 row-start-1 md:row-start-2">
            <HiArrowLeft className="text-2xl text-white" />
          </button>
        }
        imgSrc={imgSrc}
      />

      <div className="max-w-4xl mx-auto px-[1rem] md:px-[2.5rem]">
        {data.publisherName ? null : (
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 bg-blue-600 text-white hover:bg-blue-800 transition-colors rounded-md py-2.5 text-center block mb-4">
            <HiExternalLink className="inline-block mr-2 text-xl align-text-bottom" />
            Candidater sur le site web
          </a>
        )}

        <ToutSavoir data={data} />

        {data.publisherName ? <MissionList publisherName={data.publisherName} /> : null}
      </div>
    </div>
  );
}

function ToutSavoir({ data }) {
  const [open, setOpen] = useState(!data.publisherName);

  return (
    <section id="tout-savoir" className="mt-4 rounded-xl border p-3">
      <div className="flex justify-between">
        <h2 className="m-0 text-2xl font-bold">Tout savoir sur ce programme</h2>
        {data.publisherName ? (
          <button onClick={() => setOpen(!open)} className="text-gray-600 text-sm underline underline-offset-2">
            {open ? "Réduire" : "Afficher"}
          </button>
        ) : null}
      </div>
      {open ? (
        <>
          {data.description && (
            <>
              <p className="my-4">{data.description}</p>
            </>
          )}
          {data.descriptionFor && (
            <>
              <hr />
              <h2 className="text-xl font-semibold my-4">C'est pour ?</h2>
              <p className="mb-4">{data.descriptionFor}</p>
            </>
          )}
          {data.descriptionMoney && (
            <>
              <hr />
              <h2 className="text-xl font-semibold my-4">Est-ce indemnisé ?</h2>
              <p className="mb-4">{data.descriptionMoney}</p>
            </>
          )}
          {data.descriptionDuration && (
            <>
              <hr />
              <h2 className="text-xl font-semibold my-4">Quelle durée d'engagement ?</h2>
              <p className="mb-4">{data.descriptionDuration}</p>
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
