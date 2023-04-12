import React from "react";
import useForm from "../../../../hooks/useForm";
import ButtonLinkLight from "../../../../components/ui/buttons/ButtonLinkLight";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import { changeYoungPassword } from "../../../../services/young.service";
import { setYoung } from "../../../../redux/auth/actions";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { validatePassword } from "../../../../utils/password.utils";
import InputPassword from "../../../../components/forms/inputs/InputPassword";

const requiredMessage = "Ce champ est obligatoire";

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
    <div className="bg-white shadow-sm">
      <form onSubmit={handleSubmit(handleChangePasswordSubmit)}>
        <div className="px-4 pt-6 pb-2">
          <p className="text-sm text-gray-500 mb-6">Vous pouvez modifier votre mot de passe si vous le souhaitez</p>
          <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Mon mot de passe</h2>
          <InputPassword
            label="Actuel"
            name="password"
            onChange={setValues("password")}
            error={errors.password}
            placeholder="********"
            value={values.password}
            validate={validate(({ value }) => !value && requiredMessage)}
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
              console.log("VALUES", formValues);
              return (!value && requiredMessage) || (value !== formValues.newPassword && "Les mots de passe renseignés doivent être identiques.");
            })}
            placeholder="Confirmer nouveau mot de passe"
            value={values.verifyPassword}
          />
        </div>
        <div className="bg-gray-50 py-3 px-4 flex flex-col gap-3">
          <ButtonLinkLight className="w-full" to="/account">
            Annuler
          </ButtonLinkLight>
          <ButtonPrimary type="submit" className="w-full" disabled={isSubmitionPending || !isValid}>
            {isSubmitionPending && <BiLoaderAlt className="animate-spin" />}
            Enregistrer
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
};

export default AccountPasswordPage;
