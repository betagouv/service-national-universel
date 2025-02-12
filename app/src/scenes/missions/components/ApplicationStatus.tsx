import ModalConfirm from "@/components/modals/ModalConfirm";
import ApplicationStatusBadge from "@/scenes/phase2/components/ApplicationStatusBadge";
import React, { useState } from "react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { MdOutlineContentCopy } from "react-icons/md";
import { APPLICATION_STATUS } from "snu-lib";
import AcceptButton from "./AcceptButton";
import DeclineButton from "./DeclineButton";
import { copyToClipboard } from "@/utils";
import { toastr } from "react-redux-toastr";
import useUpdateApplicationStatus from "@/scenes/phase2/lib/useUpdateApplicationStatus";

type CancelModal = {
  isOpen: boolean;
  onConfirm?: () => void;
  title?: string;
  message?: string;
};

export default function ApplicationStatus({ mission }) {
  const [cancelModal, setCancelModal] = useState<CancelModal>({ isOpen: false });
  const application = mission?.application;
  const tutor = mission?.tutor;
  const { mutate, isPending: loading } = useUpdateApplicationStatus(application._id);

  if (["WAITING_VALIDATION", "WAITING_VERIFICATION", "REFUSED", "CANCEL"].includes(application.status)) {
    return (
      <>
        <div className="flex flex-col items-center justify-center gap-4 lg:items-end">
          <div className="flex items-center gap-6">
            {["WAITING_VALIDATION", "WAITING_VERIFICATION"].includes(application.status) ? (
              <button
                className={`group flex items-center gap-1 ${loading ? "cursor-wait hover:scale-100" : "cursor-pointer hover:scale-105"}`}
                disabled={loading}
                onClick={() =>
                  setCancelModal({
                    isOpen: true,
                    onConfirm: () => mutate(APPLICATION_STATUS.CANCEL),
                    title: "Êtes-vous sûr ?",
                    message: "Vous vous apprêtez à annuler votre candidature. Cette action est irréversible, souhaitez-vous confirmer cette action ?",
                  })
                }>
                <IoMdInformationCircleOutline className={`h-4 w-4 ${loading ? "text-gray-400" : "text-gray-700"}`} />
                <div className={`text-xs font-normal leading-none underline ${loading ? "text-gray-400" : "text-gray-700"}`}>Annuler cette candidature</div>
              </button>
            ) : null}
            <ApplicationStatusBadge status={application.status} />
          </div>
          <div className="text-xs font-normal leading-none text-gray-500">Places restantes : {mission.placesLeft}</div>
        </div>
        <ModalConfirm
          isOpen={cancelModal?.isOpen}
          title={cancelModal?.title}
          message={cancelModal?.message}
          onCancel={() => setCancelModal({ isOpen: false })}
          onConfirm={async () => {
            if (cancelModal.onConfirm) {
              await cancelModal.onConfirm();
            }
            setCancelModal({ isOpen: false });
          }}
        />
      </>
    );
  }
  if (["IN_PROGRESS", "VALIDATED", "DONE", "ABANDON"].includes(application.status)) {
    return (
      <>
        <div className="flex flex-col items-center justify-center gap-4 lg:items-end">
          <div className="flex items-center gap-6">
            {["IN_PROGRESS", "VALIDATED"].includes(application.status) ? (
              <button
                className={`group flex items-center gap-1 ${loading ? "cursor-wait hover:scale-100" : "cursor-pointer hover:scale-105"}`}
                disabled={loading}
                onClick={() =>
                  setCancelModal({
                    isOpen: true,
                    onConfirm: () => mutate(APPLICATION_STATUS.ABANDON),
                    title: "Êtes-vous sûr ?",
                    message: "Vous vous apprêtez à abandonner cette mission. Cette action est irréversible, souhaitez-vous confirmer cette action ?",
                  })
                }>
                <IoMdInformationCircleOutline className={`h-4 w-4 ${loading ? "text-gray-400" : "text-gray-700"}`} />
                <div className={`text-xs font-normal leading-none underline ${loading ? "text-gray-400" : "text-gray-700"}`}>Abandonner la mission</div>
              </button>
            ) : null}
            <ApplicationStatusBadge status={application.status} />
          </div>
          {tutor ? (
            <div className="mb-4 flex gap-6 rounded-lg border border-gray-200 py-2 px-3">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-bold">Contacter mon tuteur</div>
                <div className="text-xs text-gray-600">
                  {tutor.firstName} {tutor.lastName} - {tutor.email}
                </div>
              </div>
              <MdOutlineContentCopy
                className="h-4 w-4 cursor-pointer text-gray-400 hover:text-blue-600"
                onClick={() => {
                  copyToClipboard(tutor.email);
                  toastr.info("L'email de votre tuteur a été copié dans le presse-papier", "");
                }}
              />
            </div>
          ) : null}
        </div>
        <ModalConfirm
          isOpen={cancelModal?.isOpen}
          title={cancelModal?.title}
          message={cancelModal?.message}
          onCancel={() => setCancelModal({ isOpen: false })}
          onConfirm={async () => {
            if (cancelModal.onConfirm) {
              await cancelModal?.onConfirm();
            }
            setCancelModal({ isOpen: false });
          }}
        />
      </>
    );
  }

  if (["WAITING_ACCEPTATION"].includes(application.status)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-center text-xs font-normal leading-none text-gray-500">
          Cette mission vous a été proposée <br /> par votre référent
        </div>
        <div className="flex items-center gap-2">
          <AcceptButton mission={mission} />
          <DeclineButton mission={mission} />
        </div>
        <div className="text-xs font-normal leading-none text-gray-500">Places restantes : {mission.placesLeft}</div>
      </div>
    );
  }
}
