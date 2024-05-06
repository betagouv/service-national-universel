import React from "react";

import { canCreateOrUpdateCohesionCenter } from "@/utils";
import Trash from "@/assets/icons/Trash";

import ModalConfirmDelete from "../ModalConfirmDelete";

export default function OccupationCard({ placesLeft, placesTotal, canBeDeleted, user, handleSessionDelete, modalDelete, setModalDelete }) {
  let height = `h-0`;
  const occupationPercentage = ((placesTotal - placesLeft) * 100) / placesTotal;

  if (occupationPercentage === 0) height = "h-[10%]";
  else if (occupationPercentage < 20) height = "h-[20%]";
  else if (occupationPercentage < 30) height = "h-[30%]";
  else if (occupationPercentage < 40) height = "h-[40%]";
  else if (occupationPercentage < 50) height = "h-[50%]";
  else if (occupationPercentage < 60) height = "h-[60%]";
  else if (occupationPercentage < 70) height = "h-[70%]";
  else if (occupationPercentage < 80) height = "h-[80%]";
  else if (occupationPercentage < 100) height = "h-[90%]";
  else if (occupationPercentage >= 100) height = "h-[100%]";

  let bgColor = "bg-blue-800";
  if (occupationPercentage > 100) bgColor = "bg-red-500";
  if (isNaN(occupationPercentage)) return <></>;
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-4 px-8">
      <ModalConfirmDelete
        isOpen={modalDelete.isOpen}
        title={modalDelete.title}
        message={modalDelete.message}
        onCancel={() => setModalDelete({ ...modalDelete, isOpen: false })}
        onDelete={modalDelete.onDelete}
      />
      <div className="flex items-center justify-center gap-4">
        {/* barre */}
        {Math.floor(occupationPercentage) === 0 ? (
          <div className="flex h-28 w-9 flex-col items-center justify-center overflow-hidden rounded-lg bg-gray-200 text-xs font-bold">0%</div>
        ) : (
          <div className="flex h-28 w-9 flex-col justify-end overflow-hidden rounded-lg bg-gray-200">
            <div className={`flex w-9 items-center justify-center ${height} ${bgColor} rounded-lg text-xs font-bold text-white`}>{Math.floor(occupationPercentage)}%</div>
          </div>
        )}

        {/* nombres */}
        <div className="flex flex-col justify-around">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-6 w-2 rounded-full bg-blue-800" />
            <div>
              <div className="text-xs font-normal">Places occupées</div>
              <div className="text-base font-bold">{placesTotal - placesLeft}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-2 rounded-full bg-gray-200" />
            <div>
              <div className="text-xs font-normal">Places libres</div>
              <div className="text-base font-bold">{placesLeft}</div>
            </div>
          </div>
        </div>
      </div>
      {canCreateOrUpdateCohesionCenter(user) && (
        <div
          onClick={() => {
            canBeDeleted &&
              setModalDelete({
                isOpen: true,
                title: "Supprimer la session",
                message: "Êtes-vous sûr de vouloir supprimer cette session?",
                onDelete: handleSessionDelete,
              });
          }}
          className={`mt-3 flex w-full flex-row items-center justify-end gap-2 ${canBeDeleted ? "cursor-pointer" : "cursor-default"}`}>
          <Trash className={`${canBeDeleted ? "text-red-400" : "text-gray-400"}`} width={14} height={14} />
          <div className={`${canBeDeleted ? "text-gray-800" : "text-gray-500"} text-xs`}>Supprimer le séjour</div>
        </div>
      )}
    </div>
  );
}
