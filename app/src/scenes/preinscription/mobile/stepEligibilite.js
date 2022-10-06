import React, { useEffect, useRef } from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { Link, useHistory } from "react-router-dom";
import Select from "../../../components/inscription/select";
import Toggle from "../../../components/inscription/toggle";
import Input from "../../../components/inscription/input";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import DateFilter from "../components/DatePickerList";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import Loader from "../../../components/Loader";
import StickyButton from "../../../components/inscription/stickyButton";
import IconFrance from "../../../assets/IconFrance";
import CheckBox from "../../../components/inscription/CheckBox";
import validator from "validator";
import plausibleEvent from "../../../services/plausible";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const [search, setSearch] = React.useState();
  const [isSearching, setIsSearching] = React.useState(false);
  const [showItems, setShowItems] = React.useState(false);
  const [schools, setSchools] = React.useState([]);
  const [error, setError] = React.useState({});

  const inputSearch = useRef(null);

  const history = useHistory();

  const optionsScolarite = [
    { value: "NOT_SCOLARISE", label: "Non scolarisé(e)" },
    { value: "FOURTH", label: "4ème" },
    { value: "THIRD", label: "3ème" },
    { value: "SECOND", label: "2nde" },
    { value: "FIRST", label: "1ère" },
    { value: "FIRST_CAP", label: "1ère CAP" },
    { value: "TERM", label: "Terminale" },
    { value: "TERM_CAP", label: "Terminale CAP" },
  ];

  console.log("🚀 ~ file: stepEligibilite.js ~ line 18 ~ StepEligibilite ~ data", data);

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
        if (!(data?.zip && validator.isPostalCode(data?.zip, "FR"))) {
          errors.zip = "Vous devez sélectionner un code postal";
        }
      } else {
        // School
        if (!data?.school) {
          errors.school = "Vous devez choisir votre école. Contactez-nous (support URL) si vous ne la trouvez pas";
        }
      }
    }

    setError(errors);

    // ! Gestion erreur a reprendre
    if (Object.keys(errors).length) {
      toastr.error("Veuillez remplir tous les champs :" + Object.keys(errors)[0] + Object.values(errors)[0]);
      return;
    }
    plausibleEvent("");
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
            <CheckBox checked={data.frenchNationality === "true"} onChange={(e) => setData({ ...data, frenchNationality: e ? "true" : "false" })} />
            <div className="flex items-center">
              <span className="ml-2 mr-2">Je suis de nationalité française</span>
              <IconFrance />
            </div>
          </div>
          {error.frenchNationality ? <span className="text-red-500 text-sm">{error.frenchNationality}</span> : null}
        </div>
        <div className="flex flex-col flex-start my-4">
          Niveau de scolarité
          <Select options={optionsScolarite} value={data.scolarity} placeholder="Sélectionner une option" onChange={(e) => setData({ ...data, scolarity: e })} />
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
                <SchoolOutOfFrance onSelectSchool={(school) => setData({ ...data, school: { ...school } })} />
              ) : (
                <SchoolInFrance onSelectSchool={(school) => setData({ ...data, school: { ...school } })} />
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
      <StickyButton text="Continuer" onClick={() => onSubmit()} />
    </>
  );
}

const SchoolCard = ({ _id, data, onClick }) => {
  return (
    <div key={_id} className={`my-1 w-full shrink-0 grow-0 cursor-pointer lg:my-4`} onClick={onClick}>
      <article className={`flex items-center overflow-hidden rounded-lg bg-white py-6 shadow-lg`}>
        <span>{data.fullName}</span>
        <span className="justify-end">{data.adresse}</span>
      </article>
    </div>
  );
};
