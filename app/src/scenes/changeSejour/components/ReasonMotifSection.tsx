import React from "react";
import Field from "./Fields";
import { WITHRAWN_REASONS } from "snu-lib";

interface ReasonMotifSectionProps {
  filteredWithdrawnReasons: Array<{ value: string; label: string }>;
  withdrawnReason: string;
  setWithdrawnReason: (value: string) => void;
  withdrawnMessage: string;
  setWithdrawnMessage: (value: string) => void;
}

const ReasonMotifSection: React.FC<ReasonMotifSectionProps> = ({ filteredWithdrawnReasons, withdrawnReason, setWithdrawnReason, withdrawnMessage, setWithdrawnMessage }) => {
  return (
    <div>
      <Field
        className="w-full"
        type="select"
        options={filteredWithdrawnReasons}
        name="withdrawnReason"
        label="Motif"
        value={withdrawnReason}
        onChange={setWithdrawnReason}
        transformer={(v) => WITHRAWN_REASONS.find((r) => r.value === v)?.label || ""}
      />
      <Field
        className="mt-4 w-full"
        type="textarea"
        name="withdrawnMessage"
        label="Expliquer votre choix (facultatif)"
        value={withdrawnMessage}
        onChange={(value: string) => setWithdrawnMessage(value)}
      />
    </div>
  );
};

export default ReasonMotifSection;
