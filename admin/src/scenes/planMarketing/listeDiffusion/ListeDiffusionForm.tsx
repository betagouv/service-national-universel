import RadioButton from "@/scenes/phase0/components/RadioButton";
import { Button, Collapsable, Container, Label } from "@snu/ds/admin";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { HiOutlineExclamation } from "react-icons/hi";
import { ListeDiffusionEnum, ListeDiffusionFiltres } from "snu-lib";
import ListeDiffusionFiltersWrapper from "./filters/ListeDiffusionFiltersWrapper";

export interface ListeDiffusionDataProps {
  id: string;
  nom: string;
  type: ListeDiffusionEnum;
  filters: ListeDiffusionFiltres;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}
interface ListeDiffusionFiltersView {
  paramData: any;
  dataFilter: any;
  filters: any;
}
export interface DraftListeDiffusionDataProps extends Partial<ListeDiffusionDataProps> {}

interface ListeDiffusionFormProps {
  listeDiffusionData: DraftListeDiffusionDataProps;
  filter: { volontaires: ListeDiffusionFiltersView; inscriptions: ListeDiffusionFiltersView };
  onSave: (data: ListeDiffusionDataProps) => void;
  onCancel: () => void;
  forceOpen?: boolean;
}

export const ListeDiffusionForm = ({ listeDiffusionData, filter, onSave, onCancel, forceOpen = false }: ListeDiffusionFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<ListeDiffusionDataProps>({
    defaultValues: {
      type: ListeDiffusionEnum.VOLONTAIRES,
      ...listeDiffusionData,
    },
  });

  // Update the form when the listeDiffusionData changes
  useEffect(() => {
    reset({
      type: ListeDiffusionEnum.VOLONTAIRES,
      ...listeDiffusionData,
    });
  }, [listeDiffusionData, reset]);

  const [selectedFilters, setSelectedFilters] = useState<ListeDiffusionFiltres>(listeDiffusionData.filters || {});

  const isEditing = listeDiffusionData.id !== undefined;
  const isOpen = listeDiffusionData.id === undefined || forceOpen;

  const handleOnCancel = () => {
    reset();
    onCancel();
  };

  const handleOnSave = (data: ListeDiffusionDataProps) => {
    onSave({ ...data, filters: selectedFilters });
    reset(data);
  };

  const handleSelectedFiltersChange = (filters: ListeDiffusionFiltres) => {
    setValue("filters", filters, { shouldDirty: true });
    setSelectedFilters(filters);
  };

  watch((currentState, { name }) => {
    if (name === "type") {
      handleSelectedFiltersChange({});
    }
  });

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
                rules={{ required: !isEditing && "Ce champ est requis" }}
                disabled={isEditing}
                render={({ field }) => (
                  <RadioButton
                    options={[
                      { label: "Volontaires", value: ListeDiffusionEnum.VOLONTAIRES },
                      { label: "Inscriptions", value: ListeDiffusionEnum.INSCRIPTIONS },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    readonly={isEditing}
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
            {watch("type") === ListeDiffusionEnum.VOLONTAIRES ? (
              <ListeDiffusionFiltersWrapper
                key={"volontaires-" + listeDiffusionData.id}
                paramData={filter?.volontaires.paramData}
                dataFilter={filter.volontaires?.dataFilter}
                filters={filter.volontaires?.filters}
                id={listeDiffusionData.id}
                selectedFilters={selectedFilters}
                onFiltersChange={handleSelectedFiltersChange}
              />
            ) : (
              <ListeDiffusionFiltersWrapper
                key={"inscriptions-" + listeDiffusionData.id}
                paramData={filter.inscriptions?.paramData}
                dataFilter={filter.inscriptions?.dataFilter}
                filters={filter.inscriptions?.filters}
                id={listeDiffusionData.id}
                selectedFilters={selectedFilters}
                onFiltersChange={handleSelectedFiltersChange}
              />
            )}
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
