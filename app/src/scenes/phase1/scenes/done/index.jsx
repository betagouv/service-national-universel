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
import hero from "../../../../assets/hero/phase1.png";
import HeroPhase1Mobile from "./assets/herophase1mobile.png";
import { isCohortNeedJdm } from "../../../../utils/cohorts";
import JDCDone from "./components/JDCDone";
import JDCNotDone from "./components/JDCNotDone";
import JDMDone from "./components/JDMDone";
import JDMNotDone from "./components/JDMNotDone";
import NextStep from "./components/NextStep";
import HomeContainer from "@/components/layout/HomeContainer";
import HomeHeader from "@/components/layout/HomeHeader";

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

  const title = `${young.firstName}, vous avez validé votre Phase 1 !`;

  return (
    <HomeContainer>
      <HomeHeader title={title} img={hero}>
        <div className="mt-3 ">
          <p className="text-sm leading-relaxed text-gray-500">Vous avez réalisé votre séjour de cohésion.</p>
          <p className="text-sm  leading-relaxed text-gray-500">Bravo pour votre participation à cette aventure unique !</p>
        </div>

        <div className="mt-4 flex items-center gap-5">
          {!isCohortDone(young.cohort, 3) && (
            <>
              <button className="rounded-full border-[1px] border-gray-300 px-3 py-2 text-xs font-medium leading-4 hover:border-gray-500" onClick={handleClickModal}>
                Mes informations de retour de séjour
              </button>
              <InfoConvocation isOpen={modalOpen} onCancel={() => setModalOpen(false)} center={center} meetingPoint={meetingPoint} session={session} />
            </>
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
              <button
                key="download"
                onClick={() => {
                  viewAttestation({ uri: "1" });
                  setOpenAttestationButton(false);
                }}>
                <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                  <Download className="h-4 w-4 text-gray-400" />
                  <div>Télécharger</div>
                </div>
              </button>
              <button
                key="email"
                onClick={() => {
                  sendAttestation({ type: "1", template: "certificate" });
                  setOpenAttestationButton(false);
                }}>
                <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                  <FiMail className="h-4 w-4 text-gray-400" />
                  <div>Envoyer par mail</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </HomeHeader>

      <div className="mt-12 grid gap-16">
        <div className="flex flex-col md:flex-row gap-12 md:gap-4">
          <div className="md:w-2/5 flex flex-col items-center gap-3 md:border-r md:pr-4 md:mr-4">
            <Unlock />
            <div className="text-center text-xl font-bold leading-7">Le code de la route, c’est facile !</div>
            <div className="text-center text-xs font-medium leading-relaxed text-gray-500">
              Vous bénéficiez désormais d’un accès <strong>gratuit</strong> à la plateforme en ligne d’apprentissage du code de la route.{" "}
            </div>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route"
              className="mt-3 cursor-pointer rounded-lg border-[1px] border-blue-700 px-12 py-2 text-sm font-medium leading-5 text-blue-700 transition duration-100 ease-in-out hover:bg-blue-700 hover:text-white">
              Plus d’informations
            </a>
          </div>

          <div className="md:w-3/5">
            {showJDM &&
              (isCohortNeedJdm(young.cohort) ? young?.presenceJDM === "true" ? <JDMDone /> : <JDMNotDone /> : young.cohesionStayPresence === "true" ? <JDCDone /> : <JDCNotDone />)}
          </div>
        </div>

        <NextStep />
      </div>
    </HomeContainer>
  );
}
