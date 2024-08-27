
import React from "react";
import { toastr } from "react-redux-toastr";
import { Redirect, useHistory, useParams } from "react-router-dom";
import validator from "validator";
import IconFrance from "../../../../assets/IconFrance";
import Toggle from "../../../../components/dsfr/forms/toggle";
import plausibleEvent from "../../../../services/plausible";
import { getCorrectionByStep } from "../../../../utils/navigation";
import SchoolInFrance from "../../components/ShoolInFrance";
import SchoolOutOfFrance from "../../components/ShoolOutOfFrance";
import Input from "../../components/Input";
import Select from "../../../../components/dsfr/forms/Select";
import ErrorMessage from "../../../../components/dsfr/forms/ErrorMessage";

import { useDispatch } from "react-redux";
import { setYoung } from "../../../../redux/auth/actions";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { translate } from "../../../../utils";
import DatePicker from "../../../../components/dsfr/forms/DatePicker";
import ModalSejourCorrection from "../../components/ModalSejourCorrection";
import { supportURL } from "@/config";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import Loader from "@/components/Loader";
import useAuth from "@/services/useAuth";
import { SignupButtons, Checkbox } from "@snu/ds/dsfr";

export default function StepEligibilite() {
  const { young, isCLE } = useAuth();
  function isInFranceOrOut(young) {
    if (young.schoolCountry !== "FRANCE") {
      return true;
    } else {
      return false;
    }
  }

  const [data, setData] = React.useState({
    frenchNationality: young?.frenchNationality,
    birthDate: new Date(young?.birthdateAt),
    school: young?.schooled
      ? {
          fullName: young?.schoolName,
          type: young?.schoolType,
          adresse: young?.schoolAddress,
          codeCity: young?.schoolZip,
          city: young?.schoolCity,
          departmentName: young?.schoolDepartment,
          region: young?.schoolRegion,
          country: young?.schoolCountry,
          id: young?.schoolId,
          postCode: young?.schoolZip,
          zip: young?.schoolZip,
        }
      : null,
    scolarity: young?.grade,
    zip: young?.zip,
    isAbroad: isInFranceOrOut(young),
  });

  const dispatch = useDispatch();
  const [error, setError] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [toggleVerify, setToggleVerify] = React.useState(false);
  const [modal, setModal] = React.useState({ isOpen: false });

  const { step } = useParams();
  const corrections = getCorrectionByStep(young, step);
  const history = useHistory();

  const optionsScolarite = [
    { value: "NOT_SCOLARISE", label: "Non scolarisé(e)" },
    { value: "4eme", label: "4ème" },
    { value: "3eme", label: "3ème" },
    { value: "2ndePro", label: "2de professionnelle" },
    { value: "2ndeGT", label: "2de générale et technologique" },
    { value: "1erePro", label: "1ère professionnelle" },
    { value: "1ereGT", label: "1ère générale et technologique" },
    { value: "TermPro", label: "Terminale professionnelle" },
    { value: "TermGT", label: "Terminale générale et technologique" },
    { value: "1ereCAP", label: "CAP 1ère année" },
    { value: "2ndeCAP", label: "CAP 2ème année" },
    { value: "Autre", label: "Scolarisé(e) (autre niveau)" },
  ];

  const onSubmit = async () => {
    let errors = {};

    // Nationality
    if (!data?.frenchNationality) {
      errors.frenchNationality = "Vous devez être français";
    }
    // Scolarity
    if (!data?.scolarity) {
      errors.scolarity = "Choisissez un niveau de scolarité";
    }
    // Birthdate
    // ? Check age ?
    if (!data?.birthDate) {
      errors.birthDate = "Vous devez saisir une date de naissance";
    }

    if (data.scolarity) {
      if (data.scolarity === "NOT_SCOLARISE") {
        // Zip du jeune
        // ! Vérifie que ça a la bouille d'un zipcode mais ds les faits, on peut mettre nimp en 5 chiffres
        if (!data?.isAbroad && !(data?.zip && validator.isPostalCode(data?.zip, "FR"))) {
          errors.zip = "Vous devez sélectionner un code postal";
        }
      } else {
        // School
        if (!validateSchool(data)) {
          // Permet de rentrer dans la gestion d'erreur et ne pas valider le formulaire
          errors.school = "Vous devez renseigner complètement votre établissement scolaire";
        }
      }
    }

    function validateSchool(data) {
      if (data.isAbroad) {
        if (!data?.school?.fullName) return false;
        if (!data?.school?.country) return false;
        return true;
      } else {
        if (!data?.school?.fullName) return false;
        if (!data?.school?.city) return false;
        if (!data?.school?.postCode && !data?.school?.postcode && !data?.school?.zip && !data?.school?.codePays) return false;
        return true;
      }
    }

    setError(errors);
    setToggleVerify(!toggleVerify);

    // ! Gestion erreur a reprendre
    if (Object.keys(errors).length) {
      console.warn("Pb avec ce champ : " + Object.keys(errors)[0] + " pour la raison : " + Object.values(errors)[0]);
      toastr.error("Un problème est survenu : Vérifiez que vous avez rempli tous les champs");
      return;
    }

    setLoading(true);
    plausibleEvent("Phase0/CTA demande correction - Corriger Eligibilite");

    const updates = {
      grade: data.scolarity,
      schooled: data.school ? "true" : "false",
      schoolName: data.school?.fullName,
      schoolType: data.school?.type,
      schoolAddress: data.school?.address || data.school?.adresse,
      schoolZip: data.school?.postCode || data.school?.postcode || data.school?.zip,
      schoolCity: data.school?.city,
      schoolDepartment: data.school?.departmentName || data.school?.department,
      schoolRegion: data.school?.region,
      schoolCountry: data.school?.country,
      schoolId: data.school?.id,
      zip: data.zip,
      birthdateAt: new Date(data.birthDate),
    };

    try {
      const updatedYoung = { ...young, ...updates };
      const res = await api.post(`/cohort-session/eligibility/2023`, updatedYoung);
      if (!res.ok) throw new Error(translate(res.code));

      const cohorts = res.data.length > 0 ? res.data : null;

      if (res.data.msg || !cohorts) {
        let res = await api.put("/young/inscription2023/noneligible");
        if (!res.ok) throw new Error(translate(res.code));

        res = await api.put("/young/inscription2023/eligibilite", updates);
        if (!res.ok) throw new Error(translate(res.code));

        dispatch(setYoung(res.data));
        return history.push("/noneligible");
      }

      updates.sessions = cohorts;

      if (cohorts.some((c) => young.cohort === c.name)) {
        const res = await api.put("/young/inscription2023/eligibilite", updates);
        if (!res.ok) throw new Error(translate(res.code));
        dispatch(setYoung(res.data));
        toastr.success("La correction a été prise en compte");
        history.push("/");
      } else {
        setModal({ data: updates, isOpen: true, onValidation });
      }
    } catch (e) {
      setLoading(false);
      capture(e);
      toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  };

  const onValidation = async (updates, cohort) => {
    try {
      const res = await api.put("/young/inscription2023/eligibilite", updates);
      if (!res.ok) throw new Error(translate(code));

      const { ok, code, data: responseData } = await api.put(`/young/inscription2023/changeCohort`, { cohort });
      if (!ok) throw new Error(translate(code));
      dispatch(setYoung(responseData));
      toastr.success("La correction a été prise en compte");
      history.push("/");
    } catch (e) {
      setLoading(false);
      capture(e);
      toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  };

  if (!young) return <Loader />;
  if (!corrections) return <Redirect to="/" />;

  return (
    <>
      <DSFRContainer title="Vérifiez votre éligibilité au SNU" supportLink={supportURL + "/base-de-connaissance/phase-0-les-inscriptions"}>
        <div className="space-y-5">
          <Checkbox
            state={error.frenchNationality && "error"}
            stateRelatedMessage={error.frenchNationality}
            options={[
              {
                label: (
                  <span className="flex items-center">
                    <span className="mr-2">Je suis de nationalité française</span> <IconFrance />
                  </span>
                ),
                nativeInputProps: {
                  disabled: !isCLE,
                  checked: data.frenchNationality === "true",
                  onChange: (e) => setData({ ...data, frenchNationality: e.target.checked ? "true" : "false" }),
                },
              },
            ]}
          />
          <Select
            label="Niveau de scolarité"
            value={data.scolarity}
            options={optionsScolarite}
            onChange={(value) => {
              setData({ ...data, scolarity: value, school: value === "NOT_SCOLARISE" ? null : data.school });
            }}
            error={error.scolarity}
            correction={corrections.grade}
          />
          <label className="flex-start mt-2 flex w-full flex-col text-base">
            Date de naissance
            <DatePicker disabled={true} initialValue={data.birthDate} onChange={(date) => setData({ ...data, birthDate: date })} />
            <ErrorMessage>{error.birthDate}</ErrorMessage>
            <ErrorMessage>{corrections.birthdateAt}</ErrorMessage>
          </label>
          {data.scolarity && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div>
                    <span className="font-bold">{data.scolarity === "NOT_SCOLARISE" ? "Je réside" : "Mon établissement scolaire est"}</span> en France
                  </div>
                  <div className="flex h-5 items-center">
                    <span className="text-xs leading-5 text-[#666666]">Métropolitaine ou Outre-mer</span>
                  </div>
                </div>

                <Toggle onClick={() => setData({ ...data, isAbroad: !data.isAbroad, zip: data.isAbroad ? null : data.zip })} toggled={!data.isAbroad} />
              </div>

              {data.scolarity !== "NOT_SCOLARISE" ? (
                data.isAbroad ? (
                  <SchoolOutOfFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} corrections={corrections} />
                ) : (
                  <SchoolInFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} errors={error} corrections={corrections} />
                )
              ) : !data.isAbroad ? (
                <Input value={data.zip} onChange={(e) => setData({ ...data, zip: e })} label="Code Postal" error={error.zip} correction={corrections.zip} />
              ) : null}
            </>
          )}
          <SignupButtons labelNext="Corriger" onClickNext={onSubmit} loading={loading} />
        </div>
      </DSFRContainer>
      <ModalSejourCorrection data={modal?.data} isOpen={modal.isOpen} onCancel={() => setModal({ isOpen: false })} onValidation={modal?.onValidation} />
    </>
  );
}
