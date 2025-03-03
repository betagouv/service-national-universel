import React from "react";
import { Button, Collapsable, Container, Label } from "@snu/ds/admin";
import { ListeDiffusionEnum } from "snu-lib";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineExclamation } from "react-icons/hi";
import RadioButton from "@/scenes/phase0/components/RadioButton";

export interface ListeDiffusionDataProps {
  id: string;
  nom: string;
  type: ListeDiffusionEnum;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}
export interface DraftListeDiffusionDataProps extends Partial<ListeDiffusionDataProps> {}

interface ListeDiffusionFormProps {
  listeDiffusionData: DraftListeDiffusionDataProps;
  onSave: (data: ListeDiffusionDataProps) => void;
  onCancel: () => void;
}

export const ListeDiffusionForm = ({ listeDiffusionData, onSave, onCancel }: ListeDiffusionFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm<ListeDiffusionDataProps>({
    defaultValues: {
      type: ListeDiffusionEnum.VOLONTAIRES,
      ...listeDiffusionData,
    },
  });

  const isOpen = listeDiffusionData.id === undefined || isDirty;

  const handleOnCancel = () => {
    reset();
    onCancel();
  };

  const handleOnSave = (data: ListeDiffusionDataProps) => {
    onSave(data);
    reset(data);
  };

  return (
    <Container className={`pb-2 pt-2 mb-2 ${isDirty ? "border-2 border-blue-600" : "border-2"}`}>
      <Collapsable
        open={isOpen}
        header={
          <div className="flex w-full gap-16 p-2 pr-8 pb-0 items-center">
            <div className="flex-1">
              <Label title="Nom de la liste de diffusion" name="nom" className="mb-2 flex items-center font-medium !text-sm" />
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
            </div>

            <div className="flex-1">
              <Label title="Type de liste de diffusion" name="type" className="mb-2 flex items-center font-medium !text-sm" />
              <Controller
                name="type"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <RadioButton
                    options={[
                      { label: "Volontaires", value: ListeDiffusionEnum.VOLONTAIRES },
                      { label: "Inscriptions", value: ListeDiffusionEnum.INSCRIPTIONS },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.type && <span className="text-red-500 text-sm mt-1">{errors.type.message}</span>}
            </div>
          </div>
        }>
        <div className="flex flex-col gap-6">
          <hr className="border-t border-gray-200" />
          <div className="flex items-center gap-6">
            <Label title="Filtres" name="filtres" className="!text-xl text-gray-900 self-center" />
            <Button title="Filtres TODO" type="secondary" disabled={true} className="text-sm" />
          </div>
        </div>

        <hr className="border-t border-gray-200" />
        <div className="flex justify-end mt-4 gap-2">
          <Button title="Annuler" type="secondary" className="flex justify-center" onClick={handleOnCancel} disabled={isSubmitting} />
          <Button
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md"
            title="Enregistrer"
            onClick={handleSubmit(handleOnSave)}
          />
          {isDirty && (
            <div className="flex items-center gap-2 text-gray-500">
              <HiOutlineExclamation className="w-5 h-5" />
              <span>Non enregistrée</span>
            </div>
          )}
        </div>
      </Collapsable>
    </Container>
  );
};
