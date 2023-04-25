import React, { useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { youngCanChangeSession } from "snu-lib";
import { PHONE_ZONES, PHONE_ZONES_NAMES } from "snu-lib/phone-number";
import { useDispatch, useSelector } from "react-redux";
import { setYoung } from "../../../../redux/auth/actions";
import { validateEmail, validatePhoneNumber } from "../../../../utils/form-validation.utils";
import { updateYoung } from "../../../../services/young.service";
import Input from "../../../../components/forms/inputs/Input";
import Select from "../../../../components/forms/inputs/Select";
import InputPhone from "../../../../components/forms/inputs/InputPhone";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import IdCardReader from "./components/IdCardReader";
import SectionTitle from "../../components/SectionTitle";
import Withdrawal from "./components/Withdrawal";
import FormRow from "../../../../components/forms/layout/FormRow";
import ButtonLight from "../../../../components/ui/buttons/ButtonLight";

const getInitialFormValues = (young) => ({
  lastName: young.lastName || "",
  firstName: young.firstName || "",
  gender: young.gender || "male",
  birthdateAt: (young.birthdateAt && new Date(young.birthdateAt).toLocaleDateString("fr-fr")) || "",
  email: young.email || "",
  phone: {
    phoneNumber: young.phone || "",
    phoneZone: young.phoneZone || PHONE_ZONES_NAMES.FRANCE,
  },
  address: young.address || "",
  zip: young.zip || "",
  city: young.city || "",
});

const AccountGeneralPage = () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState(getInitialFormValues(young));

  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        ...formValues,
        phone: formValues.phone.phoneNumber.trim(),
        phoneZone: formValues.phone.phoneZone,
        email: formValues.email.trim(),
      };
      const { title, message, data: updatedYoung } = await updateYoung({ _id: young._id, ...youngDataToUpdate });
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
        <form onSubmit={handleSubmitGeneralForm}>
          <div className="grid grid-cols-1 lg:grid-cols-3">
            <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
              <h2 className="m-0 text-lg font-medium leading-6 text-gray-900">Informations générales</h2>
            </div>
            <div className="px-4 py-6 lg:col-span-2 lg:col-start-2">
              <section className="mb-4">
                <SectionTitle>Identité et contact</SectionTitle>
                <FormRow>
                  <Input label="Nom" name="lastName" placeholder="Dupond" className="basis-1/2" value={formValues.firstName} disabled />
                  <Input label="Prénom" name="firstName" placeholder="Gaspard" className="basis-1/2" value={formValues.lastName} disabled />
                </FormRow>
                <Select label="Sexe" name="gender" value={formValues.gender} onChange={handleChangeValue("gender")}>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                </Select>
                <Input label="Date de naissance" name="birthdateAt" placeholder="JJ/MM/AAAA" value={formValues.birthdateAt} disabled />
                <Input
                  type="email"
                  label="Adresse email"
                  name="email"
                  error={errors?.email}
                  placeholder="example@example.com"
                  value={formValues.email}
                  onChange={handleChangeValue("email")}
                />
                <InputPhone
                  label="Téléphone"
                  name="phone"
                  value={formValues.phone}
                  error={errors?.phone}
                  onChange={handleChangeValue("phone")}
                  placeholder={PHONE_ZONES[formValues.phone.phoneZone].example}
                />
              </section>
              <section className="mb-4">
                <SectionTitle>Adresse</SectionTitle>
                <Input label="Adresse" name="address" value={formValues.address} disabled />
                <FormRow>
                  <Input label="Code Postal" name="zip" value={formValues.zip} className="basis-1/2" disabled />
                  <Input label="Ville" name="city" value={formValues.city} className="basis-1/2" disabled />
                </FormRow>
              </section>
              <section>
                <SectionTitle>Pièce d&apos;identité</SectionTitle>
                <div className="flex flex-col gap-2">
                  {young.files.cniFiles && young.files.cniFiles.map((cniFile) => <IdCardReader key={cniFile._id} cniFile={cniFile} young={young} />)}
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
      <div className="flex flex-col items-center gap-6 py-8 lg:flex-row">
        {youngCanChangeSession(young) ? (
          <Link to="/changer-de-sejour" className="flex items-center gap-2 text-sm text-blue-600">
            Changer de séjour
          </Link>
        ) : null}
        <Withdrawal young={young} />
      </div>
    </>
  );
};

export default AccountGeneralPage;
