import React from "react";
import Input from "../../../../components/forms/inputs/Input";
import Select from "../../../../components/forms/inputs/Select";
import { useDispatch, useSelector } from "react-redux";
import useForm from "../../../../hooks/useForm";
import validator from "validator";
import InputPhone from "../../../../components/forms/inputs/InputPhone";
import { PHONE_ZONES, PHONE_ZONES_NAMES, isPhoneNumberWellFormated } from "snu-lib/phone-number";
import IdCardReader from "../components/IdCardReader";
import ButtonLinkLight from "../../../../components/ui/buttons/ButtonLinkLight";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import { Link } from "react-router-dom";
import { updateYoung } from "../../../../services/young.service";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../../../redux/auth/actions";
import { BiLoaderAlt } from "react-icons/bi";
import { youngCanChangeSession } from "snu-lib";

const requiredMessage = "Ce champ est obligatoire";

const AccountGeneralPage = () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const { values, setValues, validate, errors, handleSubmit, isSubmitionPending, isValid } = useForm({
    initialValues: {
      firstName: young.firstName || "",
      lastName: young.lastName || "",
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
    },
    validateOnChange: true,
    validateOnInit: true,
  });

  const handleSubmitGeneralForm = async (values) => {
    try {
      const youngDataToUpdate = {
        ...values,
        phone: values.phone.phoneNumber.trim(),
        phoneZone: values.phone.phoneZone,
        email: values.email.trim(),
      };
      const { title, message, data: updatedYoung } = await updateYoung({ _id: young._id, ...youngDataToUpdate });
      toastr.success(title, message);
      dispatch(setYoung(updatedYoung));
    } catch (error) {
      const { title, message } = error;
      toastr.error(title, message);
    }
  };

  return (
    <div className="bg-white shadow-sm">
      <form onSubmit={handleSubmit(handleSubmitGeneralForm)}>
        <div className="px-4 py-6">
          <section className="mb-4">
            <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Identité et contact</h2>
            <Input label="Nom" name="lastName" placeholder="Dupond" value={values.firstName} disabled />
            <Input label="Prénom" name="firstName" placeholder="Gaspard" value={values.lastName} disabled />
            <Select label="Sexe" name="gender" value={values.gender} onChange={setValues("gender")}>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </Select>
            <Input label="Date de naissance" name="birthdateAt" placeholder="JJ/MM/AAAA" value={values.birthdateAt} disabled />
            <Input
              type="email"
              label="Adresse email"
              name="email"
              error={errors.email}
              placeholder="example@example.com"
              value={values.email}
              onChange={setValues("email")}
              validate={validate(({ value }) => (!value && requiredMessage) || (!validator.isEmail(value.trim()) && "Veuillez saisir une adresse email valide."))}
            />
            <InputPhone
              label="Téléphone"
              name="phone"
              value={values.phone}
              error={errors.phone}
              onChange={setValues("phone")}
              placeholder={PHONE_ZONES[values.phone.phoneZone].example}
              validate={validate(
                ({ value }) =>
                  (!value.phoneNumber && requiredMessage) ||
                  (value.phoneNumber && !isPhoneNumberWellFormated(value.phoneNumber, value.phoneZone) && PHONE_ZONES[value.phoneZone].errorMessage),
              )}
            />
          </section>
          <section className="mb-4">
            <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Adresse</h2>
            <Input label="Adresse" name="address" value={values.address} onChange={setValues("address")} disabled />
            <Input label="Code Postal" name="zip" value={values.zip} onChange={setValues("zip")} disabled />
            <Input label="Ville" name="city" value={values.city} onChange={setValues("city")} disabled />
          </section>
          <section>
            <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Pièce d&apos;identité</h2>
            <div className="flex flex-col gap-2">{young.files.cniFiles && young.files.cniFiles.map((cniFile) => <IdCardReader key={cniFile._id} cniFile={cniFile} />)}</div>
          </section>
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
      <div className="flex flex-col items-center gap-6 py-8">
        {youngCanChangeSession(young) ? (
          <Link to="/changer-de-sejour" className="d-flex gap-2 items-center text-blue-600 text-sm">
            Changer de séjour
          </Link>
        ) : null}
        {/*
			// TODO withdrawal modal
		*/}
        <Link to="changer-de-sejour" className="d-flex gap-2 items-center text-red-600 text-sm">
          Se désister du SNU
        </Link>
      </div>
    </div>
  );
};

export default AccountGeneralPage;
