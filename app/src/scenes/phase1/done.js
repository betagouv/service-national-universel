import React from "react";
import { FiChevronDown, FiMail } from "react-icons/fi";
import { RiErrorWarningFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { youngCanChangeSession } from "snu-lib";
import edit from "../../assets/editIcon.svg";
import CheckCircleFill from "../../assets/icons/CheckCircleFill";
import ChevronDown from "../../assets/icons/ChevronDown";
import Download from "../../assets/icons/Download";
import Unlock from "../../assets/icons/Unlock";
import XCircleFill from "../../assets/icons/XCircleFill";
import api from "../../services/api";
import { COHESION_STAY_END, translate } from "../../utils";
import downloadPDF from "../../utils/download-pdf";
import InfoConvocation from "./components/modals/InfoConvocation";
import plausibleEvent from "../../services/plausible";

export default function Done() {
  const young = useSelector((state) => state.Auth.young) || {};
  const [openAttestationButton, setOpenAttestationButton] = React.useState(false);
  const [checkOpen, setCheckOpen] = React.useState(false);
  const [differOpen, setDifferOpen] = React.useState(false);
  const [FaqOpen, setFaqOpen] = React.useState(false);
  const [Faq2Open, setFaq2Open] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState({ isOpen: false });
  const [loading, setLoading] = React.useState(false);

  const refAttestationButton = React.useRef();
  const history = useHistory();
  const now = new Date();

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
    setLoading(true);
    const { ok, code } = await api.post(`/young/${young._id}/documents/${template}/${type}/send-email`, {
      fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
    });
    setLoading(false);
    if (ok) return toastr.success(`Document envoyé à ${young.email}`);
    else return toastr.error("Erreur lors de l'envoie du document", translate(code));
  };

  return (
    <>
      {/* DESKTOP VIEW*/}
      <div className="hidden md:flex flex-col">
        <div className="flex flex-col rounded-lg bg-white mx-4 my-8">
          <div className="flex px-8 pt-4 justify-between flex-col-reverse items-start lg:!flex-row">
            <div className="flex flex-col w-full lg:w-2/3 py-5">
              <div className="flex items-center lg:items-start">
                <div className="flex flex-col flex-1 gap-5 ml-4">
                  <div className="flex items-center gap-2 text-[44px] text-left leading-tight">
                    <div>
                      <strong>{young.firstName},</strong> vous avez <br /> validé votre Phase 1 !
                    </div>
                    {youngCanChangeSession(young) ? (
                      <Link to="/changer-de-sejour">
                        <img src={edit} alt="edit icon" className="h-9 w-9 ml-2 hover:w-10 hover:h-10 hover:cursor-pointer" />
                      </Link>
                    ) : null}
                  </div>
                  <div className="text-sm leading-5 font-normal text-gray-500">
                    Vous avez réalisé votre séjour de cohésion. <br /> Bravo pour votre participation à cette aventure unique !
                  </div>
                  <div className="flex gap-5 items-center">
                    {now < COHESION_STAY_END[young.cohort] ? (
                      <button
                        className="rounded-full border-[1px] border-gray-300 px-3 py-2 text-xs leading-4 font-medium hover:border-gray-500"
                        onClick={() => setModalOpen({ isOpen: true })}>
                        Mes informations de retour de séjour
                      </button>
                    ) : null}

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
              <img className="object-scale-down h-80" src={require("../../assets/validatedPhase2.png")} />
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
            <div className="flex flex-col w-full lg:w-1/2 items-stretch px-10 gap-3">
              <div className="flex justify-center">
                <Unlock />
              </div>
              <div className="leading-7 text-xl text-center font-bold">
                Obtenez votre certificat <br /> de participation à la JDC !
              </div>
              <div className="text-xs leading-4 font-medium text-gray-500 text-center w-full">grâce à la validation de votre phase 1</div>
              <div className="flex flex-col rounded-lg shadow-ninaBlock mt-3">
                <div
                  className={`flex items-center justify-between cursor-pointer px-4 ${checkOpen ? "pt-4" : "py-4"}`}
                  onClick={() => {
                    setCheckOpen(!checkOpen);
                    setFaqOpen(false);
                    if (differOpen) setDifferOpen(false);
                  }}>
                  <div className="flex items-center gap-3">
                    <CheckCircleFill className="text-green-500 w-5 h-5" />
                    <div className="text-base font-bold">
                      J’ai <strong>effectué</strong> mon recensement citoyen
                    </div>
                  </div>
                  <FiChevronDown className={`text-gray-400 w-6 h-6 cursor-pointer hover:scale-105 ${checkOpen ? "rotate-180" : ""}`} />
                </div>
                {checkOpen ? (
                  <div className="px-3 pb-3">
                    <div className="text-sm leading-5 font-medium text-gray-800 mt-3 px-2 text-justify">
                      Vous recevrez automatiquement votre certificat individuel de participation après le séjour. Vous n’avez rien à faire.
                    </div>
                    <div className="text-[13px] leading-5 text-gray-500 mt-3 px-2 text-justify">
                      <RiErrorWarningFill className="w-4 h-4 inline mr-1 align-text-bottom" />
                      Attention, si vous n’avez pas pu participer à la Journée défense et mémoire (JDM), vous devrez tout de même réaliser votre JDC.
                    </div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
                      className="text-sm px-2 leading-5 cursor-pointer underline text-blue-600 hover:underline">
                      En savoir plus
                    </a>
                    <div className="w-full rounded-lg bg-gray-100 mt-3 py-3 px-2 cursor-pointer ">
                      <div className="text-base leading-6 font-bold ml-2" onClick={() => setFaqOpen(!FaqOpen)}>
                        Voir la F.A.Q
                      </div>
                      {FaqOpen ? (
                        <div className="ml-2">
                          <div className="text-sm leading-5 font-medium text-gray-800 mt-3">Je n’ai pas reçu mon certificat...</div>
                          <div className="text-[13px] leading-5 text-gray-500 text-justify mt-1">
                            Rapprochez-vous de votre CSNJ (Centre du service national et de la jeunesse de votre lieu de résidence) pour vérifier votre situation.
                          </div>
                          <div className="text-sm leading-5 font-medium text-gray-800 mt-3">J’ai quand même reçu ma convocation à la JDC...</div>
                          <div className="text-[13px] leading-5 text-gray-500 text-justify mt-1">
                            Dans ce cas, transmettez votre attestation de réalisation de phase 1 au CSNJ afin de recevoir votre CIP à la JDC.
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="flex flex-col rounded-lg shadow-ninaBlock">
                <div
                  className={`flex items-center justify-between cursor-pointer px-4 ${differOpen ? "pt-3" : "py-3"}`}
                  onClick={() => {
                    setDifferOpen(!differOpen);
                    setFaq2Open(false);
                    if (checkOpen) setCheckOpen(false);
                  }}>
                  <div className="flex items-center gap-3">
                    <XCircleFill className="text-red-500 w-4 h-4" />
                    <div className="text-base font-bold">
                      Je n’ai <strong>pas</strong> effectué mon recensement <br /> citoyen
                    </div>
                  </div>
                  <FiChevronDown className={`text-gray-400 w-6 h-6 cursor-pointer hover:scale-105 ${differOpen ? "rotate-180" : ""}`} />
                </div>
                {differOpen ? (
                  <div className="px-3 pb-3">
                    <div className="text-sm leading-5 font-medium text-gray-800 mt-3 px-2 text-justify">
                      Recensez-vous auprès de votre mairie ou en ligne à partir de vos 16 ans, vous recevez votre convocation à la JDC.
                    </div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href="https://www.service-public.fr/particuliers/vosdroits/F870"
                      className="text-sm px-2 leading-5 cursor-pointer underline text-blue-600 hover:underline mt-1.5">
                      En savoir plus sur le recensement
                    </a>
                    <div className="text-[13px] leading-5 text-[#738297] mt-3 px-2 text-justify">
                      <RiErrorWarningFill className="w-4 h-4 inline mr-1 align-text-bottom" />
                      Attention, si vous n’avez pas pu participer à la Journée défense et mémoire (JDM), vous devrez tout de même réaliser votre JDC.
                    </div>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
                      className="text-sm px-2 leading-5 cursor-pointer underline text-blue-600 hover:underline">
                      En savoir plus
                    </a>
                    <div className="w-full rounded-lg bg-gray-100 mt-3 py-3 px-2 cursor-pointer ">
                      <div className="text-sm leading-6 font-medium" onClick={() => setFaq2Open(!Faq2Open)}>
                        Vous ne souhaitez par réaliser votre JDC ?
                      </div>
                      {Faq2Open ? (
                        <>
                          <div className="text-[13px] leading-5 text-[#738297] text-justify mt-1">
                            Transmettez votre attestation de réalisation de la phase 1 à votre CSNJ pour obtenir votre certificat de participation à la JDC.
                          </div>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
                            className="text-sm leading-5 cursor-pointer underline text-blue-600 hover:underline mt-1.5">
                            En savoir plus sur la procédure
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row text-center gap-4 lg:!text-left items-center rounded-lg justify-between bg-white mx-4 mb-4 px-10 py-5">
          <div className="w-full lg:w-2/3 text-xl leading-7 font-bold">
            Et maintenant, votre parcours d’engagement se poursuit désormais avec la phase 2, la mission d’intérêt général
          </div>
          <button
            className="bg-blue-600 border-[1px] border-blue-600 hover:bg-white text-white hover:!text-blue-600 text-sm leading-5 font-medium py-2 px-4 rounded-lg transition duration-100 ease-in-out"
            onClick={() => {
              plausibleEvent("Phase 2/CTA - Realiser ma mission");
              history.push("/phase2");
            }}>
            Je trouve une mission d’intérêt général
          </button>
        </div>
      </div>

      {/* MOBILE VIEW*/}
      <div className="flex md:hidden flex-col bg-white mb-4 rounded-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 text-2xl leading-tight">
            <div>
              <strong>{young.firstName},</strong> vous avez <br /> validé votre Phase 1 !
            </div>
            {youngCanChangeSession(young) ? (
              <Link to="/changer-de-sejour">
                <img src={edit} alt="edit icon" className="h-9 w-9 ml-2 hover:w-10 hover:h-10 hover:cursor-pointer" />
              </Link>
            ) : null}
          </div>
          <div className="text-xs leading-5 font-normal text-gray-500 mt-2">
            Vous avez réalisé votre séjour de cohésion. <br /> Bravo pour votre participation à cette aventure unique !
          </div>
          <div className="flex flex-col gap-3 items-center py-3">
            {now < COHESION_STAY_END[young.cohort] ? (
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
          <div className="flex flex-col w-full items-stretch gap-3 mt-4">
            <div className="flex justify-center">
              <Unlock />
            </div>
            <div className="leading-7 text-xl text-center font-bold">
              Obtenez votre certificat <br /> de participation à la JDC !
            </div>
            <div className="text-xs leading-4 font-medium text-gray-500 text-center w-full">grâce à la validation de votre phase 1</div>
            <div className="flex flex-col px-3 py-3 rounded-lg bg-white shadow-ninaBlock mt-3">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {
                  setCheckOpen(!checkOpen);
                  setFaqOpen(false);
                  if (differOpen) setDifferOpen(false);
                }}>
                <div className="flex items-center gap-3">
                  <CheckCircleFill className="text-green-500 w-5 h-5" />
                  <div className="text-base font-bold">
                    J’ai <strong>effectué</strong> mon recensement citoyen
                  </div>
                </div>
                <FiChevronDown className={`text-gray-400 w-6 h-6 cursor-pointer hover:scale-105 ${checkOpen ? "rotate-180" : ""}`} />
              </div>
              {checkOpen ? (
                <>
                  <div className="text-sm leading-5 font-medium text-gray-800 mt-3 px-3 text-justify">
                    Vous recevrez automatiquement votre certificat individuel de participation après le séjour. Vous n’avez rien à faire.
                  </div>
                  <div className="text-[13px] leading-5 text-gray-500 mt-3 px-3 text-justify">
                    <RiErrorWarningFill className="w-4 h-4 inline mr-1 align-text-bottom" />
                    Attention, si vous n’avez pas pu participer à la Journée défense et mémoire (JDM), vous devrez tout de même réaliser votre JDC.
                  </div>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
                    className="text-sm px-3 leading-5 cursor-pointer underline text-blue-600 hover:underline">
                    En savoir plus
                  </a>
                  <div className="w-full rounded-lg bg-gray-100 mt-3 py-3 px-2 cursor-pointer ">
                    <div className="text-base px-2 leading-6 font-bold" onClick={() => setFaqOpen(!FaqOpen)}>
                      Voir la F.A.Q
                    </div>
                    {FaqOpen ? (
                      <div className="px-2">
                        <div className="text-sm leading-5 font-medium text-gray-800 mt-3">Je n’ai pas reçu mon certificat...</div>
                        <div className="text-[13px] leading-5 text-gray-500 text-justify mt-1">
                          Rapprochez-vous de votre CSNJ (Centre du service national et de la jeunesse de votre lieu de résidence) pour vérifier votre situation.
                        </div>
                        <div className="text-sm leading-5 font-medium text-gray-800 mt-3">J’ai quand même reçu ma convocation à la JDC...</div>
                        <div className="text-[13px] leading-5 text-gray-500 text-justify mt-1">
                          Dans ce cas, transmettez votre attestation de réalisation de phase 1 au CSNJ afin de recevoir votre CIP à la JDC.
                        </div>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
            <div className="flex flex-col px-3 py-3 rounded-lg bg-white shadow-ninaBlock">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => {
                  setDifferOpen(!differOpen);
                  setFaq2Open(false);
                  if (checkOpen) setCheckOpen(false);
                }}>
                <div className="flex items-center gap-3">
                  <XCircleFill className="text-red-500 w-4 h-4" />
                  <div className="text-base font-bold">
                    Je n’ai <strong>pas</strong> effectué mon recensement citoyen
                  </div>
                </div>
                <FiChevronDown className={`text-gray-400 w-6 h-6 cursor-pointer hover:scale-105 ${differOpen ? "rotate-180" : ""}`} />
              </div>
              {differOpen ? (
                <>
                  <div className="text-sm leading-5 font-medium text-gray-800 mt-3 px-3 text-justify">
                    Recensez-vous auprès de votre mairie ou en ligne à partir de vos 16 ans, vous recevez votre convocation à la JDC.
                  </div>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.service-public.fr/particuliers/vosdroits/F870"
                    className="text-sm px-3 leading-5 cursor-pointer underline text-blue-600 hover:underline mt-1.5">
                    En savoir plus sur le recensement
                  </a>
                  <div className="text-[13px] px-3 leading-5 text-gray-500 mt-3 text-justify">
                    <RiErrorWarningFill className="w-4 h-4 inline mr-1 align-text-bottom" />
                    Attention, si vous n’avez pas pu participer à la Journée défense et mémoire (JDM), vous devrez tout de même réaliser votre JDC.
                  </div>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
                    className="text-sm px-3 leading-5 cursor-pointer underline text-blue-600 hover:underline">
                    En savoir plus
                  </a>
                  <div className="w-full rounded-lg bg-gray-100 mt-3 py-3 px-2 cursor-pointer ">
                    <div className="text-sm px-2 leading-6 font-medium" onClick={() => setFaq2Open(!Faq2Open)}>
                      Vous ne souhaitez par réaliser votre JDC ?
                    </div>
                    {Faq2Open ? (
                      <>
                        <div className="text-[13px] px-2 leading-5 text-gray-500 text-justify mt-1">
                          Transmettez votre attestation de réalisation de la phase 1 à votre CSNJ pour obtenir votre certificat de participation à la JDC.
                        </div>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href="https://support.snu.gouv.fr/base-de-connaissance/journee-defense-et-citoyennete"
                          className="text-sm px-2 leading-5 cursor-pointer underline text-blue-600 hover:underline mt-1.5">
                          En savoir plus sur la procédure
                        </a>
                      </>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-col text-center gap-4 items-center rounded-lg justify-between bg-gray-100 mb-4 px-2 py-5">
          <div className="w-full lg:w-2/3 text-xl leading-7 font-bold">
            Et maintenant, votre parcours d’engagement se poursuit désormais avec la phase 2, la mission d’intérêt général
          </div>
          <button
            className="bg-blue-600 border-[1px] border-blue-600 hover:bg-white text-white hover:!text-blue-600 text-sm leading-5 font-medium py-2 px-4 rounded-lg transition duration-100 ease-in-out"
            onClick={() => {
              plausibleEvent("Phase2/CTA - Realiser ma mission");
              history.push("/phase2");
            }}>
            Je trouve une mission d’intérêt général
          </button>
        </div>
      </div>
      <InfoConvocation isOpen={modalOpen?.isOpen} onCancel={() => setModalOpen({ isOpen: false })} />
    </>
  );
}
