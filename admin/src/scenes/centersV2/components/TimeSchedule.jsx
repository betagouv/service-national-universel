import React, { useState, useEffect } from "react";
import Field from "./Field";
import { MoreButton } from "../../phase0/components/commons";
import { PlainButton } from "../../phase0/components/Buttons";
import Cni from "../../../assets/icons/Cni";
import ModalTimeSchedule from "./modals/ModalTimeSchedule";
import { toastr } from "react-redux-toastr";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import queryString from "query-string";
import { ROLES } from "snu-lib/roles";
import { useSelector } from "react-redux";

export default function TimeSchedule({ session, className = "", onSessionChanged }) {
  const [modalOpened, setModalOpened] = useState(false);
  const currentUser = useSelector((state) => state.Auth.user);

  useEffect(() => {
    const { timeschedule } = queryString.parse(location.search);
    if (timeschedule === "true") {
      setModalOpened(true);
    }
  }, []);

  const hasTimeSchedule = session.timeScheduleFiles && session.timeScheduleFiles.length > 0;

  async function sendReminder() {
    if (session.headCenterId) {
      try {
        const result = await api.post(`/session-phase1/${session._id}/time-schedule/send-reminder`, {});
        if (result.ok) {
          toastr.success("Le chef de centre a bien été relancé.");
        } else {
          toastr.error("Une erreur est survenue pendant l'envoi de la relance. Veuillez réessayer dans quelques instants.");
        }
      } catch (err) {
        capture(err);
        toastr.error("Une erreur est survenue pendant l'envoi de la relance. Veuillez réessayer dans quelques instants.");
      }
    } else {
      toastr.error("Aucun chef de centre n’est rattaché à ce séjour. Vous devez renseigner un chef de centre avant de le relancer");
    }
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center rounded-lg bg-gray-50 p-9">
        <Cni />
        <div className="grow-1 mx-7">
          <div className="text-sm font-bold text-[#242526]">Emploi du temps du séjour</div>
          {!hasTimeSchedule && [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(currentUser.role) && (
            <PlainButton className="mt-3" onClick={sendReminder}>
              Relancer le chef de centre
            </PlainButton>
          )}
        </div>
        <MoreButton onClick={() => setModalOpened(true)} />
      </div>
      <div className=" ml-[70px] w-[250px]">
        <Field readOnly={true} label="Statut" value={hasTimeSchedule ? "Déposé" : "Non déposé"} />
      </div>
      {modalOpened && <ModalTimeSchedule session={session} onCancel={() => setModalOpened(false)} onChanged={onSessionChanged} />}
    </div>
  );
}
