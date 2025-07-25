import { Select } from "@snu/ds/admin";
import React, { useEffect, useState } from "react";
import { CohortDto, GRADES, region2department, translate, translateGrade } from "snu-lib";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { BiLoaderAlt } from "react-icons/bi";
import { toastr } from "react-redux-toastr";
import { capture } from "@/sentry";
import { IoWarningOutline } from "react-icons/io5";
import ReactTooltip from "react-tooltip";
import { useUpdateEligibilityMutation } from "@/scenes/settings/general/hooks/useCohortUpdate";

type EligibilityTabsProps = {
  cohort: CohortDto;
  readOnly?: boolean;
};

export type EligibilityForm = {
  zones: string[];
  schoolLevels: string[];
  bornAfter: Date | null;
  bornBefore: Date | null;
};

type ErrorForm = {
  zones?: string;
  schoolLevels?: string;
  bornAfter?: string;
  bornBefore?: string;
  interval?: string;
};

region2department["Étranger"] = ["Etranger"]; // Add Etranger to the list of regions because eligibility can be set to Etranger

export default function EligibilityTab({ cohort, readOnly }: EligibilityTabsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorForm>({});
  const [formValues, setFormValues] = useState<EligibilityForm>({
    zones: [],
    schoolLevels: [],
    bornAfter: null,
    bornBefore: null,
  });
  const updateEligibilityMutation = useUpdateEligibilityMutation();

  useEffect(() => {
    setFormValues({
      zones: cohort?.eligibility?.zones || [],
      schoolLevels: cohort?.eligibility?.schoolLevels || [],
      bornAfter: cohort?.eligibility?.bornAfter || null,
      bornBefore: cohort?.eligibility?.bornBefore || null,
    });
  }, [cohort]);

  const onSubmit = async () => {
    if (!cohort._id) return;
    try {
      const err: ErrorForm = {};
      if (!formValues.bornAfter) err.bornAfter = "La date est obligatoire";
      if (!formValues.bornBefore) err.bornBefore = "La date est obligatoire";
      if (formValues.bornAfter && formValues.bornBefore && formValues.bornAfter > formValues.bornBefore) {
        err.interval = "L'interval de date n'est pas valide";
      }

      if (formValues.zones.length === 0) err.zones = "Veuillez sélectionner au moins un département";
      if (formValues.schoolLevels.length === 0) err.schoolLevels = "Veuillez sélectionner au moins un niveau scolaire";

      setError(err);
      if (Object.values(err).length > 0) {
        return toastr.warning("Information", "Veuillez corriger les erreurs dans le formulaire");
      }

      updateEligibilityMutation.mutate({
        cohortId: cohort._id.toString(),
        data: formValues,
      });
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la mise à jour de la session", "");
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-8 rounded-xl bg-white px-8 pb-12 pt-8 shadow-[0_8px_16px_0_rgba(0,0,0,0.05)]">
        <div className="flex w-full flex-col gap-8">
          <p className="text-lg font-medium leading-5 text-gray-900">Éligibilités par dates de naissance</p>
          <div className="flex w-full gap-4">
            <DatePickerInput
              className={""}
              mode="single"
              label="Né après le"
              placeholder="JJ/MM/AAAA"
              isTime={false}
              // @ts-ignore
              value={formValues.bornAfter}
              onChange={(e) => setFormValues({ ...formValues, bornAfter: e })}
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
              // @ts-ignore
              value={formValues.bornBefore}
              onChange={(e) => setFormValues({ ...formValues, bornBefore: e })}
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
          <p className="text-lg font-medium leading-5 text-gray-900">Éligibilités par situations scolaire</p>
          <div className="flex row w-full gap-4 justify-center">
            {Object.keys(GRADES).map((grade, index) => (
              <div key={grade + "grade" + index} className="flex h-6 items-center">
                <input
                  id={grade}
                  name={grade}
                  type="checkbox"
                  disabled={isLoading || readOnly}
                  checked={formValues.schoolLevels.includes(grade)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                  onChange={(e) => {
                    const newValues = e.target.checked ? [...formValues.schoolLevels, grade] : formValues.schoolLevels.filter((g) => g !== grade);
                    setFormValues((prev: EligibilityForm) => ({ ...prev, schoolLevels: newValues }));
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
          <p className="text-lg font-medium leading-5 text-gray-900">Éligibilités par départements</p>

          <div className="grid grid-cols-2 gap-10">
            {Object.keys(region2department).map((region, index) => {
              const departmentsSelected = formValues?.zones?.filter((dep) => region2department[region].includes(dep));
              const isAllSelected = departmentsSelected.length === region2department[region].length;

              return (
                <div key={region + "eligibility" + index} className="flex flex-col gap-0">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-500 mt-1.5 ml-2">{region}</label>
                      {!departmentsSelected.length && (
                        <>
                          <IoWarningOutline className="h-4 w-4 text-amber-500 cursor-pointer" data-tip data-for={region + "tooltip"} />
                          <ReactTooltip id={region + "tooltip"} type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
                            <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">Aucun département n'a été sélectionné dans cette région</p>
                          </ReactTooltip>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label htmlFor={region + "selectAll"} className="mt-1.5 ml-2 text-sm cursor-pointer whitespace-nowrap">
                        Sélectionner tout
                      </label>
                      <input
                        id={region + "selectAll"}
                        name={region + "selectAll"}
                        type="checkbox"
                        checked={isAllSelected}
                        disabled={isLoading || readOnly}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...new Set([...formValues.zones, ...region2department[region]])]
                            : formValues.zones.filter((dep) => !region2department[region].includes(dep));
                          setFormValues((prev: EligibilityForm) => ({ ...prev, zones: newValues }));
                        }}
                      />
                    </div>
                  </div>
                  <Select
                    isMulti={true}
                    isClearable={true}
                    placeholder="Sélectionner un ou plusieurs départements"
                    disabled={isLoading || readOnly}
                    options={region2department[region].map((dep) => ({ label: dep, value: dep }))}
                    value={departmentsSelected.map((dep) => ({ label: dep, value: dep }))}
                    onChange={(data) => {
                      const newValues = data.map((option) => option.value);
                      setFormValues((prev: EligibilityForm) => ({
                        ...prev,
                        zones: [...prev.zones.filter((dep) => !region2department[region].includes(dep)), ...newValues],
                      }));
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
        {error?.zones && <div className="text-[#EF4444]">{error.zones}</div>}
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
