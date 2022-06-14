import React from "react";
import { HiOutlineAdjustments, HiOutlineSearch } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";

import ArrowUpRight from "../../../assets/icons/ArrowUpRight";
import Medaille from "../../../assets/icons/Medaille";
import Loader from "../../../components/Loader";
import api from "../../../services/api";
import { copyToClipboard } from "../../../utils";
import CardCandidature from "./components/CardCandidature";

export default function IndexPhase2Mobile() {
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
    <div className="bg-white pb-5">
      {/* BEGIN HEADER */}
      <div className="bg-gray-700">
        <div className="px-4 pt-4 pb-3">
          <div className="text-white font-bold text-3xl">Il vous reste {Math.max(0, 84 - Number(young.phase2NumberHoursDone))}h à effectuer</div>
          <div className="text-gray-300 text-sm mt-2 mb-2 font-normal">
            <div>L&apos;ordre de vos choix de missions sera pris en compte pour l&apos;attribution de votre MIG.</div>
            <div>Pour modifier l&apos;ordre, attrapez la droite du bloc et déplacez-le.</div>
          </div>
        </div>
        <img className="rounded-t-lg w-full " src={require("../../../assets/phase2MobileHeader.png")} />
      </div>
      {/* END HEADER */}

      {/* BEGIN CANDIDATURES */}
      <div className="-translate-y-4 w-screen">
        <div className="px-3 pb-4 flex flex-col items-center space-y-4 w-full">
          {applications
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // afficher d'abord les candidatures mis a jour récemment
            .slice(0, 4) // afficher uniquement 4 candidatures
            .map((application) => (
              <CardCandidature key={application._id} application={application} />
            ))}
        </div>
      </div>
      {/* END CANDIDATURES */}
    </div>
  );
}
