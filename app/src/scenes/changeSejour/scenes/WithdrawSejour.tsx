import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import useAuth from "@/services/useAuth";
import { HiArrowLeft } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { WITHRAWN_REASONS, YOUNG_STATUS_PHASE1, translate } from "snu-lib";
import ReasonMotifSection from "../components/ReasonMotifSection";
import CurrentSejourNotice from "../components/CurrentSejourNotice";
import { withdrawYoungAccount } from "@/services/young.service";
import { setYoung } from "../../../redux/auth/actions";
import { useDispatch } from "react-redux";
export default function WithdrawSejour() {
  const dispatch = useDispatch();
  const { young } = useAuth();
  const history = useHistory();
  const [withdrawnMessage, setWithdrawnMessage] = useState("");
  const [withdrawnReason, setWithdrawnReason] = useState("");
  const filteredWithdrawnReasons = WITHRAWN_REASONS.filter(
    (r) =>
      (!r.phase2Only || young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE || young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED) &&
      (!r.cohortOnly || r.cohortOnly.includes(young.cohort)),
  );

  const handleWithdraw = async () => {
    try {
      const { ok, data, code } = await withdrawYoungAccount({ withdrawnMessage, withdrawnReason });
      if (!ok) return toastr.error("Une erreur est survenu lors du traitement de votre demande :", translate(code));
      dispatch(setYoung(data));
      history.push("/");
    } catch (error) {
      console.error("Erreur lors du désistement :", error);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center bg-white pb-12 px-4 md:px-[8rem]">
      <div className="w-full flex items-center justify-between py-4">
        <button onClick={() => history.push("/changer-de-sejour/no-date")} className="flex items-center gap-1 mr-2">
          <HiArrowLeft className="text-xl text-gray-500" />
        </button>
        <h1 className="text-2xl font-bold text-center">Se désister</h1>
        <div></div>
      </div>
      <CurrentSejourNotice />
      <hr />
      <p className="mt-4 mb-6 text-sm leading-5 text-[#6B7280] font-normal">Veuillez précisez la raison de votre désistement.</p>

      <ReasonMotifSection
        filteredWithdrawnReasons={filteredWithdrawnReasons}
        withdrawnReason={withdrawnReason}
        setWithdrawnReason={setWithdrawnReason}
        withdrawnMessage={withdrawnMessage}
        setWithdrawnMessage={setWithdrawnMessage}
      />

      <button
        onClick={handleWithdraw}
        className="mt-4 w-1/2 rounded-[10px] border-[1px] border-blue-600 bg-blue-600 py-2.5 px-3 text-sm font-medium leading-5 text-white transition duration-150 ease-in-out hover:bg-white hover:!text-blue-600">
        Confirmer le désistement
      </button>
    </div>
  );
}
