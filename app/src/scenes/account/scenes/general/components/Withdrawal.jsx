import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { YOUNG_STATUS } from "snu-lib";
import WithdrawalModal from "../../../components/WithdrawalModal";

const Withdrawal = ({ young }) => {
  const inscriptionStatus = [YOUNG_STATUS.IN_PROGRESS, YOUNG_STATUS.WAITING_VALIDATION, YOUNG_STATUS.WAITING_CORRECTION].includes(young.status);
  const getWithdrawalButtonLabel = () => (inscriptionStatus ? "Abandonner mon inscription" : "Se désister du SNU");

  const search = useLocation().search;
  const isWithdrawalModalOpenDefault = new URLSearchParams(search).get("desistement") === "1";
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(isWithdrawalModalOpenDefault);

  const handleWithdrawal = () => setIsWithdrawalModalOpen(true);

  const handleCancelWithdrawal = () => setIsWithdrawalModalOpen(false);

  return (
    <>
      <button type="button" onClick={handleWithdrawal} className="flex appearance-none items-center gap-2 text-sm text-red-600">
        {getWithdrawalButtonLabel()}
      </button>
      <WithdrawalModal isOpen={isWithdrawalModalOpen} onCancel={handleCancelWithdrawal} young={young} />
    </>
  );
};

export default Withdrawal;
