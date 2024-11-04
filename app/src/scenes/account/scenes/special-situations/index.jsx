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
            <Checkbox label="Je suis en situation de handicap" name="handicap" checked={values.handicap} disabled />
            <Checkbox label="Je suis bénéficiaire d'un Projet personnalisé de scolarisation (PPS)" name="ppsBeneficiary" checked={values.ppsBeneficiary} disabled />
            <Checkbox label="Je suis bénéficiaire d'un Projet d'accueil individualisé (PAI)" name="paiBeneficiary" checked={values.paiBeneficiary} disabled />
            <Checkbox label="J'ai des allergies ou intolérances alimentaires" name="allergies" checked={values.allergies} disabled />
            <Checkbox label="J'ai besoin d'aménagements spécifiques" name="specificAmenagment" checked={values.specificAmenagment} disabled />
            {values.specificAmenagment === "true" && values.specificAmenagmentType !== "Contenu supprimé" && (
              <Textarea label="Nature de cet aménagement spécifique" name="specificAmenagmentType" checked={values.specificAmenagmentType} disabled />
            )}
            <Checkbox label="J'ai besoin d'un aménagement pour mobilité réduite" name="reducedMobilityAccess" checked={values.reducedMobilityAccess} disabled />
            <Checkbox
              label="J'ai besoin d'être affecté(e) dans un centre de mon département de résidence"
              name="handicapInSameDepartment"
              checked={values.handicapInSameDepartment}
              disabled
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default AccountSpecialSituationsPage;
