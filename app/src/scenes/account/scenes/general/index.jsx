import React, { useState, useEffect } from "react";
import queryString from "query-string";
import { BiLoaderAlt } from "react-icons/bi";
import { useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { PHONE_ZONES } from "snu-lib";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "@/redux/auth/actions";
import { validateEmail, validatePhoneNumber } from "@/utils/form-validation.utils";
import { updateYoung } from "@/services/young.service";
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
import { getCohort } from "@/utils/cohorts";

const getInitialFormValues = (young) => ({
  lastName: young.lastName || "",
  firstName: young.firstName || "",
  gender: young.gender || "male",
  birthdateAt: (young.birthdateAt && new Date(young.birthdateAt)) || "",
  email: young.email || "",
  phone: {
    phoneNumber: young.phone || "",
    phoneZone: young.phoneZone || "",
  },
  psc1Info: young.psc1Info || "",
});

const AccountGeneralPage = () => {
  const young = useSelector((state) => state.Auth.young);
  const cohort = getCohort(young.cohort);
  const cantUpdatePSC1 = cohort.isAssignmentAnnouncementsOpenForYoung;
  const dispatch = useDispatch();

  const { search } = useLocation();
  const { newEmailValidationToken } = queryString.parse(search);

  const [formValues, setFormValues] = useState(getInitialFormValues(young));

  const shouldValidateEmail = newEmailValidationToken && young.newEmail;

  useEffect(() => {
    if (formValues.email === young.email) return;
    setFormValues({ ...formValues, email: young.email });
  }, [young.email, formValues]);

  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangeAddressModalOpen, setChangeAddressModalOpen] = useState(false);
  const [isChangeEmailModalOpen, setChangeEmailModalOpen] = useState(shouldValidateEmail ? true : false);

  const validateForm = () => {
    const foundErrors = {};
    let hasError = false;
    const emailError = validateEmail({ value: formValues.email });
    const phoneError = validatePhoneNumber({ value: formValues.phone });
    if (emailError) {
      foundErrors.email = emailError;
      hasError = true;
    }
    if (phoneError) {
      foundErrors.phone = phoneError;
      hasError = true;
    }
    setErrors(foundErrors);
    return !hasError;
  };

  const handleSubmitGeneralForm = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const youngDataToUpdate = {
        gender: formValues.gender,
        phone: formValues.phone.phoneNumber.trim(),
        phoneZone: formValues.phone.phoneZone,
        psc1Info: formValues.psc1Info,
      };
      const { title, message, data: updatedYoung } = await updateYoung("profile", youngDataToUpdate);
      toastr.success(title, message);
      dispatch(setYoung(updatedYoung));
    } catch (error) {
      console.error(error);
      const { title, message } = error;
      toastr.error(title, message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeValue = (inputName) => (value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [inputName]: value,
    }));
  };

  const handleResetForm = () => {
    setFormValues(getInitialFormValues(young));
  };

  return (
    <>
      <div className="overflow-hidden bg-white shadow-sm lg:rounded-lg">
        <ChangeAddressModal isOpen={isChangeAddressModalOpen} onClose={() => setChangeAddressModalOpen(false)} young={young} />
        <ChangeEmailModal
          isOpen={isChangeEmailModalOpen}
          onClose={() => setChangeEmailModalOpen(false)}
          young={young}
          validationToken={shouldValidateEmail ? newEmailValidationToken : ""}
        />
        <form onSubmit={handleSubmitGeneralForm}>
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
              <h2 className="m-0 text-lg font-medium leading-6 text-gray-900">Informations générales</h2>
            </div>
            <div className="px-4 py-6 lg:col-span-2 lg:col-start-2">
              <section className="mb-4">
                <SectionTitle>Identité et contact</SectionTitle>
                <FormRow>
                  <Input label="Nom" name="lastName" placeholder="Dupond" className="basis-1/2" value={formValues.lastName} disabled />
                  <Input label="Prénom" name="firstName" placeholder="Gaspard" className="basis-1/2" value={formValues.firstName} disabled />
                </FormRow>
                <Select label="Sexe" name="gender" value={formValues.gender} onChange={(e) => handleChangeValue("gender")(e.target.value)}>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </Select>
                <Input
                  label="Date de naissance"
                  name="birthdateAt"
                  placeholder="JJ/MM/AAAA"
                  value={formValues.birthdateAt ? formValues.birthdateAt.toLocaleDateString("fr-fr") : null}
                  disabled
                />
                <Input
                  type="email"
                  label="Adresse email"
                  name="email"
                  error={errors?.email}
                  placeholder="example@example.com"
                  value={formValues.email}
                  onChange={(e) => handleChangeValue("email")(e.target.value)}
                  disabled
                />
                <InlineButton onClick={() => setChangeEmailModalOpen(true)} className="text-gray-500 hover:text-gray-700 text-sm font-medium mb-4">
                  Modifier mon adresse email
                </InlineButton>
                <InputPhone
                  label="Téléphone"
                  name="phone"
                  value={formValues.phone}
                  error={errors?.phone}
                  onChange={handleChangeValue("phone")}
                  placeholder={PHONE_ZONES[formValues.phone.phoneZone]?.example}
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
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="psc1Info"
                      value="true"
                      checked={formValues.psc1Info === "true"}
                      onChange={(e) => handleChangeValue("psc1Info")(e.target.value)}
                      className="form-radio text-blue-600"
                      disabled={cantUpdatePSC1}
                    />
                    <span className="text-base font-normal">Oui</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="psc1Info"
                      value="false"
                      checked={formValues.psc1Info === "false"}
                      onChange={(e) => handleChangeValue("psc1Info")(e.target.value)}
                      className="form-radio text-blue-600"
                      disabled={cantUpdatePSC1}
                    />
                    <span className="text-base font-normal">Non</span>
                  </label>
                </div>
              </section>
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
    </>
  );
};

export default AccountGeneralPage;
