import React, { useCallback } from "react";
import { Button, Modal, Label } from "@snu/ds/admin";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useForm, Controller } from "react-hook-form";
import { RecipientType } from "@/hooks/useBrevoRecipients";

interface ModalCreationListeBrevoProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: BrevoListData) => void;
  isLoadingProcess: boolean;
  youngCountFiltered: number;
}

export interface BrevoListData {
  name: string;
  campaignId: string;
  recipients: RecipientType[];
}

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

const DEFAULT_SELECTED_RECIPIENTS = ["jeunes", "representants"] as const;

export const ModalCreationListeBrevo = ({ isOpen, onClose, onConfirm, isLoadingProcess = false, youngCountFiltered }: ModalCreationListeBrevoProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<BrevoListData>({
    defaultValues: {
      name: "",
      campaignId: "",
      recipients: [...DEFAULT_SELECTED_RECIPIENTS],
    },
  });

  const recipients = watch("recipients");

  const toggleRecipient = useCallback(
    (recipientId: RecipientType) => {
      const currentRecipients = recipients;
      const newRecipients = currentRecipients.includes(recipientId) ? currentRecipients.filter((id) => id !== recipientId) : [...currentRecipients, recipientId];
      setValue("recipients", newRecipients);
    },
    [recipients, setValue],
  );

  const renderRecipientColumn = useCallback(
    (column: "left" | "right") => (
      <div className="space-y-3">
        {RECIPIENTS.filter((recipient) => recipient.column === column).map((recipient) => (
          <label key={recipient.id} className="flex items-center space-x-3">
            <input type="checkbox" checked={recipients.includes(recipient.id)} onChange={() => toggleRecipient(recipient.id)} className="w-4 h-4 text-blue-600" />
            <span>{recipient.label}</span>
          </label>
        ))}
      </div>
    ),
    [recipients, toggleRecipient],
  );

  const onSubmitForm = handleSubmit(async (data) => {
    await onConfirm(data);
    handleOnClose();
  });

  const handleOnClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleOnClose}
      className="md:max-w-[600px]"
      content={
        <form onSubmit={onSubmitForm} className="scroll-y-auto overflow-y-auto max-h-[80vh]">
          <div className="flex flex-col items-center text-center gap-6 mb-8">
            <h1 className="font-bold text-xl m-0">Créer une liste de diffusion Brevo</h1>
            <p className="text-gray-600">Il y a {youngCountFiltered} jeunes filtrés pour cette liste de diffusion.</p>
          </div>

          <div className="space-y-6">
            <div>
              <Label title="Dénomination de la liste de diffusion" tooltip="Dénomination de la liste de diffusion" name="name" className="text-gray-700 mb-2 flex items-center" />

              <Controller
                name="name"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.name && <span className="text-red-500 text-sm mt-1">{errors.name.message}</span>}
            </div>

            <div>
              <Label title="Identifiant de la campagne" tooltip="Identifiant de la campagne" name="campaignId" className="text-gray-700 mb-2 flex items-center" />
              <Controller
                name="campaignId"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.campaignId ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.campaignId && <span className="text-red-500 text-sm mt-1">{errors.campaignId.message}</span>}
            </div>

            <div>
              <Label title="Destinataires" tooltip="Destinataires" name="recipients" className="text-gray-700 mb-2 flex items-center" />

              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <Controller
                  name="recipients"
                  control={control}
                  rules={{
                    validate: (value) => value.length > 0 || "Sélectionnez au moins un destinataire",
                  }}
                  render={() => (
                    <>
                      {renderRecipientColumn("left")}
                      {renderRecipientColumn("right")}
                    </>
                  )}
                />
              </div>
              {errors.recipients && <span className="text-red-500 text-sm mt-1">{errors.recipients.message}</span>}
            </div>
          </div>
        </form>
      }
      footer={
        <div className="flex items-center justify-between gap-6">
          <Button title="Fermer" type="secondary" className="flex-1 justify-center" onClick={handleOnClose} disabled={isLoadingProcess} />
          <Button title="Envoyer la liste de diffusion" onClick={onSubmitForm} className="flex-1" loading={isLoadingProcess} />
        </div>
      }
    />
  );
};
