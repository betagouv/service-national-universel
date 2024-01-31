import Img2 from "../../../../assets/validatedPhase2.png";
import React from "react";
import { FiMail } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import ChevronDown from "../../../../assets/icons/ChevronDown";
import Download from "../../../../assets/icons/Download";
import Unlock from "../../../../assets/icons/Unlock";
import api from "../../../../services/api";
import { translate } from "../../../../utils";
import downloadPDF from "../../../../utils/download-pdf";
import InfoConvocation from "../../components/modals/InfoConvocation";
import { capture } from "../../../../sentry";
import { isCohortDone } from "../../../../utils/cohorts";

import HeroPhase1Mobile from "./assets/herophase1mobile.png";
import { isCohortNeedJdm } from "../../../../utils/cohorts";
import JDCDone from "./components/JDCDone";
import JDCNotDone from "./components/JDCNotDone";
import JDMDone from "./components/JDMDone";
import JDMNotDone from "./components/JDMNotDone";
import NextStep from "./components/NextStep";

export default function Done() {
  const young = useSelector((state) => state.Auth.young) || {};
  const [openAttestationButton, setOpenAttestationButton] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [center, setCenter] = React.useState(null);
  const [meetingPoint, setMeetingPoint] = React.useState(null);
  const [session, setSession] = React.useState(null);
  const showJDM = young.frenchNationality === "true";

  async function handleClickModal() {
    try {
      if (!center || !meetingPoint || !session) {
        const { data: center, ok: okCenter } = await api.get(`/session-phase1/${young.sessionPhase1Id}/cohesion-center`);
        if (!okCenter) throw new Error("Error while fetching center");
        const { data: meetingPoint, ok: okMeetingPoint } = await api.get(`/young/${young._id}/point-de-rassemblement?withbus=true`);
        if (!okMeetingPoint) throw new Error("Error while fetching meeting point");
        const { data: session, ok: okSession } = await api.get(`/young/${young._id}/session/`);
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

  const refAttestationButton = React.useRef();

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refAttestationButton.current && !refAttestationButton.current.contains(event.target)) {
        setOpenAttestationButton(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const viewAttestation = async ({ uri }) => {
    setLoading(true);
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/${uri}`,
      fileName: `${young.firstName} ${young.lastName} - attestation ${uri}.pdf`,
    });
    setLoading(false);
  };

  const sendAttestation = async ({ template, type }) => {
    try {
      setLoading(true);
      const { ok, code } = await api.post(`/young/${young._id}/documents/${template}/${type}/send-email`, {
        fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
      });
      setLoading(false);
      if (!ok) throw new Error(translate(code));
      toastr.success(`Document envoyé à ${young.email}`);
    } catch (e) {
      capture(e);
      setLoading(false);
      return toastr.error("Erreur lors de l'envoie du document : ", e.message);
    }
  };

  return (
    <>
      {/* DESKTOP VIEW*/}
      <div className="hidden flex-col md:flex">
        <div className="m-4 flex flex-col rounded-xl bg-white shadow-ninaBlock">
          <div className="flex flex-col-reverse items-start justify-between px-8 pt-4 lg:!flex-row">
            <div className="flex w-full flex-col py-5 lg:w-2/3">
              <div className="flex items-center lg:items-start">
                <div className="ml-4 flex flex-1 flex-col gap-5">
                  <div className="flex items-center gap-2 text-left text-[44px] leading-tight">
                    <div>
                      <strong>{young.firstName},</strong> vous avez <br /> validé votre Phase 1 !
                    </div>
                  </div>
                  <div className="text-sm font-normal leading-5 text-gray-500">
                    Vous avez réalisé votre séjour de cohésion. <br /> Bravo pour votre participation à cette aventure unique !
                  </div>
                  <div className="flex items-center gap-5">
                    {!isCohortDone(young.cohort, 3) && (
                      <button className="rounded-full border-[1px] border-gray-300 px-3 py-2 text-xs font-medium leading-4 hover:border-gray-500" onClick={handleClickModal}>
                        Mes informations de retour de séjour
                      </button>
                    )}

                    <div className="relative" ref={refAttestationButton}>
                      <button
                        disabled={loading}
                        className="flex w-full items-center justify-between gap-3 rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 hover:border-blue-500 hover:bg-blue-500 disabled:cursor-wait disabled:opacity-50"
                        onClick={() => setOpenAttestationButton((e) => !e)}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium leading-4 text-white">Attestation de réalisation phase 1</span>
                        </div>
                        <ChevronDown className="font-medium text-white" />
                      </button>
                      {/* display options */}
                      <div
                        className={`${
                          openAttestationButton ? "block" : "hidden"
                        }  absolute right-0 top-[40px] z-50 !min-w-full overflow-hidden rounded-lg bg-white shadow transition lg:!min-w-3/4`}>
                        <div
                          key="download"
                          onClick={() => {
                            viewAttestation({ uri: "1" });
                            setOpenAttestationButton(false);
                          }}>
                          <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                            <Download className="h-4 w-4 text-gray-400" />
                            <div>Télécharger</div>
                          </div>
                        </div>
                        <div
                          key="email"
                          onClick={() => {
                            sendAttestation({ type: "1", template: "certificate" });
                            setOpenAttestationButton(false);
                          }}>
                          <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                            <FiMail className="h-4 w-4 text-gray-400" />
                            <div>Envoyer par mail</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-shrink-0 items-start justify-center lg:w-1/3 lg:items-start">
              <img className="h-80 object-scale-down" src={Img2} alt="" />
            </div>
          </div>
          <div className="mb-12 grid grid-cols-1 grid-rows-2 gap-8 px-8 pt-8 lg:grid-cols-2 lg:grid-rows-1 lg:gap-0 lg:divide-x-[1px]">
            <div className="flex flex-col items-center gap-3 px-8">
              <Unlock />
              <div className="text-center text-xl font-bold leading-7">Le code de la route, c’est facile !</div>
              <div className="text-center text-xs font-medium leading-relaxed text-gray-500">
                Vous bénéficiez désormais d’un accès <strong>gratuit</strong> à la <br />
                plateforme en ligne d’apprentissage du code de la route.
              </div>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route"
                className="mt-3 cursor-pointer rounded-lg border-[1px] border-blue-700 px-12 py-2 text-sm font-medium leading-5 text-blue-700 transition duration-100 ease-in-out hover:bg-blue-700 hover:text-white">
                Plus d’informations
              </a>
            </div>
            {showJDM &&
              (isCohortNeedJdm(young.cohort) ? young?.presenceJDM === "true" ? <JDMDone /> : <JDMNotDone /> : young.cohesionStayPresence === "true" ? <JDCDone /> : <JDCNotDone />)}
          </div>
        </div>
      </div>

      {/* MOBILE VIEW*/}
      <div className="mb-4 flex flex-col rounded-lg bg-white md:hidden">
        <img src={HeroPhase1Mobile} alt="" />
        <div className="px-4">
          <div className="flex items-center gap-2 text-2xl leading-tight">
            <div>
              <strong>{young.firstName},</strong> vous avez <br /> validé votre Phase 1 !
            </div>
          </div>
          <div className="mt-2 text-xs font-normal leading-5 text-gray-500">
            Vous avez réalisé votre séjour de cohésion. <br /> Bravo pour votre participation à cette aventure unique !
          </div>
          <div className="flex flex-col items-center gap-3 py-3">
            {!isCohortDone(young.cohort, 3) ? (
              <button className="whitespace-nowrap rounded-full border-[1px] border-gray-300 px-3 py-2 text-xs font-medium leading-4" onClick={handleClickModal}>
                Mes informations de retour de séjour
              </button>
            ) : null}
            <div className="relative" ref={refAttestationButton}>
              <button
                disabled={loading}
                className="flex w-full items-center justify-between gap-3 rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 disabled:cursor-wait disabled:opacity-50"
                onClick={() => setOpenAttestationButton((e) => !e)}>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-xs font-medium leading-4 text-white">Attestation de réalisation phase 1</span>
                </div>
                <ChevronDown className="font-medium text-white" />
              </button>

              <div
                className={`${
                  openAttestationButton ? "block" : "hidden"
                }  absolute right-0 top-[40px] z-0 !min-w-full overflow-hidden rounded-lg bg-white shadow transition lg:!min-w-3/4`}>
                <div
                  key="download"
                  onClick={() => {
                    viewAttestation({ uri: "1" });
                    setOpenAttestationButton(false);
                  }}>
                  <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                    <Download className="h-4 w-4 text-gray-400" />
                    <div>Télécharger</div>
                  </div>
                </div>
                <div
                  key="email"
                  onClick={() => {
                    sendAttestation({ type: "1", template: "certificate" });
                    setOpenAttestationButton(false);
                  }}>
                  <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                    <FiMail className="h-4 w-4 text-gray-400" />
                    <div>Envoyer par mail</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3">
            <Unlock />
            <div className="text-center text-xl font-bold leading-7">Le code de la route, c’est facile !</div>
            <div className="text-center text-xs font-medium leading-relaxed text-gray-500">
              Vous bénéficiez désormais d’un accès <strong>gratuit</strong> à la plateforme en ligne d’apprentissage du code de la route.{" "}
              <a
                target="_blank"
                rel="noreferrer"
                href="https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route"
                className="font-bold text-gray-800 hover:text-gray-800">
                Plus d’informations
              </a>
            </div>
          </div>
        </div>
        {showJDM &&
          (isCohortNeedJdm(young.cohort) ? young?.presenceJDM === "true" ? <JDMDone /> : <JDMNotDone /> : young.cohesionStayPresence === "true" ? <JDCDone /> : <JDCNotDone />)}
      </div>

      <NextStep />

      {!isCohortDone(young.cohort, 3) && modalOpen && (
        <InfoConvocation isOpen={modalOpen} onCancel={() => setModalOpen(false)} center={center} meetingPoint={meetingPoint} session={session} />
      )}
    </>
  );
}
