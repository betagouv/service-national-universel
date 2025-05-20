import React from "react";
import { useForm, Controller } from "react-hook-form";
import { BsPersonPlusFill, BsCheckCircleFill } from "react-icons/bs";
import { Button, InputText } from "@snu/ds/admin";
import { Label, Select } from "@snu/ds/admin";

type FormValues = {
  lastName: string;
  firstName: string;
  gender: string;
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
      gender: "",
      birthDate: "",
    },
  });

  return (
    <form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Identité</h3>
          <div className="mb-4">
            <Label title="Nom" name="lastName" />
            <Controller
              name="lastName"
              control={control}
              rules={{ required: "Le nom est requis" }}
              render={({ field }) => <InputText {...field} placeholder="Nom" error={errors.lastName?.message} disabled={isSuccess} />}
            />
          </div>
          <div className="mb-4">
            <Label title="Prénom" name="firstName" />
            <Controller
              name="firstName"
              control={control}
              rules={{ required: "Le prénom est requis" }}
              render={({ field }) => <InputText {...field} placeholder="Prénom" error={errors.firstName?.message} disabled={isSuccess} />}
            />
          </div>
          <div>
            <Label title="Sexe" name="gender" />
            <Controller
              name="gender"
              control={control}
              rules={{ required: "Le sexe est requis" }}
              render={({ field }) => (
                <Select
                  {...field}
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
            <Label title="Date de naissance" name="birthDate" />
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
