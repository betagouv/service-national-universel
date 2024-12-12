import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { YOUNG_STATUS } from "snu-lib";
import WithdrawalModal from "../../../components/WithdrawalModal";
import { useAuth } from "@/services/useAuth";

const Withdrawal = ({ young }) => {
  const inscriptionStatus = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);
  const getWithdrawalButtonLabel = () => (inscriptionStatus ? "Abandonner mon inscription" : "Se désister du SNU");
  const { isCLE } = useAuth();
  const search = useLocation().search;
  const isWithdrawalModalOpenDefault = new URLSearchParams(search).get("desistement") === "1";
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(isWithdrawalModalOpenDefault);

  const handleCancelWithdrawal = () => setIsWithdrawalModalOpen(false);

  return (
    <>
      {isCLE ? (
        <Link
          to={{
            pathname: "/changer-de-sejour/se-desister",
            state: { backlink: "/account/withdrawn" },
          }}
          className="w-full md:w-fit flex appearance-none items-center justify-center gap-2 py-2 px-4 rounded-md text-sm bg-red-600 text-white">
          {getWithdrawalButtonLabel()}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setIsWithdrawalModalOpen(true)}
          className="w-full md:w-fit flex appearance-none items-center justify-center gap-2 py-2 px-4 rounded-md text-sm bg-red-600 text-white">
          {getWithdrawalButtonLabel()}
        </button>
      )}
      <WithdrawalModal isOpen={isWithdrawalModalOpen} onCancel={handleCancelWithdrawal} young={young} />
    </>
  );
};

export default Withdrawal;
