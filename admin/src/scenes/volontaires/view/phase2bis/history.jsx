import React, { useState, useEffect } from "react";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router";

import HistoricComponent from "../../../../components/views/Historic";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import YoungHeader from "../../../phase0/components/YoungHeader";
import LeftArrow from "../../../../assets/icons/ArrowNarrowLeft";

export default function history({ young, onChange }) {
  const [contract, setContract] = useState(null);
  const [application, setApplication] = useState(null);
  let { applicationId } = useParams();

  useEffect(() => {
    const getContract = async () => {
      if (!young) return;
      let { ok, data, code } = await api.get(`/application/${applicationId}/contract`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }

      setContract(data);
    };
    const getApplication = async () => {
      if (!young) return;
      let { ok, data, code } = await api.get(`/application/${applicationId}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }

      setApplication(data);
    };
    getApplication();
    getContract();
  }, []);

  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />

      <div className="p-[30px]">
        <div className="flex items-center gap-1 py-1 text-gray-600">
          <button
            onClick={history.goBack}
            className="flex h-8 w-8 items-center justify-center space-x-1 rounded-full border-[1px] border-gray-100 bg-gray-100 hover:border-gray-300">
            <LeftArrow stroke={"#374151"} width={15} />
          </button>
          <span>Historique de la candidature à : {application?.missionName}</span>
        </div>
        {application ? <HistoricComponent model="application" value={application} /> : null}
      </div>
      {contract ? (
        <div className="p-[30px]">
          <div className="py-1 text-gray-600">Historique du contrat</div>
          <HistoricComponent model="contract" value={contract} />
        </div>
      ) : null}
    </>
  );
}
