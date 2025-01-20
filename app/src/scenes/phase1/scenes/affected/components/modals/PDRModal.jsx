import Close from "@/components/layout/navbar/assets/Close";
import Modal from "@/components/ui/modals/Modal";
import useAuth from "@/services/useAuth";
import useCohort from "@/services/useCohort";
import React, { useState } from "react";
import useUpdateMeetingPoint from "../../utils/useUpdateMeetingPoint";
import { toastr } from "react-redux-toastr";
import MeetingPointChooser from "../MeetingPointChooser";
import MeetingPointGoAlone from "../MeetingPointGoAlone";
import { getDepartureDate, getReturnDate } from "snu-lib";
import MeetingPointConfirmationModal from "../MeetingPointConfirmationModal";
import useAffectationInfo from "../../utils/useAffectationInfo";
import useAvailableMeetingPoints from "../../utils/useAvailableMeetingPoints";

export default function PDRModal({ open, setOpen }) {
  const { young } = useAuth();
  const { cohort, pdrChoiceExpired } = useCohort();
  const { center, session } = useAffectationInfo();
  const { data: options } = useAvailableMeetingPoints();
  const [modalMeetingPoint, setModalMeetingPoint] = useState({ isOpen: false, meetingPoint: null });
  const { mutate, isPending: loading } = useUpdateMeetingPoint();

  function chooseMeetingPoint(meetingPoint) {
    saveChoice({ meetingPointId: meetingPoint._id, ligneId: meetingPoint.busLineId });
  }

  function chooseGoAlone() {
    saveChoice({ deplacementPhase1Autonomous: "true" });
  }

  async function saveChoice(choice) {
    mutate(choice, {
      onSuccess: () => {
        toastr.success("Votre choix est enregistré");
        setOpen(false);
        setModalMeetingPoint({ isOpen: false, meetingPoint: null });
      },
      onError: () => toastr.error("Erreur", "Nous n'avons pas pu enregistrer votre choix. Veuillez réessayer dans quelques instants."),
    });
  }

  return (
    <Modal isOpen={open} onClose={() => setOpen(false)}>
      <div className="flex justify-end">
        <button onClick={() => setOpen(false)} className="text-gray-600 p-2 translate-x-2 -translate-y-2">
          <Close className="close-icon" height={10} width={10} />
        </button>
      </div>
      <p className="text-center text-lg font-bold text-gray-900">Confirmez votre point de rassemblement</p>
      <div className="flex flex-col md:flex-row items-center gap-6 mt-4">
        {options?.map((mp) => (
          <MeetingPointChooser
            key={mp._id}
            meetingPoint={mp}
            onChoose={() => {
              return setModalMeetingPoint({ isOpen: true, meetingPoint: mp });
            }}
            chosen={mp._id === young.meetingPointId}
            expired={pdrChoiceExpired}
          />
        ))}
        <MeetingPointGoAlone
          center={center}
          young={young}
          onChoose={() => {
            return setModalMeetingPoint({ isOpen: true });
          }}
          chosen={!young.meetingPointId && young.deplacementPhase1Autonomous === "true"}
          expired={pdrChoiceExpired}
          departureDate={getDepartureDate(young, session, cohort)}
          returnDate={getReturnDate(young, session, cohort)}
        />
      </div>
      <MeetingPointConfirmationModal
        modalMeetingPoint={modalMeetingPoint}
        setModalMeetingPoint={setModalMeetingPoint}
        chooseGoAlone={chooseGoAlone}
        chooseMeetingPoint={chooseMeetingPoint}
        loading={loading}
      />
    </Modal>
  );
}
