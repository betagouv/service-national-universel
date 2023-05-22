import React, { useState } from "react";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import { changeYoungPassword } from "../../../../services/young.service";
import { setYoung } from "../../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { validatePassword, validateRequired, validateVerifyPassword } from "../../../../utils/form-validation.utils";
import InputPassword from "../../../../components/forms/inputs/InputPassword";
import FormDescription from "../../components/FormDescription";
import SectionTitle from "../../components/SectionTitle";
import ButtonLight from "../../../../components/ui/buttons/ButtonLight";

const INITIAL_FORM_VALUES = {
  password: "",
  newPassword: "",
  verifyPassword: "",
};

const AccountPasswordPage = () => {
  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);

  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const foundErrors = {};
    let hasError = false;
    const passwordError = validateRequired({ value: formValues.password });
    const newPasswordError = validatePassword({ value: formValues.newPassword });
    const verifyPasswordError = validateVerifyPassword({ value: formValues.verifyPassword, valueToCompare: formValues.verifyPassword });
    if (passwordError) {
      foundErrors.password = passwordError;
      hasError = true;
    }
    if (newPasswordError) {
      foundErrors.newPassword = newPasswordError;
      hasError = true;
    }
    if (verifyPasswordError) {
      foundErrors.verifyPassword = verifyPasswordError;
      hasError = true;
    }
    setErrors(foundErrors);
    return !hasError;
  };

  const handleChangePasswordSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!validateForm()) {
        return;
      }
      setIsSubmitting(true);
      const { title, message, data } = await changeYoungPassword(formValues);
      toastr.success(title, message);
      dispatch(setYoung(data));
      setFormValues(INITIAL_FORM_VALUES);
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
    setFormValues(INITIAL_FORM_VALUES);
  };

  return (
    <div className="mb-6 bg-white shadow-sm lg:rounded-lg">
      <form onSubmit={handleChangePasswordSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
            <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Mot de passe</h2>
            <FormDescription>Vous pouvez modifier votre mot de passe si vous le souhaitez</FormDescription>
          </div>
          <div className="px-4 pt-6 pb-2 lg:col-span-2 lg:col-start-2">
            <FormDescription className="lg:hidden">Vous pouvez modifier votre mot de passe si vous le souhaitez</FormDescription>
            <SectionTitle>Mon mot de passe</SectionTitle>
            <InputPassword label="Actuel" name="password" onChange={handleChangeValue("password")} error={errors?.password} value={formValues.password} />
            <InputPassword label="Nouveau mot de passe" name="newPassword" error={errors?.newPassword} onChange={handleChangeValue("newPassword")} value={formValues.newPassword} />
            <InputPassword
              label="Confirmer nouveau mot de passe"
              name="verifyPassword"
              onChange={handleChangeValue("verifyPassword")}
              error={errors?.verifyPassword}
              value={formValues.verifyPassword}
            />
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

export default AccountPasswordPage;
