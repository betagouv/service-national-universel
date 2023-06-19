import React from "react";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import Warning from "../../../../../assets/icons/Warning";
import { useSelector } from "react-redux";

function MeetingPointConfirmationModal({ modalMeetingPoint, setModalMeetingPoint, loading, chooseMeetingPoint, chooseGoAlone }) {
  const young = useSelector((state) => state.Auth.young);
  const text = () => {
    if (modalMeetingPoint.meetingPoint && !young.meetingPointId) {
      return "Vous vous apprêtez à choisir un point de rassemblement, souhaitez-vous confirmer cette action ?";
    }
    if (modalMeetingPoint.meetingPoint && young.meetingPointId) {
      return "Vous vous apprêtez à changer de point de rassemblement, souhaitez-vous confirmer cette action ?";
    }
    return "Vous vous apprêtez à choisir de vous rendre seul au centre, souhaitez-vous confirmer cette action ?";
  };

  return (
    <ConfirmationModal
      isOpen={modalMeetingPoint?.isOpen}
      loading={loading}
      icon={<Warning className="h-[36px] w-[36px] text-[#D1D5DB]" />}
      title={young.meetingPointId ? "Changement de PDR" : "Choix du PDR"}
      confirmText="Confirmer le changement"
      onCancel={() => setModalMeetingPoint({ isOpen: false, meetingPoint: null })}
      onConfirm={() => {
        if (modalMeetingPoint.meetingPoint) return chooseMeetingPoint(modalMeetingPoint.meetingPoint);
        return chooseGoAlone();
      }}>
      <div className="my-2 mt-[8px] flex flex-col gap-2 text-center text-sm leading-5 text-gray-800">
        <p>{text()}</p>
        <p>
          Après avoir cliqué sur &apos;<i>Confirmer le changement</i>&apos;, nous vous invitons à télécharger votre convocation qui a été mise à jour.
        </p>
        {modalMeetingPoint.meetingPoint ? (
          <div>
            <p>{young.meetingPointId ? "Nouveau point de rassemblement" : "Point de rassemblement choisi"}</p>
            <div className="text-[#6B7280]">{modalMeetingPoint.meetingPoint.name + ", " + addressOf(modalMeetingPoint.meetingPoint)} </div>
          </div>
        ) : null}
      </div>
    </ConfirmationModal>
  );
}

function addressOf(mp) {
  if (mp) {
    return mp.address + " " + mp.zip + " " + mp.city;
  } else {
    return null;
  }
}

export default MeetingPointConfirmationModal;
