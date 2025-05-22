import { Button, InputText, Select } from "@snu/ds/admin";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { BsCheckCircleFill, BsPersonPlusFill } from "react-icons/bs";
import { validateNoSpecialChars } from "snu-lib";

type FormValues = {
  lastName: string;
  firstName: string;
  gender: { value: string; label: string };
  birthDate: string;
};

type InscriptionManuelleFormProps = {
  onSubmit: (data: FormValues) => void;
  isSubmitting?: boolean;
  isSuccess?: boolean;
};

const InscriptionManuelleForm = ({ onSubmit, isSubmitting = false, isSuccess = false }: InscriptionManuelleFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      lastName: "",
      firstName: "",
      gender: { value: "", label: "" },
      birthDate: "",
    },
  });

  return (
    <form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Identité</h3>
          <div className="flex flex-row gap-4 justify-between">
            <div className="mb-4 flex-1">
              <Controller
                name="lastName"
                control={control}
                rules={{
                  required: "Le nom est requis",
                  validate: (text) => (validateNoSpecialChars(text) ? true : "Le nom ne doit pas comporter de caractères spéciaux"),
                }}
                render={({ field }) => <InputText {...field} label="Nom" placeholder="Nom" error={errors.lastName?.message} disabled={isSuccess} />}
              />
            </div>
            <div className="mb-4 flex-1">
              <Controller
                name="firstName"
                control={control}
                rules={{
                  required: "Le prénom est requis",
                  validate: (text) => (validateNoSpecialChars(text) ? true : "Le prénom ne doit pas comporter de caractères spéciaux"),
                }}
                render={({ field }) => <InputText {...field} label="Prénom" placeholder="Prénom" error={errors.firstName?.message} disabled={isSuccess} />}
              />
            </div>
          </div>
          <div>
            <Controller
              name="gender"
              control={control}
              rules={{
                required: "Le sexe est requis",
                validate: (options) => {
                  return options.value === "" ? "Le sexe est requis" : true;
                },
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  label="Sexe"
                  placeholder="Sélectionner"
                  error={errors.gender?.message}
                  options={[
                    { value: "male", label: "Masculin" },
                    { value: "female", label: "Féminin" },
                  ]}
                  closeMenuOnSelect={true}
                  disabled={isSuccess}
                />
              )}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Date de naissance</h3>
          <div>
            <Controller
              name="birthDate"
              control={control}
              rules={{ required: "La date de naissance est requise" }}
              render={({ field }) => <InputText {...field} type="date" error={errors.birthDate?.message} disabled={isSuccess} />}
            />
          </div>

          <div className="mt-10">
            {isSuccess ? (
              <div className="flex items-center bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-lg">
                <BsCheckCircleFill className="text-green-500 mr-2" size={20} />
                <span>Nouvel élève enregistré</span>
              </div>
            ) : (
              <Button
                type="primary"
                leftIcon={<BsPersonPlusFill className="mr-2" />}
                title="Inscrire cet élève"
                onClick={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default InscriptionManuelleForm;
export type { FormValues };
