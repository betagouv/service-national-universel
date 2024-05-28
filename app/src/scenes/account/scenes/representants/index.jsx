import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PHONE_ZONES } from "snu-lib";
import { setYoung } from "../../../../redux/auth/actions";
import { toastr } from "react-redux-toastr";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import InputPhone from "../../../../components/forms/inputs/InputPhone";
import Select from "../../../../components/forms/inputs/Select";
import Input from "../../../../components/forms/inputs/Input";
import Checkbox from "../../../../components/forms/inputs/Checkbox";
import { validateEmail, validatePhoneNumber, validateRequired } from "../../../../utils/form-validation.utils";
import { updateYoung } from "../../../../services/young.service";
import SectionTitle from "../../components/SectionTitle";
import ButtonLight from "../../../../components/ui/buttons/ButtonLight";

const getInitialFormValues = (young) => ({
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
});

const AccountRepresentantsPage = () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  const [formValues, setFormValues] = useState(getInitialFormValues(young));

  const [errors, setErrors] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasParent2, setHasParent2] = useState(young?.parent2Email ? true : false);

  const validateForm = () => {
    const foundErrors = {};
    let hasError = false;
    const parent1LastNameError = validateRequired({ value: formValues.parent1LastName });
    const parent1FirstNameError = validateRequired({ value: formValues.parent1FirstName });
    const parent1EmailError = validateEmail({ value: formValues.parent1Email });
    const parent1PhoneError = validatePhoneNumber({ value: formValues.parent1Phone });
    if (parent1LastNameError) {
      foundErrors.parent1LastName = parent1LastNameError;
      hasError = true;
    }
    if (parent1FirstNameError) {
      foundErrors.parent1FirstName = parent1FirstNameError;
      hasError = true;
    }
    if (parent1EmailError) {
      foundErrors.parent1Email = parent1EmailError;
      hasError = true;
    }
    if (parent1PhoneError) {
      foundErrors.parent1Phone = parent1PhoneError;
      hasError = true;
    }
    if (hasParent2) {
      const parent2LastNameError = validateRequired({ value: formValues.parent2LastName });
      const parent2FirstNameError = validateRequired({ value: formValues.parent2FirstName });
      const parent2EmailError = validateEmail({ value: formValues.parent2Email });
      const parent2PhoneError = validatePhoneNumber({ value: formValues.parent2Phone });
      if (parent2LastNameError) {
        foundErrors.parent2LastName = parent2LastNameError;
        hasError = true;
      }
      if (parent2FirstNameError) {
        foundErrors.parent2FirstName = parent2FirstNameError;
        hasError = true;
      }
      if (parent2EmailError) {
        foundErrors.parent2Email = parent2EmailError;
        hasError = true;
      }
      if (parent2PhoneError) {
        foundErrors.parent2Phone = parent2PhoneError;
        hasError = true;
      }
    }
    setErrors(foundErrors);
    return !hasError;
  };

  const handleChangeParent2 = (value) => {
    setHasParent2(value);
    if (!value) {
      setFormValues((prevValues) => ({
        ...prevValues,
        parent2Status: "",
        parent2LastName: "",
        parent2FirstName: "",
        parent2Email: "",
        parent2Phone: {
          phoneNumber: "",
          phoneZone: "",
        },
      }));
    }
  };

  const handleSubmitRepresentantsForm = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      setIsSubmitting(true);

      const youngDataToUpdate = {
        parent1Status: formValues.parent1Status,
        parent1LastName: formValues.parent1LastName.trim(),
        parent1FirstName: formValues.parent1FirstName.trim(),
        parent1Phone: formValues.parent1Phone.phoneNumber.trim(),
        parent1PhoneZone: formValues.parent1Phone.phoneZone,
        parent1Email: formValues.parent1Email.trim(),
        parent2: hasParent2,
      };
      if (hasParent2) {
        youngDataToUpdate.parent2Status = formValues.parent2Status;
        youngDataToUpdate.parent2LastName = formValues.parent2LastName.trim();
        youngDataToUpdate.parent2FirstName = formValues.parent2FirstName.trim();
        youngDataToUpdate.parent2Phone = formValues.parent2Phone.phoneNumber.trim();
        youngDataToUpdate.parent2PhoneZone = formValues.parent2Phone.phoneZone;
        youngDataToUpdate.parent2Email = formValues.parent2Email.trim();
      } else {
        youngDataToUpdate.parent2Status = "";
        youngDataToUpdate.parent2LastName = "";
        youngDataToUpdate.parent2FirstName = "";
        youngDataToUpdate.parent2Phone = "";
        youngDataToUpdate.parent2PhoneZone = "AUTRE";
        youngDataToUpdate.parent2Email = "";
      }

      const { title, message, data: updatedYoung } = await updateYoung("parents", youngDataToUpdate);
      toastr.success(title, message);
      dispatch(setYoung(updatedYoung));
    } catch (error) {
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
    setHasParent2(young?.parent2Email ? true : false);
    setFormValues(getInitialFormValues(young));
  };

  return (
    <div className="mb-6 bg-white shadow-sm lg:rounded-lg">
      <form onSubmit={handleSubmitRepresentantsForm}>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
            <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Représentants légaux</h2>
          </div>
          <div className="px-4 pt-6 pb-2 lg:col-span-2 lg:col-start-2">
            <section className="mb-4">
              <SectionTitle>Représentant légal 1</SectionTitle>
              <Select label="Statut" name="parent1Status" value={formValues.parent1Status} onChange={handleChangeValue("parent1Status")}>
                <option value="mother">Mère</option>
                <option value="father">Père</option>
                <option value="representant">Représentant légal</option>
              </Select>
              <Input
                label="Nom"
                name="parent1LastName"
                placeholder="Dupond"
                onChange={handleChangeValue("parent1LastName")}
                value={formValues.parent1LastName}
                error={errors?.parent1LastName}
              />
              <Input
                label="Prénom"
                name="parent1FirstName"
                placeholder="Gaspard"
                onChange={handleChangeValue("parent1FirstName")}
                value={formValues.parent1FirstName}
                error={errors?.parent1FirstName}
              />
              <Input
                type="email"
                label="Adresse email"
                name="parent1Email"
                error={errors?.parent1Email}
                placeholder="example@example.com"
                value={formValues.parent1Email}
                onChange={handleChangeValue("parent1Email")}
              />
              <InputPhone
                label="Téléphone"
                name="parent1Phone"
                value={formValues.parent1Phone}
                error={errors?.parent1Phone}
                onChange={handleChangeValue("parent1Phone")}
                placeholder={PHONE_ZONES[formValues.parent1Phone.phoneZone]?.example}
              />
            </section>
            {/* <Checkbox label="Je renseigne un(e) second(e) représentant(e) légal(e)" onChange={(value) => setHasParent2(value)} value={hasParent2} useCheckedAsValue /> */}
            <Checkbox label="Je renseigne un(e) second(e) représentant(e) légal(e)" onChange={handleChangeParent2} value={hasParent2} useCheckedAsValue />
            {hasParent2 && (
              <section className="mb-4">
                <SectionTitle>Représentant légal 2</SectionTitle>
                <Select label="Statut" name="parent2Status" value={formValues.parent2Status} onChange={handleChangeValue("parent2Status")}>
                  <option value="mother">Mère</option>
                  <option value="father">Père</option>
                  <option value="representant">Représentant légal</option>
                </Select>
                <Input
                  label="Nom"
                  name="parent2LastName"
                  placeholder="Dupond"
                  onChange={handleChangeValue("parent2LastName")}
                  value={formValues.parent2LastName}
                  error={errors?.parent2LastName}
                />
                <Input
                  label="Prénom"
                  name="parent2FirstName"
                  placeholder="Gaspard"
                  onChange={handleChangeValue("parent2FirstName")}
                  value={formValues.parent2FirstName}
                  error={errors?.parent2FirstName}
                />
                <Input
                  type="email"
                  label="Adresse email"
                  name="parent2Email"
                  error={errors?.parent2Email}
                  placeholder="example@example.com"
                  value={formValues.parent2Email}
                  onChange={handleChangeValue("parent2Email")}
                />
                <InputPhone
                  label="Téléphone"
                  name="parent2Phone"
                  value={formValues.parent2Phone}
                  error={errors?.parent2Phone}
                  onChange={handleChangeValue("parent2Phone")}
                  placeholder={PHONE_ZONES[formValues.parent2Phone.phoneZone]?.example}
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
