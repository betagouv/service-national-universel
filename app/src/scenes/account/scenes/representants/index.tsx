import React, { useState } from "react";
import { PHONE_ZONES } from "snu-lib";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import InputPhone from "../../../../components/forms/inputs/InputPhone";
import Select from "../../../../components/forms/inputs/Select";
import Input from "../../../../components/forms/inputs/Input";
import Checkbox from "../../../../components/forms/inputs/Checkbox";
import { validateEmail, validatePhoneNumber } from "../../../../utils/form-validation.utils";
import SectionTitle from "../../components/SectionTitle";
import ButtonLight from "../../../../components/ui/buttons/ButtonLight";
import useAuth from "@/services/useAuth";
import { useForm, Controller } from "react-hook-form";
import useUpdateAccount from "../../lib/useUpdateAccount";

type FormValues = {
  parent1Status: string;
  parent1LastName: string;
  parent1FirstName: string;
  parent1Email: string;
  parent1Phone: {
    phoneNumber: string;
    phoneZone: string;
  };
  parent2Status: string;
  parent2LastName: string;
  parent2FirstName: string;
  parent2Email: string;
  parent2Phone: {
    phoneNumber: string;
    phoneZone: string;
  };
};

const AccountRepresentantsPage = () => {
  const { young } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      parent1Status: young?.parent1Status || "representant",
      parent1LastName: young?.parent1LastName || "",
      parent1FirstName: young?.parent1FirstName || "",
      parent1Email: young?.parent1Email || "",
      parent1Phone: {
        phoneNumber: young?.parent1Phone || "",
        phoneZone: young?.parent1PhoneZone || "",
      },
      parent2Status: young?.parent2Status || "representant",
      parent2LastName: young?.parent2LastName || "",
      parent2FirstName: young?.parent2FirstName || "",
      parent2Email: young?.parent2Email || "",
      parent2Phone: {
        phoneNumber: young?.parent2Phone || "",
        phoneZone: young?.parent2PhoneZone || "",
      },
    },
  });
  const { mutate: updateRepresentants, isPending: isSubmitting } = useUpdateAccount("parents");
  const [hasParent2, setHasParent2] = useState(young?.parent2Email ? true : false);

  const handleChangeParent2 = (value: boolean) => {
    setHasParent2(value);
  };

  const onSubmit = (formValues: FormValues) => {
    updateRepresentants({
      parent1Status: formValues.parent1Status,
      parent1LastName: formValues.parent1LastName.trim(),
      parent1FirstName: formValues.parent1FirstName.trim(),
      parent1Phone: formValues.parent1Phone.phoneNumber.trim(),
      parent1PhoneZone: formValues.parent1Phone.phoneZone,
      parent1Email: formValues.parent1Email.trim(),
      parent2: hasParent2,
      parent2Status: hasParent2 ? formValues.parent2Status : "",
      parent2LastName: hasParent2 ? formValues.parent2LastName.trim() : "",
      parent2FirstName: hasParent2 ? formValues.parent2FirstName.trim() : "",
      parent2Phone: hasParent2 ? formValues.parent2Phone.phoneNumber.trim() : "",
      parent2PhoneZone: hasParent2 ? formValues.parent2Phone.phoneZone : "AUTRE",
      parent2Email: hasParent2 ? formValues.parent2Email.trim() : "",
    });
  };

  const handleResetForm = () => {
    setHasParent2(young?.parent2Email ? true : false);
    reset();
  };

  return (
    <div className="mb-6 bg-white shadow-sm lg:rounded-lg">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
            <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Représentants légaux</h2>
          </div>
          <div className="px-4 pt-6 pb-2 lg:col-span-2 lg:col-start-2">
            <section className="mb-4">
              <SectionTitle>Représentant légal 1</SectionTitle>
              <Select {...register("parent1Status", { required: true })} label="Statut" error={errors?.parent1Status?.message}>
                <option value="mother">Mère</option>
                <option value="father">Père</option>
                <option value="representant">Représentant légal</option>
              </Select>
              <Input {...register("parent1LastName", { required: "Ce champ est obligatoire" })} label="Nom" placeholder="Dupond" error={errors?.parent1LastName?.message} />
              <Input {...register("parent1FirstName", { required: "Ce champ est obligatoire" })} label="Prénom" placeholder="Gaspard" error={errors?.parent1FirstName?.message} />
              <Input
                type="email"
                label="Adresse email"
                error={errors?.parent1Email?.message}
                placeholder="example@example.com"
                {...register("parent1Email", { required: "Ce champ est obligatoire", validate: validateEmail })}
              />
              <Controller
                name="parent1Phone"
                control={control}
                rules={{ validate: validatePhoneNumber }}
                render={({ field, fieldState }) => (
                  <InputPhone
                    label="Téléphone"
                    value={field.value}
                    error={fieldState.error?.message}
                    onChange={field.onChange}
                    placeholder={PHONE_ZONES[field.value.phoneZone]?.example}
                  />
                )}
              />
            </section>
            <Checkbox label="Je renseigne un(e) second(e) représentant(e) légal(e)" onChange={handleChangeParent2} checked={hasParent2} />
            {hasParent2 && (
              <section className="mb-4">
                <SectionTitle>Représentant légal 2</SectionTitle>
                <Select {...register("parent2Status", { required: hasParent2 })} error={errors?.parent2Status?.message} label="Statut">
                  <option value="mother">Mère</option>
                  <option value="father">Père</option>
                  <option value="representant">Représentant légal</option>
                </Select>
                <Input {...register("parent2LastName", { required: hasParent2 })} label="Nom" placeholder="Dupond" error={errors?.parent2LastName?.message} />
                <Input {...register("parent2FirstName", { required: hasParent2 })} label="Prénom" placeholder="Gaspard" error={errors?.parent2FirstName?.message} />
                <Input
                  type="email"
                  label="Adresse email"
                  error={errors?.parent2Email?.message}
                  placeholder="example@example.com"
                  {...register("parent2Email", { required: hasParent2, validate: validateEmail })}
                />
                <Controller
                  name="parent2Phone"
                  control={control}
                  rules={{ validate: hasParent2 ? validatePhoneNumber : () => true }}
                  render={({ field, fieldState }) => (
                    <InputPhone
                      label="Téléphone"
                      value={field.value}
                      error={fieldState.error?.message}
                      onChange={field.onChange}
                      placeholder={PHONE_ZONES[field.value.phoneZone]?.example}
                    />
                  )}
                />
              </section>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-gray-50 py-3 px-4 lg:flex-row lg:justify-end">
          <ButtonLight className="w-full bg-white lg:w-fit" onClick={handleResetForm}>
            Annuler
          </ButtonLight>
          <ButtonPrimary type="submit" className="w-full lg:w-fit" disabled={isSubmitting}>
            {isSubmitting && <BiLoaderAlt className="animate-spin" />}
            Enregistrer
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
};

export default AccountRepresentantsPage;
