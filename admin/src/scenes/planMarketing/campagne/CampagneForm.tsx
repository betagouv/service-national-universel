import RadioButton from "@/scenes/phase0/components/RadioButton";
import { Checkbox } from "@snu/ds";
import { Button, Collapsable, Container, InputText, Select, SelectOption, Tooltip } from "@snu/ds/admin";
import React from "react";
import { HiOutlineDocumentDuplicate, HiOutlineExclamation, HiOutlineEye, HiOutlineInformationCircle } from "react-icons/hi";
import { CampagneJeuneType, DestinataireListeDiffusion } from "snu-lib";
import { useCampagneForm } from "./CampagneFormHook";
import { useCampagneError } from "./CampagneHookError";

interface ListeDiffusionOption {
  value: string;
  label: string;
}

export interface CampagneDataProps {
  id: string;
  nom: string;
  type: CampagneJeuneType;
  listeDiffusionId: string;
  templateId: number;
  objet: string;
  generic: true;
  destinataires: DestinataireListeDiffusion[];
  contexte?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface DraftCampagneDataProps extends Partial<Omit<CampagneDataProps, "generic">> {
  generic: true;
}

export interface CampagneFormProps {
  campagneData: DraftCampagneDataProps;
  isDupliquerCampagneDisabled: boolean;
  listeDiffusionOptions: ListeDiffusionOption[];
  onSave: () => void;
  onDuplicate: (campagneData: CampagneDataProps) => void;
}

const recipientOptions = [
  { value: DestinataireListeDiffusion.JEUNES, label: "Jeunes" },
  { value: DestinataireListeDiffusion.REFERENTS_CLASSES, label: "Référents de classes" },
  { value: DestinataireListeDiffusion.CHEFS_ETABLISSEMENT, label: "Chefs d'établissement" },
  { value: DestinataireListeDiffusion.REPRESENTANTS_LEGAUX, label: "Représentants légaux" },
  { value: DestinataireListeDiffusion.CHEFS_CENTRES, label: "Chefs de centres" },
  { value: DestinataireListeDiffusion.COORDINATEURS_CLE, label: "Coordinateurs CLE" },
];

export default React.memo(
  function CampagneForm({ campagneData, isDupliquerCampagneDisabled, listeDiffusionOptions, onSave, onDuplicate }: CampagneFormProps) {
    const { state, handleChange, saveCampagne, isPending, isDirty } = useCampagneForm(campagneData, onSave);
    const { errors, validateForm } = useCampagneError(state);

    const handleSubmit = () => {
      if (validateForm()) {
        const { isTemplateOnError, ...stateWithoutErrorTemplate } = state;
        const payload = {
          ...stateWithoutErrorTemplate,
          id: campagneData.id,
        } as CampagneDataProps;
        saveCampagne({ id: campagneData.id, payload });
      }
    };
    const ErrorMessage = ({ message }: { message?: string }) => {
      if (!message) return null;
      return <div className="text-red-500 text-sm mt-1">{message}</div>;
    };

    const templateErrorMessage = state.isTemplateOnError ? "L'ID du template n'est pas correct" : undefined;
    const isOpen = campagneData.id === undefined;
    const isNotSaved = !campagneData.id || isDirty();
    return (
      <Container className={`pb-2 pt-2 mb-2 ${isNotSaved ? "border-2 border-blue-600" : "border-2"}`}>
        <Collapsable
          open={isOpen}
          header={
            <div className="flex w-full gap-16 p-2 pr-8 pb-0">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">Nom de la campagne *</label>
                <InputText value={state.nom || ""} onChange={(e) => handleChange("nom", e.target.value)} className={`mt-2 ${errors.nom ? "border-red-500" : ""}`} name="nom" />
                <ErrorMessage message={errors.nom} />
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">Type de volontaires *</label>
                <RadioButton
                  options={[
                    { label: "HTS", value: CampagneJeuneType.VOLONTAIRE },
                    { label: "CLE", value: CampagneJeuneType.CLE },
                    { label: "HTS et CLE", value: CampagneJeuneType.BOTH },
                  ]}
                  value={state.type || "HTS"}
                  onChange={(value) => handleChange("type", value)}
                />
                <ErrorMessage message={errors.type} />
              </div>
            </div>
          }>
          <div className="flex flex-col gap-6 p-2">
            <hr className="border-t border-gray-200" />

            <div className="grid grid-cols-2 gap-16">
              <div>
                <label className="text-sm font-medium text-gray-900">Liste de diffusion *</label>
                <Select
                  value={
                    listeDiffusionOptions.find((listeDiffusion) => {
                      return listeDiffusion.value === state.listeDiffusionId;
                    }) || null
                  }
                  onChange={(option: SelectOption<string>) => handleChange("listeDiffusionId", option.value)}
                  placeholder="Sélectionner une liste de diffusion"
                  options={listeDiffusionOptions}
                  className={`mt-2 ${errors.listeDiffusion ? "border-red-500" : ""}`}
                  closeMenuOnSelect={true}
                />
                <ErrorMessage message={errors.listeDiffusion} />
              </div>

              <div>
                <div className="flex gap-2">
                  <label className="text-sm font-medium text-gray-900">ID du template Brevo *</label>
                  <Tooltip id="id-template-brevo" title="L'ID du template Brevo">
                    <HiOutlineInformationCircle className="text-gray-400" size={20} />
                  </Tooltip>
                </div>

                <InputText
                  value={`${state.templateId}`}
                  onChange={(e) => handleChange("templateId", Number(e.target.value))}
                  className={`mt-2 ${errors.templateId ? "border-red-500" : ""}`}
                  name="templateId"
                  type="number"
                />
                <ErrorMessage message={errors.templateId} />
                <ErrorMessage message={templateErrorMessage} />
                <a href={`/email-preview/${state.templateId}`} target="_blank" rel="noreferrer" className="text-blue-600  inline-flex items-center">
                  Voir l'aperçu
                  <HiOutlineEye className="ml-1" size={18} />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-16">
              <div>
                <div className="flex gap-2">
                  <label className="text-sm font-medium text-gray-900">Destinataires *</label>
                  <Tooltip id="id-destinataires-campagne" title="Sélectionnez les destinataires de cette campagne">
                    <HiOutlineInformationCircle className="text-gray-400" size={20} />
                  </Tooltip>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  {recipientOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={state.destinataires?.includes(option.value)}
                        onChange={() =>
                          handleChange(
                            "destinataires",
                            state.destinataires?.includes(option.value) ? state.destinataires?.filter((d) => d !== option.value) : [...(state.destinataires || []), option.value],
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
                <ErrorMessage message={errors.recipients} />
              </div>
              <div>
                <div className="flex gap-2">
                  <label className="text-sm font-medium text-gray-900">Objet de la campagne *</label>
                  <Tooltip id="id-objet-campagne" title="Saisissez l'objet du mail de la campagne">
                    <HiOutlineInformationCircle className="text-gray-400" size={20} />
                  </Tooltip>
                </div>

                <InputText
                  value={state.objet || ""}
                  onChange={(e) => handleChange("objet", e.target.value)}
                  className={`mt-2 ${errors.objet ? "border-red-500" : ""}`}
                  name="objet"
                />
                <ErrorMessage message={errors.objet} />
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
            <button
              disabled={isDupliquerCampagneDisabled || isPending}
              className={`border-[1px] border-blue-600 rounded-md p-2.5 ${isDupliquerCampagneDisabled || isPending ? "border-gray-400" : ""}`}
              onClick={() => onDuplicate({ ...state, createdAt: campagneData.createdAt } as CampagneDataProps)}>
              <HiOutlineDocumentDuplicate className={`w-5 h-5 text-blue-600 ${isDupliquerCampagneDisabled || isPending ? "text-gray-400" : ""}`} />
            </button>
            <Button disabled={isPending} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md" title="Enregistrer" onClick={handleSubmit}></Button>
          </div>
        </Collapsable>
      </Container>
    );
  },

  (prevProps, nextProps) => {
    return prevProps.campagneData === nextProps.campagneData && prevProps.isDupliquerCampagneDisabled === nextProps.isDupliquerCampagneDisabled;
  },
);
