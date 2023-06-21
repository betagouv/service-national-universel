import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { HeroContainer, Hero } from "../../components/Content";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";
import { youngCanChangeSession } from "snu-lib";
import plausibleEvent from "../../services/plausible";
import API from "../../services/api";
import { permissionPhase2, permissionReinscription, translate } from "../../utils";
import { setYoung } from "../../redux/auth/actions";
import { capture } from "../../sentry";
import { toastr } from "react-redux-toastr";
import Loader from "../../components/Loader";
import { isCohortDone } from "../../utils/cohorts";
import InfoConvocation from "./components/modals/InfoConvocation";

export default function NotDone() {
  const [loading, setLoading] = useState(false);
  const young = useSelector((state) => state.Auth.young) || {};
  const history = useHistory();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [center, setCenter] = React.useState(null);
  const [meetingPoint, setMeetingPoint] = React.useState(null);
  const [session, setSession] = React.useState(null);

  async function handleClickModal() {
    try {
      if (!center || !meetingPoint || !session) {
        const { data: center, ok: okCenter } = await API.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
        if (!okCenter) throw new Error("Error while fetching center");
        const { data: meetingPoint, ok: okMeetingPoint } = await API.get(`/young/${young._id}/point-de-rassemblement?withbus=true`);
        if (!okMeetingPoint) throw new Error("Error while fetching meeting point");
        const { data: session, ok: okSession } = await API.get(`/young/${young._id}/session/`);
        if (!okSession) throw new Error("Error while fetching session");
        setCenter(center);
        setMeetingPoint(meetingPoint);
        setSession(session);
      }
      setModalOpen(true);
    } catch (e) {
      capture(e);
      toastr.error(e.message);
    }
  }

  async function goToReinscription() {
    try {
      setLoading(true);
      const { ok, code, data: responseData } = await API.put("/young/reinscription/goToReinscription");
      if (!ok) throw new Error(translate(code));
      dispatch(setYoung(responseData));

      plausibleEvent("Phase1 Non réalisée/CTA reinscription - home page");
      return history.push("/reinscription/eligibilite");
    } catch (e) {
      setLoading(false);
      capture(e);
      toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  }

  return (
    <HeroContainer>
      <Hero>
        <div className="content">
          <h1>
            <strong>{young.firstName}, vous n&apos;avez pas réalisé votre séjour de cohésion !</strong>
          </h1>
          <p>
            <b>Votre phase 1 n&apos;est donc pas validée.</b>
          </p>
          <p>Nous vous invitons à vous rapprocher de votre référent départemental pour la suite de votre parcours.</p>
          {!isCohortDone(young.cohort) && (
            <button className="mt-8 rounded-full border-[1px] border-gray-300 px-3 py-2 text-xs font-medium leading-4 hover:border-gray-500" onClick={handleClickModal}>
              Voir mes informations de convocation
            </button>
          )}
          {youngCanChangeSession(young) ? <Button to="/changer-de-sejour">Changer mes dates de séjour de cohésion</Button> : null}
          <div className="flex w-fit flex-col items-stretch">
            {permissionPhase2(young) && (
              <button
                className="mt-5 rounded-[10px] border-[1px] border-blue-600  bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600"
                onClick={() => {
                  plausibleEvent("Phase 2/CTA - Realiser ma mission");
                  history.push("/phase2");
                }}>
                Réaliser ma mission d&apos;intérêt général
              </button>
            )}
            {permissionReinscription(young) && (
              <>
                {loading ? (
                  <Loader />
                ) : (
                  <button
                    className="bg-blue-[#FFFFFF] mt-5 w-full rounded-[10px] border-[1px]  border-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-blue-600 transition duration-150 ease-in-out hover:bg-blue-600 hover:text-white"
                    onClick={goToReinscription}>
                    Se réinscrire à un autre séjour
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="thumb" />
      </Hero>

      {modalOpen && !isCohortDone(young.cohort) && <InfoConvocation isOpen={modalOpen} onCancel={() => setModalOpen(false)} title="Information de convocation" />}
    </HeroContainer>
  );
}
const Button = styled(Link)`
  width: fit-content;
  cursor: pointer;
  color: #374151;
  text-align: center;
  margin: 1rem 0;
  background-color: #fff;
  padding: 0.5rem 1rem;
  border: 1px solid #d2d6dc;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  display: block;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 2;
  :hover {
    opacity: 0.9;
  }
  a {
    color: #374151;
  }
`;
