import React from "react";
import Input from "../../../../components/forms/inputs/Input";
import Select from "../../../../components/forms/inputs/Select";
import { getSchoolGradesOptions, getYoungSchooledSituationOptions } from "../../../../utils/school-situation.utils";
import SectionTitle from "../../components/SectionTitle";
import { translateGrade } from "snu-lib";
import FormDescription from "../../components/FormDescription";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import Loader from "@/components/Loader";
import { fetchClass } from "@/services/classe.service";
import { useQuery } from "@tanstack/react-query";
import { validateId } from "@/utils";

const AccountSchoolSituationPage = () => {
  const { young, isCLE } = useAuth();
  const {
    isPending,
    isError,
    data: classe,
  } = useQuery({
    queryKey: ["class", young?.classeId],
    queryFn: () => fetchClass(young?.classeId),
    enabled: validateId(young?.classeId),
  });
  if (isError) toastr.error("Impossible de joindre le service.");

  const values = {
    situation: young.situation || "",
    grade: young.grade || "",
    schoolName: young.schoolName || "",
    schoolCity: young.schoolCity || "",
  };

  if (isPending && isCLE) {
    return <Loader />;
  }
  return (
    <div className="mb-6 bg-white shadow-sm lg:rounded-lg">
      <form>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {isCLE ? (
            <>
              <div className="pt-4 pb-0 md:py-6 pl-6 lg:col-start-1 lg:block">
                <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Situation scolaire</h2>
                <FormDescription>Ma situation scolaire au moment de mon inscription.</FormDescription>
              </div>
              <div className="px-4 pt-6 pb-2 lg:col-span-2 lg:col-start-2">
                <SectionTitle>Scolarité</SectionTitle>
                <Input label="Niveau de scolarité" name="classeName" value={values.grade} disabled />
              </div>
              <hr className="col-span-full mx-4 my-2 md:my-6" />
              <div className="py-6 pl-6 lg:col-start-1 lg:block">
                <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Classe engagée</h2>
              </div>
              <div className="px-4 pt-6 pb-2 lg:col-span-2 lg:col-start-2">
                <Input label="Nom de la classe" name="classeName" value={classe.name} disabled />
                <div className="mb-[1rem]">
                  <label
                    className="m-0 flex min-h-[54px] w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 bg-white py-2 px-3 focus-within:border-blue-600 disabled:border-gray-200"
                    htmlFor="classegrade">
                    <p className=" text-xs leading-4 text-gray-500">Niveau scolaire</p>
                    <div className="flex flex-wrap flex-col gap-2">
                      {classe.grades.map((grade, index) => (
                        <span disabled key={index} className="w-full bg-white text-sm text-gray-400 pl-1">
                          {translateGrade(grade)}
                        </span>
                      ))}
                    </div>
                  </label>
                </div>
                <Input label="Coloration" name="schoolName" value={classe.coloration} disabled />
                <Input label="Nom de l'établissement" name="schoolCity" value={classe.etablissement.name} disabled />
                <Input label="Commune de l'établissement" name="schoolCity" value={classe.etablissement.city} disabled />
              </div>
            </>
          ) : (
            <>
              <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
                <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Situation scolaire</h2>
                <FormDescription>Ma situation scolaire au moment de mon inscription.</FormDescription>
              </div>
              <div className="px-4 pt-6 pb-2 lg:col-span-2 lg:col-start-2">
                <SectionTitle>Scolarité</SectionTitle>
                <FormDescription className="lg:hidden">Ma situation scolaire au moment de mon inscription.</FormDescription>
                <Select label="Statut" name="situation" value={values.situation} disabled>
                  {getYoungSchooledSituationOptions().map(({ label, value }) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Select label="Niveau de scolarité" name="grade" value={values.grade} disabled>
                  {getSchoolGradesOptions().map(({ label, value }) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Input label="Nom de l'établissement" name="schoolName" value={values.schoolName} disabled />
                <Input label="Commune de l'établissement" name="schoolCity" value={values.schoolCity} disabled />
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default AccountSchoolSituationPage;
