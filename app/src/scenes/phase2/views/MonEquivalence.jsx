import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { fetchEquivalence, fetchEquivalenceFile } from "../engagement.repository";
import Loader from "@/components/Loader";
import useAuth from "@/services/useAuth";
import { HiArrowLeft, HiChat, HiDownload, HiPaperClip, HiPencil } from "react-icons/hi";
import EngagementStatusBadge from "../components/EquivalenceStatusBadge";
import CopyButton from "@/components/buttons/CopyButton";
import { EQUIVALENCE_STATUS } from "snu-lib";
import { toastr } from "react-redux-toastr";
import Header from "../components/Header";

export default function Equivalence() {
  const { young } = useAuth();
  const { id } = useParams();
  const { data, isError, isPending } = useQuery({ queryKey: ["equivalence", id], queryFn: () => fetchEquivalence(young._id, id) });
  console.log("🚀 ~ Equivalence ~ data:", data);
  const history = useHistory();

  async function handleClick(fileName) {
    try {
      await fetchEquivalenceFile(young._id, fileName);
    } catch (e) {
      toastr.error("Une erreur s'est produite lors du téléchargement du fichier");
    }
  }

  if (isPending) return <Loader />;
  if (isError) return <div>Erreur lors du chargement de l'équivalence</div>;
  return (
    <div className="bg-white">
      <Header
        title={data.type === "Autre" ? data.desc : data.type}
        subtitle="AJOUT D'UN ENGAGEMENT REALISE"
        action={
          [EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.WAITING_VERIFICATION].includes(data.status) ? (
            <Link to={`${data._id}/edit`} className="w-full hover:bg-gray-50">
              <div className="w-full border px-2 py-1.5 bg-white rounded-lg text-sm text-gray-500 text-center">
                <HiPencil className="inline-block text-lg mr-1 text-gray-400 align-text-bottom" />
                Modifier
              </div>
            </Link>
          ) : null
        }
        backAction={
          <button onClick={() => history.goBack()} className="flex items-center gap-1">
            <HiArrowLeft className="text-2xl text-gray-400" />
          </button>
        }
      />

      <div className="mt-[2rem] md:mt-0 max-w-3xl mx-auto px-[1rem] pb-[6rem]">
        <h2 className="text-2xl md:text-3xl font-bold m-0">Statut</h2>
        <div className="mt-4 px-4 py-3 border rounded-xl w-full">
          <EngagementStatusBadge status={data.status} />
          <p className="mt-2 text-gray-500">Engagement ajouté le {new Date(data.createdAt).toLocaleDateString("fr-FR")}</p>
          {data.status === EQUIVALENCE_STATUS.WAITING_CORRECTION && (
            <div className="mt-3 bg-gray-100 rounded-lg p-3 flex gap-2 text-sm">
              <div>
                <HiChat className="text-xl" />
              </div>
              <div className="w-full">
                <p className="font-bold">Message de la part de votre référent&nbsp;:</p>
                <p className="mt-3">"{data.message}"</p>
                <div className="mt-3 w-full md:w-fit bg-blue-600 rounded-lg text-white hover:text-white hover:bg-blue-800 px-3 py-2.5">
                  <Link to={`${data._id}/edit`} className="text-white hover:text-white">
                    <HiPencil className="inline-block text-lg mr-2 text-white align-text-bottom" />
                    Corriger ma demande
                  </Link>
                </div>
              </div>
            </div>
          )}

          {data.status === EQUIVALENCE_STATUS.REFUSED && (
            <div className="mt-3 bg-gray-100 rounded-lg p-3 flex gap-2 text-sm">
              <div>
                <HiChat className="text-xl" />
              </div>
              <div className="w-full">
                <p className="font-bold">Motif du refus&nbsp;:</p>
                <p className="mt-3">"{data.message}"</p>
              </div>
            </div>
          )}
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
            data.files.map((fileName) => (
              <div key={fileName}>
                <div className="flex flex-row items-center gap-2">
                  <HiPaperClip className="text-lg text-blue-600" />
                  <p className="text-sm font-normal leading-5 text-gray-800">{fileName}</p>
                </div>
                <button onClick={() => handleClick(fileName)} className="mt-3 w-full text-center border-[1px] bg-white p-2 text-sm rounded-lg">
                  <HiDownload className="inline-block text-lg mr-1 text-gray-400 align-text-bottom" />
                  Télécharger
                </button>
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
