import React from "react";
import ConfirmationModal from "../../../components/modals/ConfirmationModal";
import Warning from "../../../../../assets/icons/Warning";

function MeetingPointConfirmationModal({ modalMeetingPoint, setModalMeetingPoint, loading, chooseMeetingPoint, chooseGoAlone }) {
  return (
    <ConfirmationModal
      isOpen={modalMeetingPoint?.isOpen}
      loading={loading}
      icon={<Warning className="h-[36px] w-[36px] text-[#D1D5DB]" />}
      title={"Changement de PDR"}
      confirmText="Confirmer le changement"
      onCancel={() => setModalMeetingPoint({ isOpen: false, meetingPoint: null })}
      onConfirm={() => {
        if (modalMeetingPoint.meetingPoint) return chooseMeetingPoint(modalMeetingPoint.meetingPoint);
        return chooseGoAlone();
      }}>
      <div className="my-2 mt-[8px] flex  flex-col gap-2 text-center text-[14px] leading-[20px] text-gray-900">
        {modalMeetingPoint.meetingPoint ? (
          <>
            <div>Vous vous apprêtez à changer votre point de rassemblement, souhaitez-vous confirmer cette action ? </div>
            <div>
              Après avoir cliquer sur &apos;<i>Confirmer le changement</i>&apos;, nous vous invitons à télécharger votre convocation qui a été mise à jour.
            </div>
          </>
        ) : (
          <>
            <div> Vous vous apprêtez à choisir de vous rendre seul au centre, souhaitez-vous confirmer cette action ? </div>
            <div>Après avoir cliquer sur &apos;Confirmer le changement&apos;, nous vous invitons à télécharger votre convocation qui a été mise à jour.</div>
          </>
        )}
        {modalMeetingPoint.meetingPoint ? (
          <div>
            <div>Nouveau point de rassemblement :</div>
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
