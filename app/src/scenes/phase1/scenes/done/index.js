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
import plausibleEvent from "../../../../services/plausible";
import { capture } from "../../../../sentry";
import { isCohortDone } from "../../../../utils/cohorts";
import ButtonLinkPrimary from "../../../../components/ui/buttons/ButtonLinkPrimary";
import JDMDone from "./components/JDMDone";
import JDMNotDone from "./components/JDMNotDone";

export default function Done() {
  const young = useSelector((state) => state.Auth.young) || {};
  const [openAttestationButton, setOpenAttestationButton] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState({ isOpen: false });
  const [loading, setLoading] = React.useState(false);

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
      <div className="hidden md:flex flex-col">
        <div className="flex flex-col rounded-xl bg-white mx-4 my-8 shadow-ninaBlock">
          <div className="flex px-8 pt-4 justify-between flex-col-reverse items-start lg:!flex-row">
            <div className="flex flex-col w-full lg:w-2/3 py-5">
              <div className="flex items-center lg:items-start">
                <div className="flex flex-col flex-1 gap-5 ml-4">
                  <div className="flex items-center gap-2 text-[44px] text-left leading-tight">
                    <div>
                      <strong>{young.firstName},</strong> vous avez <br /> validé votre Phase 1 !
                    </div>
                  </div>
                  <div className="text-sm leading-5 font-normal text-gray-500">
                    Vous avez réalisé votre séjour de cohésion. <br /> Bravo pour votre participation à cette aventure unique !
                  </div>
                  <div className="flex gap-5 items-center">
                    {!isCohortDone(young.cohort) && (
                      <button
                        className="rounded-full border-[1px] border-gray-300 px-3 py-2 text-xs leading-4 font-medium hover:border-gray-500"
                        onClick={() => setModalOpen({ isOpen: true })}>
                        Mes informations de retour de séjour
                      </button>
                    )}

                    <div className="relative" ref={refAttestationButton}>
                      <button
                        disabled={loading}
                        className="flex justify-between gap-3 items-center rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 hover:bg-blue-500 hover:border-blue-500 disabled:opacity-50 disabled:cursor-wait w-full"
                        onClick={() => setOpenAttestationButton((e) => !e)}>
                        <div className="flex items-center gap-2">
                          <span className="text-white leading-4 text-xs font-medium">Attestation de réalisation phase 1</span>
                        </div>
                        <ChevronDown className="text-white font-medium" />
                      </button>
                      {/* display options */}
                      <div
                        className={`${
                          openAttestationButton ? "block" : "hidden"
                        }  rounded-lg !min-w-full lg:!min-w-3/4 bg-white transition absolute right-0 shadow overflow-hidden z-50 top-[40px]`}>
                        <div
                          key="download"
                          onClick={() => {
                            viewAttestation({ uri: "1" });
                            setOpenAttestationButton(false);
                          }}>
                          <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                            <Download className="text-gray-400 w-4 h-4" />
                            <div>Télécharger</div>
                          </div>
                        </div>
                        <div
                          key="email"
                          onClick={() => {
                            sendAttestation({ type: "1", template: "certificate" });
                            setOpenAttestationButton(false);
                          }}>
                          <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                            <FiMail className="text-gray-400 w-4 h-4" />
                            <div>Envoyer par mail</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start justify-center lg:items-start flex-shrink-0 w-full lg:w-1/3">
              <img className="object-scale-down h-80" src={require("../../../../assets/validatedPhase2.png")} alt="" />
            </div>
          </div>
          <div className="flex px-8 pt-8 pb-12 justify-between flex-col items-stretch lg:!flex-row gap-8">
            <div className="flex flex-col w-full lg:w-1/2 items-center px-8  gap-3 lg:border-r-[1px] border-gray-200">
              <Unlock />
              <div className="leading-7 text-xl text-center font-bold">Le code de la route, c’est facile !</div>
              <div className="text-xs leading-4 font-medium text-gray-500 text-center">
                Vous bénéficiez désormais d’un accès <strong>gratuit</strong> à la <br />
                plateforme en ligne d’apprentissage du code de la route.
              </div>
              <a
                target="_blank"
                rel="noreferrer"
                href="https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route"
                className="rounded-lg border-[1px] border-blue-700 text-blue-700 text-sm leading-5 font-medium px-12 py-2 mt-3 hover:text-white hover:bg-blue-700 transition duration-100 ease-in-out cursor-pointer">
                Plus d’informations
              </a>
            </div>
            {young?.presenceJDM === "true" ? <JDMDone /> : <JDMNotDone />}
          </div>
        </div>
        <div className="flex flex-col lg:flex-row text-center gap-4 lg:!text-left items-center rounded-xl shadow-ninaBlock justify-between bg-white mx-4 mb-4 px-10 py-5">
          <p className="w-full lg:w-2/3 text-xl leading-7 font-bold">
            Et maintenant, votre parcours d’engagement se poursuit désormais avec la phase 2, la mission d’intérêt général
          </p>
          <ButtonLinkPrimary
            to="/phase2"
            className="shadow-ninaBlue"
            onClick={() => {
              plausibleEvent("Phase 2/CTA - Realiser ma mission");
            }}>
            Je trouve une mission d’intérêt général
          </ButtonLinkPrimary>
        </div>
      </div>

      {/* MOBILE VIEW*/}
      <div className="flex md:hidden flex-col bg-white mb-4 rounded-lg">
        <div className="p-4">
          <div className="flex items-center gap-2 text-2xl leading-tight">
            <div>
              <strong>{young.firstName},</strong> vous avez <br /> validé votre Phase 1 !
            </div>
          </div>
          <div className="text-xs leading-5 font-normal text-gray-500 mt-2">
            Vous avez réalisé votre séjour de cohésion. <br /> Bravo pour votre participation à cette aventure unique !
          </div>
          <div className="flex flex-col gap-3 items-center py-3">
            {!isCohortDone(young.cohort) ? (
              <button
                className="rounded-full border-[1px] border-gray-300 px-3 py-2 text-xs leading-4 font-medium whitespace-nowrap"
                onClick={() => setModalOpen({ isOpen: true })}>
                Mes informations de retour de séjour
              </button>
            ) : null}
            <div className="relative" ref={refAttestationButton}>
              <button
                disabled={loading}
                className="flex justify-between gap-3 items-center rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 disabled:opacity-50 disabled:cursor-wait w-full"
                onClick={() => setOpenAttestationButton((e) => !e)}>
                <div className="flex items-center gap-2">
                  <span className="text-white leading-4 text-xs font-medium whitespace-nowrap">Attestation de réalisation phase 1</span>
                </div>
                <ChevronDown className="text-white font-medium" />
              </button>

              <div
                className={`${
                  openAttestationButton ? "block" : "hidden"
                }  rounded-lg !min-w-full lg:!min-w-3/4 bg-white transition absolute right-0 shadow overflow-hidden z-0 top-[40px]`}>
                <div
                  key="download"
                  onClick={() => {
                    viewAttestation({ uri: "1" });
                    setOpenAttestationButton(false);
                  }}>
                  <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                    <Download className="text-gray-400 w-4 h-4" />
                    <div>Télécharger</div>
                  </div>
                </div>
                <div
                  key="email"
                  onClick={() => {
                    sendAttestation({ type: "1", template: "certificate" });
                    setOpenAttestationButton(false);
                  }}>
                  <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                    <FiMail className="text-gray-400 w-4 h-4" />
                    <div>Envoyer par mail</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 mt-4">
            <Unlock />
            <div className="leading-7 text-xl text-center font-bold">Le code de la route, c’est facile !</div>
            <div className="text-xs leading-4 font-medium text-gray-500 text-center">
              Vous bénéficiez désormais d’un accès <strong>gratuit</strong> à la <br />
              plateforme en ligne d’apprentissage du code de la route.{" "}
              <span>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route"
                  className="font-bold text-gray-800 hover:text-gray-800">
                  Plus d’informations
                </a>
              </span>
            </div>
          </div>
        </div>
        {young?.presenceJDM === "true" ? <JDMDone /> : <JDMNotDone />}
        <div className="flex flex-col text-center gap-4 items-center rounded-lg justify-between bg-gray-100 mb-4 px-2 py-5">
          <div className="w-full lg:w-2/3 text-xl leading-7 font-bold">
            Et maintenant, votre parcours d’engagement se poursuit désormais avec la phase 2, la mission d’intérêt général
          </div>
          <ButtonLinkPrimary
            to="/phase2"
            className="shadow-ninaBlue"
            onClick={() => {
              plausibleEvent("Phase 2/CTA - Realiser ma mission");
            }}>
            Je trouve une mission d’intérêt général
          </ButtonLinkPrimary>
        </div>
      </div>
      <InfoConvocation isOpen={modalOpen?.isOpen} onCancel={() => setModalOpen({ isOpen: false })} />
    </>
  );
}
