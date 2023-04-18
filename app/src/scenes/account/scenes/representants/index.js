import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import SectionTitle from "../../components/SectionTitle";
import { useForm } from "react-hook-form";

const AccountRepresentantsPage = () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [hasParent2, setHasParent2] = useState(young?.parent2Email || false);

  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    getValues,
    register,
    control,
    trigger,
  } = useForm({
    defaultValues: {
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
    mode: "onChange",
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

  useEffect(() => {
    trigger();
  }, [hasParent2]);

  return (
    <div className="bg-white shadow-sm mb-6 lg:rounded-lg">
      <form onSubmit={handleSubmit(handleSubmitRepresentantsForm)}>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden lg:block lg:col-start-1 py-6 pl-6">
            <h2 className="text-gray-900 text-lg leading-6 font-medium m-0 mb-1">Représentants légaux</h2>
          </div>
          <div className="px-4 pt-6 pb-2 lg:col-start-2 lg:col-span-2">
            <section className="mb-4">
              <SectionTitle>Représentant légal 1</SectionTitle>
              <Select label="Statut" {...register("parent1Status")}>
                <option value="mother">Mère</option>
                <option value="father">Père</option>
                <option value="representant">Représentant légal</option>
              </Select>
              <Input
                label="Nom"
                placeholder="Dupond"
                {...register("parent1LastName", {
                  validate: validateRequired,
                })}
                error={errors?.parent1LastName?.message}
              />
              <Input
                label="Prénom"
                placeholder="Gaspard"
                {...register("parent1FirstName", {
                  validate: validateRequired,
                })}
                error={errors?.parent1FirstName?.message}
              />
              <Input
                type="email"
                label="Adresse email"
                error={errors?.parent1Email?.message}
                placeholder="example@example.com"
                {...register("parent1Email", {
                  validate: validateEmail,
                })}
              />
              <InputPhone
                label="Téléphone"
                error={errors?.parent1Phone?.message}
                placeholder={PHONE_ZONES[getValues().parent1Phone.phoneZone].example}
                control={control}
                name="parent1Phone"
                rules={{ validate: validatePhoneNumber }}
              />
            </section>
            <Checkbox label="Je ne possède pas de second(e) réprésensant(e) légal(e)" onChange={setHasParent2} value={hasParent2} useCheckedAsValue />
            {hasParent2 && (
              <section className="mb-4">
                <SectionTitle>Représentant légal 2</SectionTitle>
                <Select label="Statut" {...register("parent2Status")}>
                  <option value="mother">Mère</option>
                  <option value="father">Père</option>
                  <option value="representant">Représentant légal</option>
                </Select>
                <Input
                  label="Nom"
                  placeholder="Dupond"
                  {...register("parent2LastName", {
                    validate: validateRequired,
                  })}
                  error={errors?.parent2LastName?.message}
                />
                <Input
                  label="Prénom"
                  placeholder="Gaspard"
                  {...register("parent2FirstName", {
                    validate: validateRequired,
                  })}
                  error={errors?.parent2FirstName?.message}
                />
                <Input
                  type="email"
                  label="Adresse email"
                  error={errors?.parent2Email?.message}
                  placeholder="example@example.com"
                  {...register("parent2Email", {
                    validate: validateEmail,
                  })}
                />
                <InputPhone
                  label="Téléphone"
                  name="parent2Phone"
                  error={errors?.parent2Phone?.message}
                  placeholder={PHONE_ZONES[getValues().parent2Phone.phoneZone].example}
                  control={control}
                  rules={{ validate: validatePhoneNumber }}
                />
              </section>
            )}
          </div>
        </div>
        <div className="bg-gray-50 py-3 px-4 flex flex-col lg:flex-row lg:justify-end gap-3">
          <ButtonLinkLight className="w-full lg:w-fit" to="/account">
            Annuler
          </ButtonLinkLight>
          <ButtonPrimary type="submit" className="w-full lg:w-fit" disabled={isSubmitting || !isValid}>
            {isSubmitting && <BiLoaderAlt className="animate-spin" />}
            Enregistrer
          </ButtonPrimary>
        </div>
      </form>
    </div>
  );
};

export default AccountRepresentantsPage;
