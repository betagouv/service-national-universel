import React, { useEffect } from "react";
import { Link, useHistory } from "react-router-dom";
import Toggle from "../../../components/inscription/toggle";
import Input from "../../../components/inscription/input";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import { toastr } from "react-redux-toastr";
import StickyButton from "../../../components/inscription/stickyButton";
import IconFrance from "../../../assets/IconFrance";
import validator from "validator";
import plausibleEvent from "../../../services/plausible";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";
import SearchableSelect from "../../../components/SearchableSelect";
import Footer from "../../../components/footerV2";
import CheckBox from "../../../components/inscription/CheckBox";
import DateFilter from "../../preinscription/components/DatePickerList";
import { useSelector } from "react-redux";

export default function StepEligibilite() {
  // const [data, setData] = React.useContext(PreInscriptionContext);
  const [data, setData] = React.useState({});
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = React.useState({});
  const [toggleVerify, setToggleVerify] = React.useState(false);

  const history = useHistory();
  console.log("🚀 ~ file: stepEligibilite.js ~ line 22 ~ StepEligibilite ~ data", data);

  useEffect(() => {
    setData(young);
  }, [young]);

  const optionsScolarite = [
    { value: "NOT_SCOLARISE", label: "Non scolarisé(e)" },
    { value: "4eme", label: "4ème" },
    { value: "3eme", label: "3ème" },
    { value: "2nde", label: "2nde" },
    { value: "1ere", label: "1ère" },
    { value: "1ere CAP", label: "1ère CAP" },
    { value: "Terminale", label: "Terminale" },
    { value: "Terminale CAP", label: "Terminale CAP" },
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
      errors.birthDate = "Vous devez choisir une date de naissance";
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
        if (!data?.school) {
          errors.school = "Vous devez choisir votre école";
        }
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
    plausibleEvent("Phase0/CTA preinscription - eligibilite");
    history.push("/preinscription/sejour");
  };

  return (
    <>
      <div className="bg-white p-4">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Vérifiez votre éligibilité au SNU</h1>
          <Link to="/public-besoin-d-aide/">
            <QuestionMarkBlueCircle />
          </Link>
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col flex-start my-4">
          <div className="flex items-center">
            <CheckBox disabled={true} checked={data.frenchNationality === "true"} onChange={(e) => setData({ ...data, frenchNationality: e ? "true" : "false" })} />
            <div className="flex items-center">
              <span className="ml-2 mr-2">Je suis de nationalité française</span>
              <IconFrance />
            </div>
          </div>
          {error.frenchNationality ? <span className="text-red-500 text-sm">{error.frenchNationality}</span> : null}
        </div>
        <div className="form-group">
          <SearchableSelect
            label="Niveau de scolarité"
            value={data.scolarity}
            options={optionsScolarite}
            onChange={(value) => {
              setData({ ...data, scolarity: value, school: value === "NOT_SCOLARISE" ? null : data.school });
            }}
            placeholder="Sélectionnez une option"
          />
          {error.scolarity ? <span className="text-red-500 text-sm">{error.scolarity}</span> : null}
        </div>
        <div className="flex flex-col flex-start my-4">
          Date de naissance
          <DateFilter title="" value={data.birthDate} onChange={(e) => setData({ ...data, birthDate: e.target.value })} />
          {error.birthDate ? <span className="text-red-500 text-sm">{error.birthDate}</span> : null}
        </div>
        {data.scolarity && (
          <>
            <div className="flex justify-between items-center">
              <p>
                <div>
                  <span className="font-bold">{data.scolarity === "NOT_SCOLARISE" ? "Je réside" : "Mon établissement scolaire est"}</span> en France
                </div>
                <div className="h-5 flex items-center">
                  <span className="text-xs leading-5 text-[#666666]">Métropolitaine ou Outre-mer</span>
                </div>
              </p>

              <Toggle onClick={() => setData({ ...data, isAbroad: !data.isAbroad })} toggled={!data.isAbroad} />
              {error.isAbroad ? <span className="text-red-500 text-sm">{error.isAbroad}</span> : null}
            </div>

            {data.scolarity !== "NOT_SCOLARISE" ? (
              data.isAbroad ? (
                <>
                  {error.school ? <span className="text-red-500 text-sm">{error.school}</span> : null}
                  <SchoolOutOfFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                </>
              ) : (
                <>
                  {error.school ? <span className="text-red-500 text-sm">{error.school}</span> : null}
                  <SchoolInFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                </>
              )
            ) : !data.isAbroad ? (
              <div className="flex flex-col flex-start my-4">
                Code Postal
                <div className="h-5 flex items-center">
                  <span className="text-xs leading-5 text-[#666666]">Exemple : 75008</span>
                </div>
                <Input value={data.zip} onChange={(e) => setData({ ...data, zip: e })} />
                {error.zip ? <span className="text-red-500 text-sm">{error.zip}</span> : null}
              </div>
            ) : null}
          </>
        )}
      </div>
      <Footer marginBottom={"12vh"} />
      <StickyButton text="Continuer" onClick={() => onSubmit()} />
    </>
  );
}
