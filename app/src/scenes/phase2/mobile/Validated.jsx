import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import Trophy from "../../../assets/icons/Trophy";
import Loader from "../../../components/Loader";
import api from "../../../services/api";
import { translate } from "../../../utils";
import downloadPDF from "../../../utils/download-pdf";
import CardEquivalence from "./components/CardEquivalence";
import CardMission from "./components/CardMission";
import ChevronDown from "../../../assets/icons/ChevronDown";
import Download from "../../../assets/icons/Download";
import { FiMail } from "react-icons/fi";
import Voiture from "../../../assets/Voiture";
import { capture } from "../../../sentry";

export default function ValidatedMobile() {
  const young = useSelector((state) => state.Auth.young);
  const [equivalences, setEquivalences] = React.useState();
  const [applications, setApplications] = React.useState();
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
    <div className="mb-4 w-full flex-col rounded-lg bg-white shadow-nina">
      <div className="flex justify-between pt-4">
        <div className="flex w-2/3 flex-col">
          <Trophy className="h-16" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="ml-4 text-3xl leading-tight ">
              <strong>{young.firstName},</strong> vous avez validé votre Phase 2&nbsp;!
            </div>
            <div className="ml-4 text-sm font-normal leading-5 text-gray-500">Bravo pour votre engagement.</div>
          </div>
        </div>
        <div className="flex">
          <img className="object-scale-down" src={require("../../../assets/validatedPhase2Mobile.png")} />
        </div>
      </div>
      <div className="mx-4 my-5">
        <div className="mt-6 flex w-full flex-col gap-7">
          {/* Bouton attestation phase 2 */}

          <div className="relative" ref={refAttestationButton}>
            <button
              disabled={loading.attestationPhase2}
              className="flex w-full items-center justify-between gap-3 rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 disabled:cursor-wait disabled:opacity-50"
              onClick={() => setOpenAttestationButton((e) => !e)}>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-xs font-medium leading-4 text-white">Attestation de réalisation phase 2</span>
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
                  viewAttestation({ uri: "2" });
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
                  sendAttestation({ type: "2", template: "certificate" });
                  setOpenAttestationButton(false);
                }}>
                <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                  <FiMail className="h-4 w-4 text-gray-400" />
                  <div>Envoyer par mail</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton attestation SNU */}

          <div className="relative" ref={refSNUButton}>
            <button
              disabled={loading.attestationSNU}
              className="flex w-full items-center justify-between gap-3 rounded-full border-[1px] border-blue-600 bg-blue-600 px-3 py-2 disabled:cursor-wait disabled:opacity-50"
              onClick={() => setOpenSNUButton((e) => !e)}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium leading-4 text-white">Attestation de réalisation SNU</span>
              </div>
              <ChevronDown className="font-medium text-white" />
            </button>
            {/* display options */}
            <div
              className={`${openSNUButton ? "block" : "hidden"}  absolute right-0 top-[40px] z-50 !min-w-full overflow-hidden rounded-lg bg-white shadow transition lg:!min-w-3/4`}>
              <div
                key="download"
                onClick={() => {
                  viewAttestation({ uri: "snu" });
                  setOpenSNUButton(false);
                }}>
                <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                  <Download className="h-4 w-4 text-gray-400" />
                  <div>Télécharger</div>
                </div>
              </div>
              <div
                key="email"
                onClick={() => {
                  sendAttestation({ type: "snu", template: "certificate" });
                  setOpenSNUButton(false);
                }}>
                <div className="group flex cursor-pointer items-center gap-3 p-2 px-3 text-sm leading-5 hover:bg-gray-50">
                  <FiMail className="h-4 w-4 text-gray-400" />
                  <div>Envoyer par mail</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="my-4 text-left text-lg font-bold leading-7">Mes missions réalisées</div>
        <div className="mt-12 flex flex-col gap-4">
          {equivalences.map((equivalence, index) => (
            <CardEquivalence key={index} equivalence={equivalence} young={young} />
          ))}
          <div className="flex w-full flex-wrap gap-8">
            {applications
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // afficher d'abord les candidatures mis a jour récemment
              .map((application) => (
                <CardMission key={application._id} application={application} />
              ))}
          </div>
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex w-full cursor-pointer rounded-lg border-[1px] border-gray-200 hover:border-gray-300">
              <a
                href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-1 items-start justify-between gap-1 p-3">
                <div className="flex-1 font-bold text-gray-800">J’ai des questions sur la mission d’intérêt général</div>
                <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
              </a>
            </div>
          </div>
          {/* Lien code de la route */}
          <div className="w-full cursor-pointer rounded-lg border-[1px] border-gray-200 hover:border-gray-300">
            <a
              href={`https://support.snu.gouv.fr/base-de-connaissance/permis-et-code-de-la-route`}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 flex-row items-start gap-1 p-3">
              <div className="mr-2 self-center">
                <Voiture />
              </div>
              <div className="w-full flex-row">
                <div className="flex flex-1 items-start justify-around">
                  <div className="flex-1 font-bold text-gray-800">N&apos;oubliez pas !</div>
                  <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
                </div>
                <div className="text-sm text-gray-600">
                  Vous bénéficiez d&apos;une première présentation <strong>gratuite</strong> à l&apos;examen du code de la route{" "}
                  <i>(sous condition d&apos;avoir également validé votre phase 1)</i>.
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
