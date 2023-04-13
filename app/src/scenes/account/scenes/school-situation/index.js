import React from "react";
import useForm from "../../../../hooks/useForm";
import { useSelector } from "react-redux";
import Input from "../../../../components/forms/inputs/Input";
import Select from "../../../../components/forms/inputs/Select";
import { getSchoolGradesOptions, getYoungSchooledSituationOptions } from "../../../../utils/school-situation.utils";
import SectionTitle from "../components/SectionTitle";

const AccountSchoolSituationPage = () => {
  const young = useSelector((state) => state.Auth.young);

  const { values } = useForm({
    initialValues: {
      situation: young.situation || "",
      grade: young.grade || "",
      schoolName: young.schoolName || "",
      schoolCity: young.schoolCity || "",
    },
  });

  return (
    <div className="bg-white shadow-sm mb-6">
      <form>
        <div className="px-4 pt-6 pb-2">
          <SectionTitle>Scolarité</SectionTitle>
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
      </form>
    </div>
  );
};

export default AccountSchoolSituationPage;
