import React from "react";
import { useSelector } from "react-redux";
import Checkbox from "../../../../components/forms/inputs/Checkbox";
import Textarea from "../../../../components/forms/inputs/Textarea";
import FormDescription from "../../components/FormDescription";

const AccountSpecialSituationsPage = () => {
  const young = useSelector((state) => state.Auth.young);

  const values = {
    handicap: (young.handicap || "false") === "true" ? true : false,
    ppsBeneficiary: (young.ppsBeneficiary || "false") === "true" ? true : false,
    paiBeneficiary: (young.paiBeneficiary || "false") === "true" ? true : false,
    allergies: (young.allergies || "false") === "true" ? true : false,
    specificAmenagment: (young.specificAmenagment || "false") === "true" ? true : false,
    specificAmenagmentType: young.specificAmenagmentType || "",
    reducedMobilityAccess: (young.reducedMobilityAccess || "false") === "true" ? true : false,
    handicapInSameDepartment: (young.handicapInSameDepartment || "false") === "true" ? true : false,
  };

  return (
    <div className="mb-6 bg-white shadow-sm lg:rounded-lg">
      <form>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="hidden py-6 pl-6 lg:col-start-1 lg:block">
            <h2 className="m-0 mb-1 text-lg font-medium leading-6 text-gray-900">Situations particulières</h2>
            <FormDescription>En fonction des situations signalées, un responsable prendra contact avec vous.</FormDescription>
          </div>
          <div className="px-4 pt-6 pb-2 lg:col-span-2 lg:col-start-2">
            <FormDescription className="lg:hidden">En fonction des situations signalées, un responsable prendra contact avec vous.</FormDescription>
            <Checkbox label="Je suis en situation de handicap" name="handicap" value={values.handicap} disabled useCheckedAsValue />
            <Checkbox label="Je suis bénéficiaire d'un Projet personnalisé de scolarisation (PPS)" name="ppsBeneficiary" value={values.ppsBeneficiary} disabled useCheckedAsValue />
            <Checkbox label="Je suis bénéficiaire d'un Projet d'accueil individualisé (PAI)" name="paiBeneficiary" value={values.paiBeneficiary} disabled useCheckedAsValue />
            <Checkbox label="J'ai des allergies ou intolérances alimentaires" name="allergies" value={values.allergies} disabled useCheckedAsValue />
            <Checkbox label="J'ai besoin d'aménagements spécifiques" name="specificAmenagment" value={values.specificAmenagment} disabled useCheckedAsValue />
            {values.specificAmenagment && <Textarea label="Nature de cet aménagement spécifique" name="specificAmenagmentType" value={values.specificAmenagmentType} disabled />}
            <Checkbox label="Jai besoin dun aménagement pour mobilité réduite" name="reducedMobilityAccess" value={values.reducedMobilityAccess} disabled useCheckedAsValue />
            <Checkbox
              label="Jai besoin dêtre affecté(e) dans un centre de mon département de résidence"
              name="handicapInSameDepartment"
              value={values.handicapInSameDepartment}
              disabled
              useCheckedAsValue
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default AccountSpecialSituationsPage;
