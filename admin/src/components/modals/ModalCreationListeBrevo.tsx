import React from "react";
import { Button, Modal, Label } from "@snu/ds/admin";
import { useForm, Controller } from "react-hook-form";
import { RecipientType } from "@/hooks/useBrevoRecipients";
import { RecipientsSelection } from "../list/RecipientsSelection";

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

const DEFAULT_SELECTED_RECIPIENTS = ["jeunes", "representants"] as const;

export const ModalCreationListeBrevo = ({ isOpen, onClose, onConfirm, isLoadingProcess = false, youngCountFiltered }: ModalCreationListeBrevoProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BrevoListData>({
    defaultValues: {
      name: "",
      campaignId: "",
      recipients: [...DEFAULT_SELECTED_RECIPIENTS],
    },
  });

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
              <div>
                <Label
                  title="Dénomination de la liste de diffusion"
                  tooltip="Saisissez un nom pour la liste de diffusion. Vous pourrez retrouver ce nom dans Brevo."
                  name="name"
                  className="text-gray-700 mb-2 flex items-center"
                />
              </div>
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
              <Label
                title="Identifiant de la campagne"
                tooltip="Saisissez l'ID de la campagne Brevo à laquelle la liste de diffusion sera associée."
                name="campaignId"
                className="text-gray-700 mb-2 flex items-center"
              />
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
              <Label title="Destinataires" tooltip="Sélectionnez la liste des destinataires de la campagne." name="recipients" className="text-gray-700 mb-2 flex items-center" />
              <Controller
                name="recipients"
                control={control}
                rules={{
                  validate: (value) => value.length > 0 || "Sélectionnez au moins un destinataire",
                }}
                render={({ field: { value, onChange } }) => (
                  <RecipientsSelection
                    selectedRecipients={value}
                    onToggleRecipient={(recipientId) => {
                      const newRecipients = value.includes(recipientId) ? value.filter((id) => id !== recipientId) : [...value, recipientId];
                      onChange(newRecipients);
                    }}
                    error={errors.recipients?.message}
                  />
                )}
              />

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
