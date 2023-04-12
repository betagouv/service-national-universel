import React from "react";
import Input from "../../../../components/forms/inputs/Input";
import Select from "../../../../components/forms/inputs/Select";
import { useSelector } from "react-redux";
import useForm from "../../../../hooks/useForm";
import validator from "validator";
import InputPhone from "../../../../components/forms/inputs/InputPhone";
import { PHONE_ZONES, PHONE_ZONES_NAMES, isPhoneNumberWellFormated } from "snu-lib/phone-number";

const requiredMessage = "Ce champ est obligatoire";

const AccountGeneralPage = () => {
  const young = useSelector((state) => state.Auth.young);

  const { values, setValues, validate } = useForm({
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
  });

  console.log(young);
  console.log("VALUES >>>", values);

  return (
    <div className="bg-white shadow px-4 py-6">
      <form>
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
            placeholder="example@example.com"
            value={values.email}
            onChange={setValues("email")}
            validate={validate((value) => (!value && requiredMessage) || (!validator.isEmail(value.trim()) && "Veuillez saisir une adresse email valide."))}
          />
          <InputPhone
            label="Téléphone"
            name="phone"
            value={values.phone}
            onChange={setValues("phone")}
            placeholder={PHONE_ZONES[values.phone.phoneZone].example}
            validate={validate((value) => value.phoneNumber && !isPhoneNumberWellFormated(value.phoneNumber, value.phoneZone) && PHONE_ZONES[value.phoneZone].errorMessage)}
          />
        </section>
        <section className="mb-4">
          <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Adresse</h2>
          <Input label="Adresse" name="address" value={values.address} onChange={setValues("address")} disabled />
          <Input label="Code Postal" name="zip" value={values.zip} onChange={setValues("zip")} disabled />
          <Input label="Ville" name="city" value={values.city} onChange={setValues("city")} disabled />
        </section>
        <section>
          <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Pièce d'identité</h2>
        </section>
      </form>
    </div>
  );
};

export default AccountGeneralPage;
