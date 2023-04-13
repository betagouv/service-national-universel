import React from "react";
import useForm from "../../../../hooks/useForm";
import ButtonLinkLight from "../../../../components/ui/buttons/ButtonLinkLight";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import { changeYoungPassword } from "../../../../services/young.service";
import { setYoung } from "../../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { requiredErrorMessage, validatePassword } from "../../../../utils/form-validation.utils";
import InputPassword from "../../../../components/forms/inputs/InputPassword";
import FormDescription from "../components/FormDescription";
import SectionTitle from "../components/SectionTitle";

const AccountPasswordPage = () => {
  const dispatch = useDispatch();

  const { values, setValues, isSubmitionPending, isValid, handleSubmit, errors, validate } = useForm({
    initialValues: {
      password: "",
      newPassword: "",
      verifyPassword: "",
    },
    validateOnChange: true,
  });

  const handleChangePasswordSubmit = async (values) => {
    try {
      const { title, message, data } = await changeYoungPassword(values);
      toastr.success(title, message);
      dispatch(setYoung(data));
    } catch (error) {
      const { title, message } = error;
      toastr.error(title, message);
    }
  };

  return (
    <div className="bg-white shadow-sm mb-6 lg:rounded-lg">
      <form onSubmit={handleSubmit(handleChangePasswordSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden lg:block lg:col-start-1 py-6 pl-6">
            <h2 className="text-gray-900 text-lg leading-6 font-medium m-0 mb-1">Mot de passe</h2>
            <FormDescription>Vous pouvez modifier votre mot de passe si vous le souhaitez</FormDescription>
          </div>
          <div className="px-4 pt-6 pb-2 lg:col-start-2 lg:col-span-2">
            <FormDescription className="lg:hidden">Vous pouvez modifier votre mot de passe si vous le souhaitez</FormDescription>
            <SectionTitle>Mon mot de passe</SectionTitle>
            <InputPassword
              label="Actuel"
              name="password"
              onChange={setValues("password")}
              error={errors.password}
              placeholder="********"
              value={values.password}
              validate={validate(({ value }) => !value && requiredErrorMessage)}
            />
            <InputPassword
              name="newPassword"
              error={errors.newPassword}
              onChange={setValues("newPassword")}
              validate={validate(validatePassword)}
              placeholder="Nouveau mot de passe"
              value={values.newPassword}
            />
            <InputPassword
              name="verifyPassword"
              onChange={setValues("verifyPassword")}
              error={errors.verifyPassword}
              validate={validate(({ value, formValues }) => {
                return (!value && requiredErrorMessage) || (value !== formValues.newPassword && "Les mots de passe renseignés doivent être identiques.");
              })}
              placeholder="Confirmer nouveau mot de passe"
              value={values.verifyPassword}
            />
          </div>
        </div>
        <div className="bg-gray-50 py-3 px-4 flex flex-col lg:flex-row lg:justify-end gap-3">
          <ButtonLinkLight className="w-full lg:w-fit" to="/account">
            Annuler
          </ButtonLinkLight>
          <ButtonPrimary type="submit" className="w-full lg:w-fit" disabled={isSubmitionPending || !isValid}>
            {isSubmitionPending && <BiLoaderAlt className="animate-spin" />}
            Enregistrer
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
};

export default AccountPasswordPage;
