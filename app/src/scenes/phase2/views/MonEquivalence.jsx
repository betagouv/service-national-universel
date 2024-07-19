import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { fetchEquivalence } from "../repo";
import Loader from "@/components/Loader";
import useAuth from "@/services/useAuth";
import { HiArrowLeft, HiDownload, HiPaperClip, HiPencil } from "react-icons/hi";
import EngagementStatusBadge from "../components/EngagementStatusBadge";
import CopyButton from "@/components/buttons/CopyButton";
import { EQUIVALENCE_STATUS } from "snu-lib";

export default function Equivalence() {
  const { young } = useAuth();
  const { equivalenceId } = useParams();
  const { data, isError, isPending } = useQuery({ queryKey: ["equivalence", equivalenceId], queryFn: () => fetchEquivalence(young._id, equivalenceId) });
  const history = useHistory();

  if (isPending) return <Loader />;
  if (isError) return <div>Erreur lors du chargement de l'équivalence</div>;
  return (
    <div className="bg-white">
      <header className="max-w-6xl pt-[1rem] md:pt-[3rem] px-[1rem] md:px-[2rem] mx-auto md:grid md:grid-cols-[8rem_auto_8rem] gap-4">
        <div>
          <button onClick={() => history.goBack()} className="flex items-center gap-1">
            <HiArrowLeft className="text-xl text-gray-400" />
          </button>
        </div>
        <div>
          <p className="w-fit mx-auto text-xs font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">AJOUT D'UN ENGAGEMENT REALISE</p>
          <h1 className="mt-2 text-3xl md:text-5xl text-center font-bold md:leading-tight">{data.type === "Autre" ? data.desc : data.type}</h1>
        </div>
        <div className="mt-[1rem] md:mt-0">
          {[EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.WAITING_VERIFICATION].includes(data.status) ? (
            <Link to={`${data._id}/edit`}>
              <div className="w-full border-[1px] border-gray-400 px-2 py-1.5 bg-white rounded-lg text-sm text-gray-500 text-center">
                <HiPencil className="inline-block text-lg mr-1 text-gray-400 align-text-bottom" />
                Modifier
              </div>
            </Link>
          ) : null}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-[1rem] pb-[6rem]">
        <h2 className="text-2xl md:text-3xl font-bold">Statut</h2>
        <div className="mt-4 px-4 py-3 border rounded-xl w-full">
          <EngagementStatusBadge status={data.status} />
          <p className="mt-2 text-gray-500">Engagement ajouté le {new Date(data.createdAt).toLocaleDateString("fr-FR")}</p>
        </div>

        <h2 className="mt-[2rem] md:mt-[3rem] text-2xl md:text-3xl font-bold">Informations générales</h2>
        <div className="mt-4 px-4 py-3 border rounded-xl w-full">
          <p className="text-gray-500">Type d'engagement</p>
          <p>{data.type}</p>

          {data.sousType ? (
            <>
              <p className="text-gray-500 mt-3">Catégorie</p>
              <p>{data.sousType}</p>
            </>
          ) : null}

          <p className="text-gray-500 mt-3">Structure d&apos;accueil</p>
          <p>{data.structureName}</p>

          <p className="text-gray-500 mt-3">Dates</p>
          <p>
            Du {new Date(data.startDate).toLocaleDateString("fr-FR")} au {new Date(data.endDate).toLocaleDateString("fr-FR")}
          </p>

          {data.missionDuration ? (
            <>
              <p className="text-gray-500 mt-3">Durée</p>
              <p>{data.missionDuration} h</p>
            </>
          ) : null}

          <p className="text-gray-500 mt-3">Adresse</p>
          <p>{data.address}</p>

          <p className="text-gray-500 mt-3">Code postal</p>
          <p>{data.zip}</p>

          <p className="text-gray-500 mt-3">Ville</p>
          <p>{data.city}</p>
        </div>

        <h2 className="mt-[2rem] md:mt-[3rem] text-2xl md:text-3xl font-bold">Personne à contacter</h2>
        <div className="mt-4 p-3 border rounded-xl w-full flex items-center justify-between">
          <div>
            <p className="text-gray-500">{data.contactFullName}</p>
            <p>{data.contactEmail}</p>
          </div>
          <CopyButton string={data.contactEmail} />
        </div>

        <h2 className="mt-[2rem] md:mt-[3rem] text-2xl md:text-3xl font-bold">Document justificatif d&apos;engagement</h2>
        <div className="mt-4 p-3 border rounded-xl bg-gray-50">
          {data?.files?.length ? (
            data.files.map((file) => (
              <div key={file.url}>
                <div className="flex flex-row items-center gap-2">
                  <HiPaperClip className="text-lg text-blue-600" />
                  <p className="text-sm font-normal leading-5 text-gray-800">{file.fileName}</p>
                </div>
                <a href={decodeURI(file.url)} target="_blank" rel="noopener noreferrer">
                  <div className="mt-2 w-full text-center border-[1px] bg-white p-2 text-sm rounded-lg">
                    <HiDownload className="inline-block text-lg mr-1 text-gray-400 align-text-bottom" />
                    Télécharger
                  </div>
                </a>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Aucun document</p>
          )}
        </div>
      </div>
    </div>
  );
}
