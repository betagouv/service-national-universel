import { Select } from "@snu/ds/admin";
import React, { useEffect, useState } from "react";
import { CohortDto, GRADES, region2department, translate, translateGrade } from "snu-lib";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import api from "@/services/api";
import { tr } from "date-fns/locale";

type EligibilityTabsProps = {
  cohort: CohortDto;
  readOnly: boolean;
  getCohort: () => void;
};

type EligibilityTabsState = {
  zones: string[];
  schoolLevels: string[];
  bornAfter: Date | null;
  bornBefore: Date | null;
};

region2department["Étranger"] = ["Etranger"]; // Add Etranger to the list of regions because eligibility can be set to Etranger

export default function EligibilityTab({ cohort, readOnly, getCohort }: EligibilityTabsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [values, setValues] = useState<EligibilityTabsState>({
    zones: [],
    schoolLevels: [],
    bornAfter: null,
    bornBefore: null,
  });

  useEffect(() => {
    setValues({
      zones: cohort.eligibility?.zones || [],
      schoolLevels: cohort.eligibility?.schoolLevels || [],
      bornAfter: cohort.eligibility?.bornAfter || null,
      bornBefore: cohort.eligibility?.bornBefore || null,
    });
  }, [cohort]);

  const onSubmit = async () => {
    try {
      const err = {} as { [key: string]: string };
      if (!values.bornAfter) err.bornAfter = "La date est obligatoire";
      if (!values.bornBefore) err.bornBefore = "La date est obligatoire";
      if (values.bornAfter && values.bornBefore && values.bornAfter > values.bornBefore) {
        err.interval = "L'interval de date n'est pas valide";
      }

      if (values.zones.length === 0) err.zones = "Veuillez sélectionner au moins un département";
      if (values.schoolLevels.length === 0) err.schoolLevels = "Veuillez sélectionner au moins un niveau scolaire";

      setError(err);
      console.log("err", err);
      if (Object.values(err).length > 0) {
        return toastr.warning("Information", "Veuillez corriger les erreurs dans le formulaire");
      }

      setIsLoading(true);
      const { ok, code } = await api.put(`/cohort/${cohort._id?.toString()}/eligibility`, values);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la mise à jour de l'élégibilité", translate(code));
        await getCohort();
        return setIsLoading(false);
      }
      toastr.success("Information", "La session a bien été mise à jour");
      await getCohort();
      setIsLoading(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session", "");
      await getCohort();
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex w-full flex-col gap-8">
          <p className="text-lg font-medium leading-5 text-gray-900">Date de naissances</p>
          <div className="flex w-full gap-4">
            <DatePickerInput
              className={""}
              mode="single"
              label="Né après le"
              placeholder="JJ/MM/AAAA"
              isTime={false}
              value={values.bornAfter}
              onChange={(e) => setValues({ ...values, bornAfter: e })}
              error={error?.bornAfter || ""}
              readOnly={false}
              disabled={isLoading || readOnly}
            />
            <DatePickerInput
              className={""}
              mode="single"
              label="Né avant le"
              placeholder="JJ/MM/AAAA"
              isTime={false}
              value={values.bornBefore}
              onChange={(e) => setValues({ ...values, bornBefore: e })}
              error={error.bornBefore || ""}
              readOnly={false}
              disabled={isLoading || readOnly}
            />
          </div>
        </div>
        {error?.interval && <div className="text-[#EF4444]">{error?.interval}</div>}
      </div>
      <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex w-full flex-col gap-8">
          <p className="text-lg font-medium leading-5 text-gray-900">Situation scolaire</p>
          <div className="flex row w-full gap-4 justify-center">
            {Object.keys(GRADES).map((grade, index) => (
              <div key={grade + "grade" + index} className="flex h-6 items-center">
                <input
                  id={grade}
                  name={grade}
                  type="checkbox"
                  disabled={isLoading || readOnly}
                  checked={values.schoolLevels.includes(grade)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                  onChange={(e) => {
                    const newValues = e.target.checked ? [...values.schoolLevels, grade] : values.schoolLevels.filter((g) => g !== grade);
                    setValues((prev) => ({ ...prev, schoolLevels: newValues }) as EligibilityTabsState);
                  }}
                />
                <label htmlFor={grade} className="mt-1.5 ml-2 text-sm cursor-pointer whitespace-nowrap">
                  {translateGrade(grade)}
                </label>
              </div>
            ))}
          </div>
          {error.schoolLevels && <div className="text-[#EF4444]">{error.schoolLevels}</div>}
        </div>
      </div>
      <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex w-full flex-col gap-8">
          <p className="text-lg font-medium leading-5 text-gray-900">Eligibilité par départements</p>

          <div className="grid grid-cols-2 gap-4">
            {Object.keys(region2department).map((region, index) => (
              <Select
                key={region + "select" + index}
                isMulti={true}
                isClearable={true}
                label={region}
                disabled={isLoading || readOnly}
                options={region2department[region].map((dep) => ({ label: dep, value: dep }))}
                value={values?.zones?.filter((dep) => region2department[region].includes(dep)).map((dep) => ({ label: dep, value: dep }))}
                onChange={(data) => {
                  const newValues = data.map((option) => option.value);
                  setValues(
                    (prev) =>
                      ({
                        ...prev,
                        zones: [...prev.zones.filter((dep) => !region2department[region].includes(dep)), ...newValues],
                      }) as EligibilityTabsState,
                  );
                }}
              />
            ))}
          </div>
        </div>
        {error?.zones && <div className="text-[#EF4444]">{error?.zones}</div>}
      </div>
      {!readOnly && (
        <div className="flex items-center justify-center gap-3 ">
          <ButtonPrimary disabled={isLoading} className="h-[50px] w-[300px]" onClick={onSubmit}>
            {isLoading && <BiLoaderAlt className="h-4 w-4 animate-spin" />}
            Enregistrer
          </ButtonPrimary>
        </div>
      )}
    </div>
  );
}
