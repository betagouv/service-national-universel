import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useForm from "../../../../hooks/useForm";
import { PHONE_ZONES, PHONE_ZONES_NAMES } from "snu-lib/phone-number";
import { setYoung } from "../../../../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import ButtonLinkLight from "../../../../components/ui/buttons/ButtonLinkLight";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import InputPhone from "../../../../components/forms/inputs/InputPhone";
import Select from "../../../../components/forms/inputs/Select";
import Input from "../../../../components/forms/inputs/Input";
import Checkbox from "../../../../components/forms/inputs/Checkbox";
import { validateEmail, validatePhoneNumber, validateRequired } from "../../../../utils/form-validation.utils";
import { updateYoung } from "../../../../services/young.service";

const AccountRepresentantsPage = () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [hasParent2, setHasParent2] = useState(young?.parent2Email || false);

  const { values, setValues, validate, errors, handleSubmit, isSubmitionPending, isValid } = useForm({
    initialValues: {
      parent1Status: young?.parent1Status || "representant",
      parent1LastName: young?.parent1LastName || "",
      parent1FirstName: young?.parent1FirstName || "",
      parent1Email: young?.parent1Email || "",
      parent1Phone: {
        phoneNumber: young?.parent1Phone || "",
        phoneZone: young?.parent1PhoneZone || PHONE_ZONES_NAMES.FRANCE,
      },
      parent2Status: young?.parent2Status || "representant",
      parent2LastName: young?.parent2LastName || "",
      parent2FirstName: young?.parent2FirstName || "",
      parent2Email: young?.parent2Email || "",
      parent2Phone: {
        phoneNumber: young?.parent2Phone || "",
        phoneZone: young?.parent2PhoneZone || PHONE_ZONES_NAMES.FRANCE,
      },
    },
    validateOnChange: true,
  });

  const handleSubmitRepresentantsForm = async (values) => {
    try {
      const youngDataToUpdate = {
        ...values,
        parent1Phone: values.parent1Phone.phoneNumber.trim(),
        parent1PhoneZone: values.parent1Phone.phoneZone,
        parent1Email: values.parent1Email.trim(),
        parent2Phone: values.parent2Phone.phoneNumber.trim(),
        parent2PhoneZone: values.parent2Phone.phoneZone,
        parent2Email: values.parent2Email.trim(),
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
    <div className="bg-white shadow-sm mb-6">
      <form onSubmit={handleSubmit(handleSubmitRepresentantsForm)}>
        <div className="px-4 py-6">
          <section className="mb-4">
            <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Représentant légal 1</h2>
            <Select label="Statut" name="parent1Status" value={values.parent1Status} onChange={setValues("parent1Status")}>
              <option value="mother">Mère</option>
              <option value="father">Père</option>
              <option value="representant">Représentant légal</option>
            </Select>
            <Input
              label="Nom"
              name="parent1LastName"
              placeholder="Dupond"
              validate={validate(validateRequired)}
              onChange={setValues("parent1LastName")}
              value={values.parent1LastName}
              error={errors.parent1LastName}
            />
            <Input
              label="Prénom"
              name="parent1FirstName"
              placeholder="Gaspard"
              validate={validate(validateRequired)}
              onChange={setValues("parent1FirstName")}
              value={values.parent1FirstName}
              error={errors.parent1FirstName}
            />
            <Input
              type="email"
              label="Adresse email"
              name="parent1Email"
              error={errors.parent1Email}
              placeholder="example@example.com"
              value={values.parent1Email}
              onChange={setValues("parent1Email")}
              validate={validate(validateEmail)}
            />
            <InputPhone
              label="Téléphone"
              name="parent1Phone"
              value={values.parent1Phone}
              error={errors.parent1Phone}
              onChange={setValues("parent1Phone")}
              placeholder={PHONE_ZONES[values.parent1Phone.phoneZone].example}
              validate={validate(validatePhoneNumber)}
            />
          </section>
          <Checkbox label="Je ne possède pas de second(e) réprésensant(e) légal(e)" onChange={setHasParent2} value={hasParent2} useCheckedAsValue />
          {hasParent2 && (
            <section className="mb-4">
              <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Représentant légal 2</h2>
              <Select label="Statut" name="parent2Status" value={values.parent2Status} onChange={setValues("parent2Status")}>
                <option value="mother">Mère</option>
                <option value="father">Père</option>
                <option value="representant">Représentant légal</option>
              </Select>
              <Input
                label="Nom"
                name="parent2LastName"
                placeholder="Dupond"
                validate={validate(validateRequired)}
                onChange={setValues("parent2LastName")}
                value={values.parent2LastName}
                error={errors.parent2LastName}
              />
              <Input
                label="Prénom"
                name="parent2FirstName"
                placeholder="Gaspard"
                validate={validate(validateRequired)}
                onChange={setValues("parent2FirstName")}
                value={values.parent2FirstName}
                error={errors.parent2FirstName}
              />
              <Input
                type="email"
                label="Adresse email"
                name="parent2Email"
                error={errors.parent2Email}
                placeholder="example@example.com"
                value={values.parent2Email}
                onChange={setValues("parent2Email")}
                validate={validate(validateEmail)}
              />
              <InputPhone
                label="Téléphone"
                name="parent2Phone"
                value={values.parent2Phone}
                error={errors.parent2Phone}
                onChange={setValues("parent2Phone")}
                placeholder={PHONE_ZONES[values.parent2Phone.phoneZone].example}
                validate={validate(validatePhoneNumber)}
              />
            </section>
          )}
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

export default AccountRepresentantsPage;
