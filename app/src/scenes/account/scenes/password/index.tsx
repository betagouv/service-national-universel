import React from "react";
import ButtonPrimary from "../../../../components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import InputPassword from "../../../../components/forms/inputs/InputPassword";
import FormDescription from "../../components/FormDescription";
import SectionTitle from "../../components/SectionTitle";
import ButtonLight from "../../../../components/ui/buttons/ButtonLight";
import useUpdatePassword from "../../lib/useUpdatePassword";
import { useForm } from "react-hook-form";

type FormValues = {
  password: string;
  newPassword: string;
  verifyPassword: string;
};

const AccountPasswordPage = () => {
  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>();
  const { mutate: updatePassword, isPending: isSubmitting } = useUpdatePassword();
  const handleChangePasswordSubmit = (formValues: FormValues) => {
    updatePassword(formValues);
  };

  return (
    <div className="mb-6 bg-white shadow-sm lg:rounded-lg">
      <form onSubmit={handleSubmit(handleChangePasswordSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
            <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Mot de passe</h2>
            <FormDescription>Vous pouvez modifier votre mot de passe si vous le souhaitez</FormDescription>
          </div>
          <div className="px-4 pt-6 pb-2 lg:col-span-2 lg:col-start-2">
            <FormDescription className="lg:hidden">Vous pouvez modifier votre mot de passe si vous le souhaitez</FormDescription>
            <SectionTitle>Mon mot de passe</SectionTitle>
            <InputPassword label="Actuel" error={errors?.password?.message} required {...register("password")} />
            <InputPassword label="Nouveau mot de passe" error={errors?.newPassword?.message} required {...register("newPassword")} />
            <InputPassword
              label="Confirmer nouveau mot de passe"
              error={errors?.verifyPassword?.message}
              required
              {...register("verifyPassword", { validate: (value) => value === watch("newPassword") || "Les mots de passe ne correspondent pas." })}
            />
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-gray-50 py-3 px-4 lg:flex-row lg:justify-end">
          <ButtonLight className="w-full bg-white lg:w-fit" onClick={reset}>
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
