import { Checkbox } from "@snu/ds";
import { Button, Collapsable, Container, Label, Select, SelectOption, Tooltip } from "@snu/ds/admin";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineExclamation, HiOutlineEye, HiPencil, HiOutlineInformationCircle } from "react-icons/hi";
import { CampagneJeuneType, DestinataireListeDiffusion, hasCampagneGeneriqueId } from "snu-lib";

/**
 * Interface pour une campagne spécifique sans référence
 * Contient tous les champs nécessaires pour le formulaire
 */
export interface CampagneSpecifiqueFormData {
  id?: string;
  nom: string;
  type: CampagneJeuneType;
  listeDiffusionId: string;
  templateId: number;
  objet: string;
  destinataires: DestinataireListeDiffusion[];
  contexte?: string;
  cohortId: string;
  campagneGeneriqueId?: string;
  generic: false;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export type DraftCampagneSpecifiqueFormData = Partial<CampagneSpecifiqueFormData> & {
  cohortId: string;
};

interface ListeDiffusionOption {
  value: string;
  label: string;
}

export interface CampagneSpecifiqueFormProps {
  campagneData: DraftCampagneSpecifiqueFormData;
  listeDiffusionOptions: ListeDiffusionOption[];
  onSave: (data: CampagneSpecifiqueFormData & { generic: false }) => void;
  onCancel: () => void;
}

const recipientOptions = [
  { value: DestinataireListeDiffusion.JEUNES, label: "Jeunes" },
  { value: DestinataireListeDiffusion.REPRESENTANTS_LEGAUX, label: "Représentants légaux" },
  { value: DestinataireListeDiffusion.REFERENTS_CLASSES, label: "Référents de classes" },
  { value: DestinataireListeDiffusion.CHEFS_ETABLISSEMENT, label: "Chefs d'établissement" },
  { value: DestinataireListeDiffusion.CHEFS_CENTRES, label: "Chefs de centres" },
  { value: DestinataireListeDiffusion.COORDINATEURS_CLE, label: "Coordinateurs CLE" },
];

export const CampagneSpecifiqueForm = ({ campagneData, listeDiffusionOptions, onSave, onCancel }: CampagneSpecifiqueFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<CampagneSpecifiqueFormData>({
    defaultValues: {
      type: CampagneJeuneType.VOLONTAIRE,
      destinataires: [DestinataireListeDiffusion.JEUNES],
      ...campagneData,
    },
  });

  useEffect(() => {
    reset({
      type: CampagneJeuneType.VOLONTAIRE,
      destinataires: [DestinataireListeDiffusion.JEUNES],
      ...campagneData,
    });
  }, [campagneData, reset]);

  const isEditing = campagneData.id !== undefined;
  const isOpen = campagneData.id === undefined || isDirty;

  const handleOnCancel = () => {
    reset();
    onCancel();
  };

  const handleOnSave = (data: CampagneSpecifiqueFormData) => {
    onSave({ ...data, generic: false });
    reset(data);
  };

  const isNotSaved = isDirty && !isSubmitting;
  const hasCampagneGenerique = hasCampagneGeneriqueId(campagneData);

  return (
    <Container className={`pb-2 pt-2 mb-2 ${isDirty ? "border-2 border-blue-600" : "border-2"}`}>
      <Collapsable
        open={isOpen}
        header={
          <div className="flex w-full gap-16 p-2 pr-8 pb-0 items-center">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <div className="text-xl font-medium">{campagneData.nom}</div>
                  {hasCampagneGenerique ? (
                    <a
                      href={`/plan-marketing/campagnes-generiques?id=${campagneData.campagneGeneriqueId}`}
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                      Editer la campagne globale
                      <HiPencil className="w-4 h-4" />
                    </a>
                  ) : null}
                </div>
              ) : (
                <>
                  <Label title="Nom de la campagne" name="nom" className="mb-2 flex items-center font-medium !text-sm" />
                  <Controller
                    name="nom"
                    control={control}
                    rules={{ required: "Ce champ est requis" }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nom ? "border-red-500" : "border-gray-300"}`}
                      />
                    )}
                  />
                  {errors.nom && <span className="text-red-500 text-sm mt-1">{errors.nom.message}</span>}
                </>
              )}
            </div>
            <div className="flex-1">{/* TODO: wrapper pour les labels des dates d'envoie et relances */}</div>
          </div>
        }>
        <div className="flex flex-col gap-6 p-2">
          <hr className="border-t border-gray-200" />

          <div className="grid grid-cols-2 gap-16">
            <div>
              <Label title="Liste de diffusion" name="listeDiffusion" className="mb-2 flex items-center font-medium !text-sm" />
              <Controller
                name="listeDiffusionId"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <Select
                    value={field.value ? listeDiffusionOptions.find((option) => option.value === field.value) : null}
                    onChange={(option: SelectOption<string>) => field.onChange(option.value)}
                    options={listeDiffusionOptions}
                    placeholder="Sélectionner une liste de diffusion"
                    className={`mt-2 ${errors.listeDiffusionId ? "border-red-500" : ""}`}
                  />
                )}
              />
              {errors.listeDiffusionId && <span className="text-red-500 text-sm mt-1">{errors.listeDiffusionId.message}</span>}
            </div>

            <div>
              <div className="flex gap-2">
                <Label title="ID du template Brevo" name="templateId" className="mb-2 flex items-center font-medium !text-sm" />
                <Tooltip id="id-template-brevo" title="L'ID du template Brevo">
                  <HiOutlineInformationCircle className="text-gray-400" size={20} />
                </Tooltip>
              </div>

              <Controller
                name="templateId"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.templateId ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.templateId && <span className="text-red-500 text-sm mt-1">{errors.templateId.message}</span>}
              <a href={`/email-preview/${watch("templateId")}`} target="_blank" rel="noreferrer" className="text-blue-600 inline-flex items-center mt-2">
                Voir l'aperçu
                <HiOutlineEye className="ml-1" size={18} />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-16">
            <div>
              <div className="flex gap-2">
                <Label title="Destinataires" name="destinataires" className="mb-2 flex items-center font-medium !text-sm" />
                <Tooltip id="id-destinataires" title="Sélectionnez les destinataires de cette campagne">
                  <HiOutlineInformationCircle className="text-gray-400" size={20} />
                </Tooltip>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <Controller
                  name="destinataires"
                  control={control}
                  rules={{ required: "Ce champ est requis" }}
                  render={({ field }) => (
                    <>
                      {recipientOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                          <Checkbox
                            checked={field.value?.includes(option.value)}
                            className={`w-4 h-4 text-blue-600 ${errors.destinataires ? "border-red-500" : ""}`}
                            onChange={() =>
                              field.onChange(field.value?.includes(option.value) ? field.value?.filter((v) => v !== option.value) : [...(field.value || []), option.value])
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </>
                  )}
                />
              </div>
              {errors.destinataires && <span className="text-red-500 text-sm mt-1">{errors.destinataires.message}</span>}
            </div>

            <div>
              <div className="flex gap-2">
                <Label title="Objet de la campagne" name="objet" className="mb-2 flex items-center font-medium !text-sm" />
                <Tooltip id="id-objet" title="Saisissez l'objet du mail de la campagne">
                  <HiOutlineInformationCircle className="text-gray-400" size={20} />
                </Tooltip>
              </div>

              <Controller
                name="objet"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.objet ? "border-red-500" : "border-gray-300"}`}
                  />
                )}
              />
              {errors.objet && <span className="text-red-500 text-sm mt-1">{errors.objet.message}</span>}
            </div>
          </div>
        </div>

        <hr className="border-t border-gray-200" />
        <div className="flex justify-end mt-4 gap-2">
          {isNotSaved && (
            <div className="flex items-center gap-2 text-gray-500">
              <HiOutlineExclamation className="w-5 h-5" />
              <span>Non enregistrée</span>
            </div>
          )}
          <Button title="Annuler" type="secondary" className="flex justify-center" onClick={handleOnCancel} disabled={isSubmitting} />
          <Button
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md"
            title="Enregistrer"
            onClick={handleSubmit(handleOnSave)}
          />
        </div>
      </Collapsable>
    </Container>
  );
};
