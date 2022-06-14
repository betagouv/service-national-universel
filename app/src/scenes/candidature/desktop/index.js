import React from "react";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";

import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import Medaille from "../../../assets/icons/Medaille";
import api from "../../../services/api";
import CardMission from "./components/CardCandidature";
import { copyToClipboard } from "../../../utils";
import Loader from "../../../components/Loader";

export default function IndexDesktop() {
  const young = useSelector((state) => state.Auth.young);
  const [applications, setApplications] = React.useState();
  const [equivalences, setEquivalences] = React.useState();

  const [referentManagerPhase2, setReferentManagerPhase2] = React.useState();
  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
    })();
  }, []);
  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/application`);
      if (ok) return setApplications(data);
    })();
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, []);

  if (!applications || !equivalences) return <Loader />;

  return (
    <div className="bg-white mx-4 pb-12 my-3 rounded-lg w-full">
      {/* BEGIN HEADER */}
      <div className="bg-gray-700 rounded-t-lg flex">
        <div className="p-14 flex-1">
          <div className="text-white font-bold text-3xl">Il vous reste {Math.max(0, 84 - Number(young.phase2NumberHoursDone))}h à effectuer</div>
          <div className="text-gray-300 text-sm mt-2 mb-4">
            <div>L&apos;ordre de vos choix de missions sera pris en compte pour l&apos;attribution de votre MIG.</div>
            <div>Pour modifier l&apos;ordre, attrapez la droite du bloc et déplacez-le.</div>
          </div>
        </div>
        <img className="rounded-t-lg" src={require("../../../assets/phase2Header.png")} />
      </div>
      {/* END HEADER */}

      {/* BEGIN CANDIDATURES */}
      <div className="flex flex-col items-center px-14 -translate-y-4 space-y-4">
        {(applications || [])
          .sort((a, b) => a.priority - b.priority)
          .map((application) => (
            <CardMission key={application._id} application={application} />
          ))}
      </div>
      {/* END CANDIDATURES */}
    </div>
  );
}
