import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Link, useParams } from "react-router-dom";
import { fetchEquivalence, fetchEquivalenceFile, deleteEquivalence } from "../../engagement.repository";
import Loader from "@/components/Loader";
import useAuth from "@/services/useAuth";
import { HiChat, HiDownload, HiPaperClip, HiPencil } from "react-icons/hi";
import EngagementStatusBadge from "../../components/EquivalenceStatusBadge";
import CopyButton from "@/components/buttons/CopyButton";
import { EQUIVALENCE_STATUS } from "snu-lib";
import { toastr } from "react-redux-toastr";
import Container from "@/components/layout/Container";
import { HiTrash } from "react-icons/hi";
import ResponsiveModal from "@/components/modals/ResponsiveModal";

export default function Equivalence() {
  const { young } = useAuth();
  const { id } = useParams();
  const { data, isError, isPending } = useQuery({ queryKey: ["equivalence", id], queryFn: () => fetchEquivalence(young._id, id) });
  const [isModalOpen, setModalOpen] = useState(false);
  const history = useHistory();
  async function handleClick(fileName) {
    try {
      await fetchEquivalenceFile(young._id, fileName);
    } catch (e) {
      toastr.error("Une erreur s'est produite lors du téléchargement du fichier");
    }
  }

  const handleDeleteClick = () => {
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteEquivalence(young._id, data._id);
      toastr.success("L'équivalence a bien été supprimée");
      setModalOpen(false);
      history.push("/phase2/");
    } catch (e) {
      toastr.error("Une erreur s'est produite lors de la suppression de l'équivalence");
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
  };

  if (isPending) return <Loader />;
  if (isError) return <div>Erreur lors du chargement de l'équivalence</div>;

  const action = [EQUIVALENCE_STATUS.WAITING_CORRECTION, EQUIVALENCE_STATUS.WAITING_VERIFICATION].includes(data.status) ? (
    <>
      <Link to={`${data._id}/edit`} className="flex items-center justify-center w-full h-10 border px-3 bg-white rounded-lg text-sm text-gray-500 hover:bg-gray-50">
        <HiPencil className="text-lg mr-1 text-gray-400" />
        Modifier
      </Link>
      {/* {data.status === EQUIVALENCE_STATUS.WAITING_VERIFICATION && ( */}
      <button
        onClick={() => handleDeleteClick(data._id)}
        className="ml-2 flex items-center justify-center w-14 h-10 md:px-3 border bg-white rounded-lg text-sm text-gray-500 hover:bg-gray-50">
        <HiTrash className="text-lg text-gray-400" />
      </button>
      {/* )} */}
    </>
  ) : null;

  const title = data.type === "Autre" ? data.desc : data.type;

  return (
    <Container title={title} subtitle="Engagement ajouté" action={action} backlink="/phase2/mes-engagements">
      <ResponsiveModal
        isOpen={isModalOpen}
        title="Voulez-vous supprimer cet engagement ?"
        onConfirm={handleConfirmDelete}
        setOpen={setModalOpen}
        confirmText="Oui, supprimer"
        cancelText="Annuler"></ResponsiveModal>
      <div className="mt-[2rem] md:mt-0 max-w-3xl mx-auto pb-[6rem]">
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

          {data.desc ? (
            <>
              <p className="text-gray-500 mt-3">Engagement réalisé</p>
              <p>{data.desc}</p>
            </>
          ) : null}

          <p className="text-gray-500 mt-3">Structure d&apos;accueil</p>
          <p>{data.structureName}</p>

          <p className="text-gray-500 mt-3">Dates</p>
          <p>
            Du {new Date(data.startDate).toLocaleDateString("fr-FR")} au {new Date(data.endDate).toLocaleDateString("fr-FR")}
          </p>

          {data.missionDuration && data.type === "Autre" ? (
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
              <div key={fileName} className="md:flex justify-between">
                <div className="flex flex-row items-center gap-2">
                  <HiPaperClip className="text-lg text-blue-600" />
                  <p className="text-sm font-normal leading-5 text-gray-800">{fileName}</p>
                </div>
                <button onClick={() => handleClick(fileName)} className="mt-[0.75rem] md:mt-[0rem] w-full md:w-fit text-center border-[1px] bg-white p-2 text-sm rounded-lg">
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
    </Container>
  );
}
