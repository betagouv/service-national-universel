import Close from "@/components/layout/navbar/assets/Close";
import Modal from "@/components/ui/modals/Modal";
import { setYoung } from "@/redux/auth/actions";
import { capture } from "@/sentry";
import API from "@/services/api";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import MeetingPointChooser from "../MeetingPointChooser";
import MeetingPointGoAlone from "../MeetingPointGoAlone";
import { getDepartureDate, getReturnDate } from "snu-lib";
import MeetingPointConfirmationModal from "../MeetingPointConfirmationModal";

export default function PDRModal({ open, setOpen, meetingPoints, center, session, pdrChoiceExpired }) {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [modalMeetingPoint, setModalMeetingPoint] = useState({ isOpen: false, meetingPoint: null });
  const [loading, setLoading] = useState(false);

  function chooseMeetingPoint(meetingPoint) {
    saveChoice({ meetingPointId: meetingPoint._id, ligneId: meetingPoint.busLineId });
  }

  function chooseGoAlone() {
    saveChoice({ deplacementPhase1Autonomous: "true" });
  }

  async function saveChoice(choice) {
    try {
      setLoading(true);
      const result = await API.put(`/young/${young._id}/point-de-rassemblement`, choice);
      if (result.ok) {
        toastr.success("Votre choix est enregistré");
        dispatch(setYoung(result.data));
        setOpen(false);
      } else {
        toastr.error("Erreur", "Nous n'avons pas pu enregistrer votre choix. Veuillez réessayer dans quelques instants.");
      }
      setLoading(false);
      setModalMeetingPoint({ isOpen: false, meetingPoint: null });
    } catch (err) {
      setLoading(false);
      setModalMeetingPoint({ isOpen: false, meetingPoint: null });
      capture(err);
      toastr.error("Erreur", "Nous n'avons pas pu enregistrer votre choix. Veuillez réessayer dans quelques instants.");
    }
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
        {meetingPoints.map((mp) => (
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
          departureDate={getDepartureDate(young, session, young.cohortData)}
          returnDate={getReturnDate(young, session, young.cohortData)}
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
