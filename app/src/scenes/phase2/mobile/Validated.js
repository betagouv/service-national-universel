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
import { Spinner } from "reactstrap";

export default function ValidatedMobile() {
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

  const viewAttestation = async ({ uri, button }) => {
    setLoading({ ...loading, [button]: true });
    await downloadPDF({
      url: `/young/${young._id}/documents/certificate/${uri}`,
      fileName: `${young.firstName} ${young.lastName} - attestation ${uri}.pdf`,
    });
    setLoading({ ...loading, [button]: false });
  };

  const sendAttestation = async ({ template, type, button }) => {
    setLoading({ ...loading, [button]: true });
    const { ok, code } = await api.post(`/young/${young._id}/documents/${template}/${type}/send-email`, {
      fileName: `${young.firstName} ${young.lastName} - ${template} ${type}.pdf`,
    });
    setLoading({ ...loading, [button]: false });
    if (ok) return toastr.success(`Document envoyé à ${young.email}`);
    else return toastr.error("Erreur lors de l'envoie du document", translate(code));
  };

  if (!applications || !equivalences) return <Loader />;
  return (
    <div className="flex-col rounded-lg bg-white shadow-nina w-full mb-4">
      <div className="flex pt-4 justify-between">
        <div className="flex flex-col w-2/3">
          <Trophy className="h-16" />
          <div className="flex flex-col flex-1 gap-3">
            <div className="ml-4 text-3xl leading-tight ">
              <strong>{young.firstName},</strong> vous avez validé votre Phase 2 !
            </div>
            <div className="ml-4 text-sm leading-5 font-normal text-gray-500">Bravo pour votre engagement.</div>
          </div>
        </div>
        <div className="flex">
          <img className="object-scale-down" src={require("../../../assets/validatedPhase2Mobile.png")} />
        </div>
      </div>
      <div className="mx-4 my-5">
        <div className="text-lg leading-7 font-bold text-left">Mes attestations</div>
        <div className="flex gap-7 mt-6 flex-col w-full">
          <div className="rounded-lg bg-gray-50 px-4 py-8">
            <div className="flex flex-col">
              <div className="text-sm leading-none font-normal text-gray-800 whitespace-nowrap">Attestation de réalisation de la Phase 2</div>
              <div className="flex items-center flex-1 mt-2 gap-x-4">
                <button
                  disabled={loading.attestationPhase2}
                  className="flex gap-2 items-center border-[1px] border-blue-600 rounded-md px-4 py-1.5 mt-3 justify-self-end bg-blue-600 text-white disabled:opacity-50 disabled:cursor-wait text-sm"
                  onClick={() => viewAttestation({ uri: "2", button: "attestationPhase2" })}>
                  {loading.attestationPhase2 ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : null} Télécharger
                </button>
                <button
                  disabled={loading.mailPhase2}
                  className="flex gap-2 items-center border-[1px] border-blue-600 rounded-md px-4 py-1.5 mt-3 justify-self-end text-blue-600 bg-white whitespace-nowrap disabled:opacity-50 disabled:cursor-wait text-sm"
                  onClick={() => sendAttestation({ type: "2", template: "certificate", button: "mailPhase2" })}>
                  {loading.mailPhase2 ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : null} Envoyer par mail
                </button>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 px-4 py-8">
            <div className="flex flex-col">
              <div className="text-sm leading-none font-normal text-gray-800 whitespace-nowrap">Attestation SNU</div>
              <div className="flex items-center flex-1 mt-2 gap-x-4">
                <button
                  disabled={loading.attestationSNU}
                  className="flex gap-2 items-center border-[1px] border-blue-600 rounded-md px-4 py-1.5 mt-3 justify-self-end bg-blue-600 text-white disabled:opacity-50 disabled:cursor-wait text-sm"
                  onClick={() => viewAttestation({ uri: "snu", button: "attestationSNU" })}>
                  {loading.attestationSNU ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : null} Télécharger
                </button>
                <button
                  disabled={loading.mailSNU}
                  className="flex gap-2 items-center border-[1px] border-blue-600 rounded-md px-4 py-1.5 mt-3 justify-self-end text-blue-600 bg-white whitespace-nowrap disabled:opacity-50 disabled:cursor-wait text-sm"
                  onClick={() => sendAttestation({ type: "snu", template: "certificate", button: "mailSNU" })}>
                  {loading.mailSNU ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : null} Envoyer par mail
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="text-lg leading-7 font-bold text-left my-4">Mes missions réalisées</div>
        <div className="flex flex-col gap-4 mt-12">
          {equivalences.map((equivalence, index) => (
            <CardEquivalence key={index} equivalence={equivalence} young={young} />
          ))}
          <div className="flex gap-8 w-full overflow-auto">
            {applications
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // afficher d'abord les candidatures mis a jour récemment
              .map((application) => (
                <CardMission key={application._id} application={application} />
              ))}
          </div>
          <div className="flex flex-col gap-4 mt-8">
            {referentManagerPhase2 ? (
              <div className="w-full border border-gray-200 rounded-lg py-2 px-3 flex flex-col justify-around">
                <div className="flex items-center justify-between">
                  <div className="font-bold">Contacter mon référent</div>
                  <MdOutlineContentCopy
                    className="text-gray-400 hover:text-blue-600 cursor-pointer"
                    onClick={() => {
                      copyToClipboard(referentManagerPhase2.email);
                      toastr.info("L'email de votre référent a été copié dans le presse-papier");
                    }}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {referentManagerPhase2.firstName} {referentManagerPhase2.lastName} - {referentManagerPhase2.email}
                </div>
              </div>
            ) : null}
            <div className="w-full flex border-[1px] border-gray-200 hover:border-gray-300 rounded-lg cursor-pointer">
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
        </div>
      </div>
    </div>
  );
}
