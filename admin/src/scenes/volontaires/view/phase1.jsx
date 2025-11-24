import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import ModalConfirm from "@/components/modals/ModalConfirm";
import { capture } from "@/sentry";
import api from "@/services/api";
import { YOUNG_STATUS_PHASE1, translate } from "@/utils";
import Loader from "@/components/Loader";
import InfoMessage from "../../dashboardV2/components/ui/InfoMessage";

import { isYoungCheckIsOpen } from "../utils";
import YoungHeader from "../../phase0/components/YoungHeader";
import DocumentPhase1 from "../components/phase1/DocumentPhase1";
import Phase1Header from "../components/phase1/Phase1Header";
import General from "../components/phase1/General";
import Details from "../components/phase1/Details";

export default function Phase1(props) {
  const user = useSelector((state) => state.Auth.user);
  const [meetingPoint, setMeetingPoint] = useState();
  const [pointDeRassemblement, setPointDeRassemblement] = useState();
  const [young, setYoung] = useState(props.young);
  const [cohesionCenter, setCohesionCenter] = useState();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  // new useState
  const [values, setValues] = useState(props.young);
  const cohort = useSelector((state) => state.Cohorts).find((c) => young?.cohortId === c._id);
  const isCheckIsOpen = isYoungCheckIsOpen(user, cohort);

  useEffect(() => {
    if (!young?.sessionPhase1Id) return;
    (async () => {
      try {
        const { data, code, ok } = await api.get(`/session-phase1/${young?.sessionPhase1Id}/cohesion-center`);
        if (!ok) return toastr.error("Impossible de récupérer les informations du centre de cohésion", translate(code));
        setCohesionCenter(data);
      } catch (err) {
        capture(err);
        toastr.error("Impossible de récupérer les informations du centre de cohésion");
      }
    })();
  }, [young]);

  if (!young) return <Loader />;

  return (
    <>
      <YoungHeader young={young} tab="phase1" onChange={props.onChange} />
      <div className="p-[30px]">
        {meetingPoint?.bus?.delayedForth === "true" || meetingPoint?.bus?.delayedBack === "true" ? (
          <InfoMessage
            priority="important"
            message={`Le départ de la ligne de bus de ce jeune est retardé ${
              meetingPoint?.bus?.delayedForth === "true" && meetingPoint?.bus?.delayedBack === "true"
                ? "à l'Aller et au Retour"
                : meetingPoint?.bus?.delayedForth === "true"
                  ? "à l'Aller"
                  : "au Retour"
            }.`}
          />
        ) : null}
        <Phase1Header young={young} setYoung={setYoung} user={user} />
        <General young={young} setYoung={setYoung} values={values} setValues={setValues} isCheckIsOpen={isCheckIsOpen} user={user} />

        <Details young={young} setYoung={setYoung} cohesionCenter={cohesionCenter} cohort={cohort} user={user} />

        {young.statusPhase1 === YOUNG_STATUS_PHASE1.WAITING_AFFECTATION || young.statusPhase1 === YOUNG_STATUS_PHASE1.AFFECTED}
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}
