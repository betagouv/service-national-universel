import React from "react";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import Trophy from "../../../assets/icons/Trophy";
import Loader from "../../../components/Loader";
import api from "../../../services/api";
import { copyToClipboard, translate } from "../../../utils";
import downloadPDF from "../../../utils/download-pdf";
import CardEquivalence from "./components/CardEquivalence";
import CardMission from "./components/CardMission";
import ChevronDown from "../../../assets/icons/ChevronDown";
import { FiMail } from "react-icons/fi";
import Download from "../../../assets/icons/Download";
import Voiture from "../../../assets/Voiture";
import { capture } from "../../../sentry";

export default function ValidatedDesktop() {
  const young = useSelector((state) => state.Auth.young);
  const [equivalences, setEquivalences] = React.useState();
  const [applications, setApplications] = React.useState();
  const [referentManagerPhase2, setReferentManagerPhase2] = React.useState();
  const [loading, setLoading] = React.useState({
    attestationPhase2: false,
    attestationSNU: false,
    mailPhase2: false,
    mailSNU: false,
  });
  const [openAttestationButton, setOpenAttestationButton] = React.useState(false);
  const [openSNUButton, setOpenSNUButton] = React.useState(false);

  const refAttestationButton = React.useRef();
  const refSNUButton = React.useRef();

  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/application`);
      if (ok) return setApplications(data.filter((applications) => applications.status === "DONE"));
    })();
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data.filter((eq) => eq.status === "VALIDATED"));
    })();
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
    })();
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (refAttestationButton.current && !refAttestationButton.current.contains(event.target)) {
        setOpenAttestationButton(false);
      }
      if (refSNUButton.current && !refSNUButton.current.contains(event.target)) {
        setOpenSNUButton(false);
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
      toastr.error("Erreur lors de l'envoi du document", translate(e.code));
    }
  };

  if (!applications || !equivalences) return <Loader />;

  return (
    <div className="flex-col rounded-lg bg-white shadow-nina mx-10 my-4 w-full">
      <div className="flex px-8 pt-14 justify-between flex-col-reverse items-start lg:!items-center lg:!flex-row">
        <div className="flex flex-col w-full lg:w-2/3">
          <div className="flex items-center lg:items-start">
            <Trophy />
            <div className="flex flex-col flex-1 gap-7">
              <div className="ml-4 text-[44px] leading-tight ">
                <strong>{young.firstName},</strong> vous avez validé
                <br />
                votre Phase 2&nbsp;!
              </div>
              <div className="ml-4 text-sm leading-5 font-normal text-gray-500">Bravo pour votre engagement.</div>
            </div>
          </div>
        </div>
        <div className="flex items-start justify-center lg:items-start flex-shrink-0 w-full lg:w-1/3">
          <img className="object-scale-down h-80" src={require("../../../assets/validatedPhase2.png")} />
        </div>
      </div>
      <div className="mx-10 mb-14">
        <div className="flex gap-7 mt-6 flex-col items-center  lg:!flex-row">
          {/* Bouton attestation phase 2 */}

          <div className="relative" ref={refAttestationButton}>
            <button
              disabled={loading.attestationPhase2}
              className="flex justify-between gap-3 items-center rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 hover:bg-blue-500 hover:border-blue-500 disabled:opacity-50 disabled:cursor-wait w-full"
              onClick={() => setOpenAttestationButton((e) => !e)}>
              <div className="flex items-center gap-2">
                <span className="text-white leading-4 text-xs font-medium">Attestation de réalisation phase 2</span>
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
                  viewAttestation({ uri: "2" });
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
                  sendAttestation({ type: "2", template: "certificate" });
                  setOpenAttestationButton(false);
                }}>
                <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                  <FiMail className="text-gray-400 w-4 h-4" />
                  <div>Envoyer par mail</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton attestation SNU */}

          <div className="relative" ref={refSNUButton}>
            <button
              disabled={loading.attestationSNU}
              className="flex justify-between gap-3 items-center rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 hover:bg-blue-500 hover:border-blue-500 disabled:opacity-50 disabled:cursor-wait w-full"
              onClick={() => setOpenSNUButton((e) => !e)}>
              <div className="flex items-center gap-2">
                <span className="text-white leading-4 text-xs font-medium">Attestation de réalisation SNU</span>
              </div>
              <ChevronDown className="text-white font-medium" />
            </button>
            {/* display options */}
            <div
              className={`${openSNUButton ? "block" : "hidden"}  rounded-lg !min-w-full lg:!min-w-3/4 bg-white transition absolute right-0 shadow overflow-hidden z-50 top-[40px]`}>
              <div
                key="download"
                onClick={() => {
                  viewAttestation({ uri: "snu" });
                  setOpenSNUButton(false);
                }}>
                <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                  <Download className="text-gray-400 w-4 h-4" />
                  <div>Télécharger</div>
                </div>
              </div>
              <div
                key="email"
                onClick={() => {
                  sendAttestation({ type: "snu", template: "certificate" });
                  setOpenSNUButton(false);
                }}>
                <div className="group flex items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50 cursor-pointer">
                  <FiMail className="text-gray-400 w-4 h-4" />
                  <div>Envoyer par mail</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-xl leading-7 font-bold mt-10 text-center lg:!text-left">Mes missions réalisées</div>
        <div className="flex flex-col gap-4 mt-4">
          {equivalences.map((equivalence, index) => (
            <CardEquivalence key={index} equivalence={equivalence} young={young} />
          ))}
          <div className="flex gap-8 w-full flex-wrap">
            {applications
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // afficher d'abord les candidatures mis a jour récemment
              .map((application) => (
                <CardMission key={application._id} application={application} />
              ))}
          </div>
          <div className="flex gap-2 mt-10 flew-wrap">
            <div className="flex w-1/2 border-[1px] border-gray-200 hover:border-gray-300 rounded-lg cursor-pointer">
              <a
                href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 gap-1 items-start justify-between p-3">
                <div className="font-bold flex-1 text-gray-800">J’ai des questions sur la mission d’intérêt général</div>
                <ArrowUpRight className="text-gray-400 text-2xl group-hover:scale-105" />
              </a>
            </div>
          </div>

          {/* Lien code de la route */}
          <div className="w-full border-[1px] border-gray-200 hover:border-gray-300 rounded-lg cursor-pointer">
            <a
              href={`https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-row flex-1 gap-1 items-start p-3">
              <div className="self-center mr-2">
                <Voiture />
              </div>
              <div className="w-full flex-row">
                <div className="flex flex-1 items-start justify-around">
                  <div className="font-bold flex-1 text-gray-800">N'oubliez pas !</div>
                  <ArrowUpRight className="text-gray-400 text-2xl group-hover:scale-105" />
                </div>
                <div className="text-sm text-gray-600">
                  Vous bénéficiez d'une première présentation <strong>gratuite</strong> à l'examen du code de la route{" "}
                  <i>(sous condition d'avoir également validé votre phase 1)</i>.
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
