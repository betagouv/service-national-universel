import React, { useCallback } from "react";
import { RecipientType } from "@/hooks/useBrevoRecipients";

interface Recipient {
  id: RecipientType;
  label: string;
  column: "left" | "right";
}

const RECIPIENTS: Recipient[] = [
  { id: "jeunes", label: "Jeunes", column: "left" },
  { id: "referents", label: "Référents de classes", column: "left" },
  { id: "chefs-etablissement", label: "Chefs d'établissement", column: "left" },
  { id: "representants", label: "Représentants légaux", column: "right" },
  { id: "chefs-centres", label: "Chefs de centres", column: "right" },
  { id: "administrateurs", label: "Coordinateurs CLE", column: "right" },
] as const;

export const DEFAULT_SELECTED_RECIPIENTS = ["jeunes", "representants"] as const;

interface RecipientsSelectionProps {
  selectedRecipients: RecipientType[];
  onToggleRecipient: (recipientId: RecipientType) => void;
  error?: string;
}

export const RecipientsSelection = ({ selectedRecipients, onToggleRecipient, error }: RecipientsSelectionProps) => {
  const renderColumn = useCallback(
    (column: "left" | "right") => (
      <div className="space-y-3">
        {RECIPIENTS.filter((recipient) => recipient.column === column).map((recipient) => (
          <label key={recipient.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={selectedRecipients.includes(recipient.id)}
              onChange={() => onToggleRecipient(recipient.id)}
              className={`w-4 h-4 text-blue-600 ${error ? "border-red-500" : ""}`}
            />
            <span>{recipient.label}</span>
          </label>
        ))}
      </div>
    ),
    [selectedRecipients, onToggleRecipient, error],
  );

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {renderColumn("left")}
        {renderColumn("right")}
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};
