import React, { useEffect, useState, useImperativeHandle, forwardRef, useCallback, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineExclamation, HiOutlineEye, HiPencil, HiOutlineInformationCircle, HiOutlineFolderOpen } from "react-icons/hi";
import { LuSend } from "react-icons/lu";

import { Checkbox } from "@snu/ds";
import { Button, Collapsable, Container, Label, Select, SelectOption, Tooltip, Modal, Switcher } from "@snu/ds/admin";

import { CampagneJeuneType, DestinataireListeDiffusion, hasCampagneGeneriqueId, CampagneEnvoi, Programmation, CAMPAGNE_TYPE_COLORS } from "snu-lib";

import { useListeDiffusion } from "../listeDiffusion/ListeDiffusionHook";
import DestinataireCount from "./partials/DestinataireCount";
import DestinataireLink from "./partials/DestinataireLink";
import ProgrammationList from "./ProgrammationList";
import { CampagneEnvoiStatus } from "./partials/CampagneEnvoiStatus";

export interface ValidationErrors {
  templateId?: boolean;
}

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
  envois: CampagneEnvoi[] | undefined;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  validationErrors?: ValidationErrors;
  isProgrammationActive?: boolean;
  programmations?: Programmation[];
  isArchived?: boolean;
}

export type DraftCampagneSpecifiqueFormData = Partial<CampagneSpecifiqueFormData> & {
  cohortId: string;
};

interface ListeDiffusionOption {
  value: string;
  label: string;
}

export interface CampagneSpecifiqueFormProps {
  campagneData: DraftCampagneSpecifiqueFormData & { envois?: CampagneEnvoi[] | undefined };
  listeDiffusionOptions: ListeDiffusionOption[];
  onSave: (data: CampagneSpecifiqueFormData & { generic: false }) => void;
  onCancel: () => void;
  onSend: (id: string, disableProgrammation?: boolean) => void;
  onSendTest: (id: string) => void;
  forceOpen?: boolean;
  onToggleArchive?: (campagne: DraftCampagneSpecifiqueFormData & { envois?: CampagneEnvoi[] | undefined }) => void;
}

export interface CampagneSpecifiqueFormRefMethods {
  resetForm: (data: CampagneSpecifiqueFormData) => void;
}

const recipientOptions = [
  { value: DestinataireListeDiffusion.JEUNES, label: "Jeunes", withCount: true },
  { value: DestinataireListeDiffusion.REPRESENTANTS_LEGAUX, label: "Représentants légaux", withCount: true },
  { value: DestinataireListeDiffusion.REFERENTS_CLASSES, label: "Référents de classes" },
  { value: DestinataireListeDiffusion.CHEFS_ETABLISSEMENT, label: "Chefs d'établissement" },
  { value: DestinataireListeDiffusion.CHEFS_CENTRES, label: "Chefs de centres" },
  { value: DestinataireListeDiffusion.COORDINATEURS_CLE, label: "Coordinateurs CLE" },
];

export const CampagneSpecifiqueForm = forwardRef<CampagneSpecifiqueFormRefMethods, CampagneSpecifiqueFormProps>(
  ({ campagneData, listeDiffusionOptions, onSave, onCancel, onSend, forceOpen = false, onToggleArchive, onSendTest }, ref) => {
    const {
      control,
      handleSubmit,
      formState: { errors, isDirty, isSubmitting },
      reset,
      watch,
      setValue,
      setError,
      clearErrors,
    } = useForm<CampagneSpecifiqueFormData>({
      defaultValues: {
        type: CampagneJeuneType.VOLONTAIRE,
        destinataires: [DestinataireListeDiffusion.JEUNES],
        ...campagneData,
      },
    });
    const { listesDiffusion } = useListeDiffusion();
    const listeDiffusionId = watch("listeDiffusionId");
    const currentListeDiffusion = useMemo(() => listesDiffusion.find((liste) => liste.id === listeDiffusionId), [listesDiffusion, listeDiffusionId]);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSendCampagneModalOpen, setIsSendCampagneModalOpen] = useState(false);
    const [keepProgrammationActive, setKeepProgrammationActive] = useState(campagneData.isProgrammationActive);

    const setApiErrors = useCallback(
      (validationErrors?: ValidationErrors) => {
        clearErrors();

        if (!validationErrors) return;

        if (validationErrors.templateId) {
          setError("templateId", {
            type: "api",
            message: "L'ID du template n'est pas correct",
          });
        }
      },
      [clearErrors, setError],
    );

    useImperativeHandle(ref, () => ({
      resetForm: (data: CampagneSpecifiqueFormData) => {
        const { validationErrors, ...restData } = data;
        reset(restData);

        // Application des erreurs d'API après reset
        if (validationErrors) {
          setApiErrors(validationErrors);
        }
      },
    }));

    useEffect(() => {
      reset({
        type: CampagneJeuneType.VOLONTAIRE,
        destinataires: [DestinataireListeDiffusion.JEUNES],
        ...campagneData,
      });

      // Application des erreurs d'API lors du chargement initial
      if (campagneData.validationErrors) {
        setApiErrors(campagneData.validationErrors);
      }
    }, [campagneData, reset, setApiErrors]);

    // Le formulaire est ouvert s'il est nouveau ou s'il contient des erreurs ou si forceOpen est true
    const isOpen = campagneData.id === undefined || Object.keys(errors).length > 0 || forceOpen;

    const handleOnCancel = () => {
      reset();
      onCancel();
      setIsConfirmModalOpen(false);
      setIsSendCampagneModalOpen(false);
    };

    const handleOnSave = (data: CampagneSpecifiqueFormData) => {
      onSave({ ...data, generic: false });
      setIsConfirmModalOpen(false);
    };

    const handleConfirmSubmit = (data: CampagneSpecifiqueFormData) => {
      if (hasCampagneGeneriqueId(campagneData)) {
        setIsConfirmModalOpen(true);
      } else {
        handleOnSave(data);
      }
    };

    const handleSendCampagne = () => {
      setIsSendCampagneModalOpen(true);
    };

    const handleConfirmSendCampagne = () => {
      setIsSendCampagneModalOpen(false);
      if (campagneData.id && campagneData.programmations && campagneData.programmations.length > 0) {
        onSend(campagneData.id, keepProgrammationActive);
      }
      if (campagneData.id && campagneData.programmations && campagneData.programmations.length === 0) {
        onSend(campagneData.id, undefined);
      }
    };

    const handleToggleArchive = () => {
      if (campagneData.id && onToggleArchive) {
        onToggleArchive(campagneData);
      }
    };

    const handleSendTest = () => {
      if (campagneData.id) {
        onSendTest(campagneData.id);
      }
    };

    const isNotSaved = isDirty && !isSubmitting;
    const hasCampagneGenerique = hasCampagneGeneriqueId(campagneData);
    const templateErrorMessage = errors.templateId?.type === "api" ? errors.templateId.message : undefined;

    return (
      <>
        <Container className={`pb-2 pt-2 mb-2 ${isDirty ? "border-2 border-blue-600" : "border-2"}`}>
          <Collapsable
            open={isOpen}
            header={
              <div className="flex w-full gap-16 p-2 pr-8 pb-0 items-center">
                <div className="flex-1">
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
                  {hasCampagneGenerique ? (
                    <div className="flex items-center mt-2 gap-2">
                      <div
                        className="flex flex-row justify-center items-center px-1.5 py-1.5 rounded text-xs"
                        style={{ backgroundColor: CAMPAGNE_TYPE_COLORS.GENERIQUE.BACKGROUND, color: CAMPAGNE_TYPE_COLORS.GENERIQUE.TEXT }}>
                        GÉNÉRIQUE
                      </div>
                      <a
                        href={`/plan-marketing/campagnes-generiques?id=${campagneData.campagneGeneriqueId}`}
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                        Editer la campagne globale
                        <HiPencil className="my-2 w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center mt-2 ">
                      <div
                        className="flex flex-row justify-center items-center px-1.5 py-1.5 rounded text-xs"
                        style={{ backgroundColor: CAMPAGNE_TYPE_COLORS.SPECIFIQUE.BACKGROUND, color: CAMPAGNE_TYPE_COLORS.SPECIFIQUE.TEXT }}>
                        SPECIFIQUE
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <CampagneEnvoiStatus envois={campagneData.envois} campagneId={campagneData.id} />
                </div>
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
                        closeMenuOnSelect={true}
                        isOptionDisabled={(option) => !!option.disabled}
                      />
                    )}
                  />
                  {errors.listeDiffusionId && <span className="text-red-500 text-sm mt-1">{errors.listeDiffusionId.message}</span>}
                </div>

                <div>
                  <div className="flex gap-2">
                    <Label title="ID du template Brevo" name="templateId" className="mb-2 flex items-center font-medium !text-sm" />
                    <Tooltip id="id-template-brevo" title="Saisissez l'id du template Brevo" className="mb-1.5">
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
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.templateId || templateErrorMessage ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    )}
                  />
                  {errors.templateId && <span className="text-red-500 text-sm mt-1">{errors.templateId.message}</span>}
                  <div className="flex mt-2 justify-between">
                    <a href={`/email-preview/${watch("templateId")}`} target="_blank" rel="noreferrer" className="text-blue-600 inline-flex items-center">
                      Voir l'aperçu
                      <HiOutlineEye className="ml-1" size={18} />
                    </a>
                    {campagneData.id && (
                      <div className="flex items-center gap-2">
                        <p onClick={handleSendTest} className="text-blue-600 inline-flex items-center hover:text-blue-800 hover:cursor-pointer">
                          Envoyer un test
                        </p>
                        <Tooltip id="id-send-mail-test" title="Le test sera envoyé sur l’adresse mail de votre compte.">
                          <HiOutlineInformationCircle className="text-blue-600" size={18} />
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-16">
                <div>
                  <div className="flex items-center gap-2">
                    <Label title="Destinataires" name="destinataires" className="mb-2 flex items-center font-medium !text-sm" />
                    <Tooltip id="id-destinataires" title="Sélectionnez les destinataires de cette campagne" className="mb-1.5">
                      <HiOutlineInformationCircle className="text-gray-400" size={20} />
                    </Tooltip>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-5">
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
                              <span>
                                {option.label}
                                {option.withCount && field.value?.includes(option.value) && (
                                  <DestinataireCount type={option.value} cohortId={campagneData.cohortId} listeDiffusion={currentListeDiffusion} />
                                )}
                              </span>
                            </label>
                          ))}
                        </>
                      )}
                    />
                  </div>
                  {errors.destinataires && <span className="text-red-500 text-sm mt-1">{errors.destinataires.message}</span>}
                  {currentListeDiffusion?.filters && <DestinataireLink listeDiffusion={currentListeDiffusion} cohortId={campagneData.cohortId} />}
                </div>

                <div>
                  <div className="flex gap-2">
                    <Label title="Objet de la campagne" name="objet" className="mb-2 flex items-center font-medium !text-sm" />
                    <Tooltip id="id-objet" title="Saisissez l'objet du mail de la campagne" className="mb-1.5">
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

              <div className="col-span-2 mt-6">
                <ProgrammationList
                  campagne={{
                    ...watch(),
                    id: campagneData.id || "",
                    programmations: watch("programmations") || [],
                    isProgrammationActive: watch("isProgrammationActive") || false,
                  }}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      setValue("programmations", value, { shouldDirty: true });
                    } else {
                      setValue("isProgrammationActive", value.isProgrammationActive, { shouldDirty: true });
                    }
                  }}
                />
              </div>
            </div>

            <hr className="border-t border-gray-200" />
            <div className="flex justify-end mt-4 gap-2">
              <div className="flex-1 flex">
                {campagneData.id && onToggleArchive && (
                  <Button
                    leftIcon={<HiOutlineFolderOpen className="text-gray-600" />}
                    onClick={handleToggleArchive}
                    type="secondary"
                    className="mr-auto"
                    title={campagneData.isArchived ? "Désarchiver" : "Archiver"}
                    disabled={isSubmitting}
                  />
                )}
              </div>
              {isNotSaved && (
                <div className="flex items-center gap-2 text-gray-500">
                  <HiOutlineExclamation className="w-5 h-5" />
                  <span>Non enregistrée</span>
                </div>
              )}
              {isDirty ? <Button title="Annuler" type="secondary" className="flex justify-center" onClick={handleOnCancel} disabled={isSubmitting} /> : null}
              <div className="flex flex-row gap-4">
                <Button
                  disabled={isSubmitting || !isDirty}
                  type="wired"
                  className="flex items-center gap-2 px-6 py-2 rounded-md"
                  title="Enregistrer pour ce séjour"
                  onClick={handleSubmit(handleConfirmSubmit)}
                />
                <Button
                  leftIcon={<LuSend className="w-5 h-5" />}
                  title={`${campagneData.envois && campagneData.envois.length > 0 ? "Renvoyer la campagne" : "Envoyer la campagne"}`}
                  className={`${isDirty ? "bg-gray-300" : "bg-green-700"} flex-1`}
                  onClick={handleSubmit(handleSendCampagne)}
                  loading={isSubmitting}
                  disabled={isDirty}
                />
              </div>
            </div>
          </Collapsable>
        </Container>
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={handleOnCancel}
          className="max-w-lg"
          header={
            <div className="text-center">
              <HiOutlineExclamation className="bg-gray-100 rounded-full p-2 text-gray-900 mx-auto mb-2" size={48} />
              <h3 className="text-xl font-medium">Modification d'une campagne spécifique</h3>
            </div>
          }
          content={
            <div className="text-center my-4">
              <p>La campagne spécifique sera détachée de la campagne générique</p>
            </div>
          }
          footer={
            <div className="flex items-center justify-between gap-6">
              <Button title="Fermer" type="secondary" className="flex-1 justify-center" onClick={() => setIsConfirmModalOpen(false)} disabled={isSubmitting} />
              <Button title="Enregistrer pour ce séjour" className="flex-1" onClick={handleSubmit(handleOnSave)} loading={isSubmitting} />
            </div>
          }
        />
        <Modal
          isOpen={isSendCampagneModalOpen}
          onClose={handleOnCancel}
          className="max-w-lg"
          header={
            <div className="text-center">
              <HiOutlineExclamation className="bg-gray-100 rounded-full p-2 text-gray-900 mx-auto mb-2" size={48} />
              <h3 className="text-xl font-medium">Envoi manuel de la campagne spécifique</h3>
            </div>
          }
          content={
            <div className="text-center my-4">
              <p>Vous êtes sur le point d'envoyer la campagne {campagneData.nom}</p>
              {campagneData.programmations && campagneData.programmations.length > 0 && (
                <div className="mt-6">
                  <p className="mb-4">
                    {campagneData.isProgrammationActive ? "La programmation de la campagne doit-elle rester active ?" : "La programmation de la campagne doit-elle être activée ?"}
                  </p>
                  <div className="flex justify-center">
                    <Switcher label="Active" value={campagneData.isProgrammationActive} onChange={(value) => setKeepProgrammationActive(value)} />
                  </div>
                </div>
              )}
            </div>
          }
          footer={
            <div className="flex items-center justify-between gap-6">
              <Button title="Annuler" type="secondary" className="flex-1 justify-center" onClick={() => setIsSendCampagneModalOpen(false)} disabled={isSubmitting} />
              <Button title="Envoyer la campagne" className="flex-1" onClick={handleSubmit(handleConfirmSendCampagne)} loading={isSubmitting} />
            </div>
          }
        />
      </>
    );
  },
);

CampagneSpecifiqueForm.displayName = "CampagneSpecifiqueForm";
