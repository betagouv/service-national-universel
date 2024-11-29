import React from "react";
import Field from "../../../components/forms/inputs/Field";
import { WITHRAWN_REASONS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import useAuth from "@/services/useAuth";

interface ReasonMotifSectionProps {
  reason: string;
  setReason: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  text?: string;
}

const ReasonForm: React.FC<ReasonMotifSectionProps> = ({ reason, setReason, message, setMessage, onSubmit, disabled, text }) => {
  const { young } = useAuth();

  const filteredWithdrawnReasons = WITHRAWN_REASONS.filter(
    (r) =>
      (!r.phase2Only || young.statusPhase1 === YOUNG_STATUS_PHASE1.DONE || young.statusPhase1 === YOUNG_STATUS_PHASE1.EXEMPTED) &&
      (!r.cohortOnly || r.cohortOnly.includes(young.cohort)),
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit();
      }}>
      <Field
        className="w-full"
        type="select"
        options={filteredWithdrawnReasons}
        name="withdrawnReason"
        label="Motif"
        value={reason}
        onChange={setReason}
        transformer={(v) => WITHRAWN_REASONS.find((r) => r.value === v)?.label || ""}
      />
      <Field className="mt-4 w-full" type="textarea" name="withdrawnMessage" label="Expliquer votre choix (facultatif)" value={message} onChange={setMessage} />
      <button
        type="submit"
        disabled={disabled}
        className="w-full mt-4 rounded-md border-[1px] bg-blue-600 py-2.5 px-3 text-sm leading-5 text-white transition duration-300 ease-in-out hover:bg-blue-800 disabled:bg-gray-400">
        {text || "Envoyer ma demande"}
      </button>
      <button
        type="button"
        onClick={() => window.history.back()}
        className="w-full mt-2 rounded-md border-[1px] bg-[#ffffff] py-2.5 px-3 text-sm leading-5 text-gray-500 transition duration-300 ease-in-out hover:bg-gray-100">
        Annuler
      </button>
    </form>
  );
};

export default ReasonForm;
