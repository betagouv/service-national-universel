import React, { useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useForm, Controller } from "react-hook-form";
// eslint-disable-next-line import/extensions
import { validatePhoneNumber } from "@/utils/form-validation.utils";
import useUpdateAccount from "../../lib/useUpdateAccount";
import Input from "@/components/forms/inputs/Input";
import Select from "@/components/forms/inputs/Select";
import InputPhone from "@/components/forms/inputs/InputPhone";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import IdCardReader from "./components/IdCardReader";
import SectionTitle from "../../components/SectionTitle";
import FormRow from "@/components/forms/layout/FormRow";
import ButtonLight from "@/components/ui/buttons/ButtonLight";
import ChangeAddressModal from "./components/ChangeAddressModal";
import ChangeEmailModal from "./components/ChangeEmailModal";
import InlineButton from "@/components/dsfr/ui/buttons/InlineButton";
import usePermissions from "@/hooks/usePermissions";
import useAuth from "@/services/useAuth";
import RadioButton from "@/components/forms/inputs/RadioButton";

type FormValues = {
  gender: string;
  email: string;
  phone: {
    phoneNumber: string;
    phoneZone: string;
  };
  psc1Info: "true" | "false" | null;
};

const AccountGeneralPage = () => {
  const { young } = useAuth();
  const { canUpdatePSC1 } = usePermissions();
  const searchParams = new URLSearchParams(window.location.search);
  const newEmailValidationToken = searchParams.get("newEmailValidationToken");
  const shouldValidateEmail = newEmailValidationToken && young.newEmail;
  const { mutate: updateProfile, isPending: isSubmitting } = useUpdateAccount("profile");
  const [isChangeAddressModalOpen, setChangeAddressModalOpen] = useState(false);
  const [isChangeEmailModalOpen, setChangeEmailModalOpen] = useState(shouldValidateEmail ? true : false);
  const { handleSubmit, reset, control, register } = useForm<FormValues>({
    defaultValues: {
      gender: young.gender || "male",
      email: young.email,
      phone: {
        phoneNumber: young.phone,
        phoneZone: young.phoneZone,
      },
      psc1Info: young.psc1Info === "true" ? "true" : young.psc1Info === "false" ? "false" : null,
    },
  });

  const handleSubmitGeneralForm = (formValues: FormValues) => {
    updateProfile({
      gender: formValues.gender,
      phone: formValues.phone.phoneNumber.trim(),
      phoneZone: formValues.phone.phoneZone,
      psc1Info: formValues.psc1Info,
    });
  };

  return (
    <div className="overflow-hidden bg-white shadow-sm lg:rounded-lg">
      <ChangeAddressModal isOpen={isChangeAddressModalOpen} onClose={() => setChangeAddressModalOpen(false)} young={young} />
      <ChangeEmailModal
        isOpen={isChangeEmailModalOpen}
        onClose={() => setChangeEmailModalOpen(false)}
        young={young}
        validationToken={shouldValidateEmail ? newEmailValidationToken : ""}
      />
      <form onSubmit={handleSubmit(handleSubmitGeneralForm)}>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
            <h2 className="m-0 text-lg font-medium leading-6 text-gray-900">Informations générales</h2>
          </div>
          <div className="px-4 py-6 lg:col-span-2 lg:col-start-2">
            <section className="mb-4">
              <SectionTitle>Identité et contact</SectionTitle>
              <FormRow>
                <Input label="Nom" name="lastName" placeholder="Dupond" className="basis-1/2" value={young.lastName} disabled />
                <Input label="Prénom" name="firstName" placeholder="Gaspard" className="basis-1/2" value={young.firstName} disabled />
              </FormRow>
              <Select label="Sexe" {...register("gender")}>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
              </Select>
              <Input label="Date de naissance" name="birthdateAt" value={young.birthdateAt ? new Date(young.birthdateAt).toLocaleDateString("fr-fr") : undefined} disabled />
              <Input type="email" label="Adresse email" name="email" value={young.email} disabled />
              <InlineButton onClick={() => setChangeEmailModalOpen(true)} className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-4">
                Modifier mon adresse email
              </InlineButton>
              <Controller
                name="phone"
                control={control}
                rules={{ required: "Le numéro de téléphone est requis", validate: validatePhoneNumber }}
                render={({ field, fieldState }) => <InputPhone label="Téléphone" value={field.value} error={fieldState.error?.message} onChange={field.onChange} />}
              />
            </section>
            <section className="mb-4">
              <SectionTitle>Adresse</SectionTitle>
              <Input label="Adresse" name="address" value={young.address} disabled />
              <FormRow>
                <Input label="Code Postal" name="zip" value={young.zip} className="basis-1/2" disabled />
                <Input label="Ville" name="city" value={young.city} className="basis-1/2" disabled />
              </FormRow>
              <InlineButton onClick={() => setChangeAddressModalOpen(true)} className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-2">
                J’ai changé d’adresse
              </InlineButton>
            </section>
            {young?.files?.cniFiles.length > 0 && (
              <section>
                <SectionTitle>Pièce d&apos;identité</SectionTitle>
                <div className="flex flex-col gap-2">
                  {young.files.cniFiles && young.files.cniFiles.map((cniFile) => <IdCardReader key={cniFile._id} cniFile={cniFile} young={young} />)}
                </div>
              </section>
            )}
          </div>
        </div>
        <hr className="ml-4"></hr>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="py-6 pl-6 lg:col-start-1">
            <h2 className="m-0 text-lg font-medium leading-6 text-gray-900">Formation PSC1</h2>
          </div>
          <div className="px-4 py-6 lg:col-span-2 lg:col-start-2">
            <section className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="m-0 text-base font-normal leading-6 align-left">Avez-vous validé le PSC1 (Prévention et Secours Civiques de niveau 1) ?</h2>
              </div>
              <div className="flex flex-col gap-1">
                <RadioButton label="Oui" value="true" defaultChecked={young.psc1Info === "true"} disabled={!canUpdatePSC1} {...register("psc1Info")} />
                <RadioButton label="Non" value="false" defaultChecked={young.psc1Info === "false"} disabled={!canUpdatePSC1} {...register("psc1Info")} />
              </div>
            </section>
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-gray-50 py-3 px-4 lg:flex-row lg:justify-end">
          <ButtonLight className="w-full bg-white lg:w-fit" onClick={reset}>
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

export default AccountGeneralPage;
