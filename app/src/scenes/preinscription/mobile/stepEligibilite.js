import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import Select from "../../../components/inscription/select";
import Toggle from "../../../components/inscription/toggle";
import Input from "../../../components/inscription/input";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import DateFilter from "../components/DatePickerList";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { useEffect } from "react";
import { toastr } from "react-redux-toastr";
import Loader from "../../../components/Loader";
import StickyButton from "../../../components/inscription/stickyButton";
import { useRef } from "react";
// import validator from "validator";

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

  useEffect(() => {
    if (search) getSchools(search);
  }, [search]);

  const getSchools = async () => {
    if (search.length > 0 && !isSearching) setIsSearching(true);
    if (!search.length) {
      setIsSearching(false);
      setSearch("");
      setSchools([]);
      return;
    }
    try {
      setIsSearching(true);
      const { ok, data } = await api.post("/es/schoolramses", { query: { q: search } });
      setIsSearching(false);
      if (!ok) return toastr.error("Aucune école trouvée");
      setSchools(data);
    } catch (e) {
      console.log(e.message);
    }
  };

  const validate = () => {
    let errors = {};

    // Nationality
    if (!data?.frenchNationality) {
      errors.email = "Vous devez être français";
    }
    // Scolarity
    if (!data?.scolarity) {
      errors.scolarity = "Choisissez une date de naissance";
    }
    // Birthdate
    // ? Check age ?
    if (!data?.birthDate) {
      errors.birthDate = "Vous devez choisir une date de naissance";
    }

    // School
    if (!data?.school) {
      errors.school = "Vous devez choisir votre école. Contactez-nous (support URL) si vous ne la trouvez pas";
    }
    return errors;
  };

  const keyList = ["frenchNationality", "scolarity", "birthDate", "school"];

  const onSubmit = async () => {
    let errors = {};

    for (const key of keyList) {
      if (data[key] === undefined || data[key] === "") {
        errors[key] = "Ce champ est obligatoire";
      }
    }

    errors = { ...errors, ...validate() };

    setError(errors);
    if (!Object.keys(errors).length) {
      history.push("/preinscription/sejour");
    }
  };

  return (
    <>
      <div className="bg-white p-4">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Vérifiez votre éligibilité au SNU</h1>
          <QuestionMarkBlueCircle />
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col flex-start my-4">
          <div className="flex items-center my-4">
            <input
              type="checkbox"
              className={`w-4 h-4 cursor-pointer`}
              checked={data.frenchNationality === "true"}
              onChange={(e) => setData({ ...data, frenchNationality: e.target.checked ? "true" : "false" })}
            />
            <div className="ml-4">Je suis de nationalité française </div>
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
        {data.scolarity &&
          (data.scolarity !== "NOT_SCOLARISE" ? (
            <div>
              <input
                type="text"
                placeholder="Rechercher une ecole.."
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowItems(true);
                }}
                ref={inputSearch}
              />
              <div className="relative flex w-full items-center">
                {schools.length > 0 && showItems && (
                  <div className="absolute top-0 left-0 z-50 max-h-80 w-full overflow-auto  bg-white drop-shadow-lg">
                    {search.length > 0 && isSearching && <Loader size={20} className="my-4" />}
                    {search.length > 0 && !isSearching && !schools.length && <span className="block py-2 px-8 text-sm text-black">Il n'y a pas de résultat 👀</span>}
                    {schools?.map((school) => (
                      <SchoolCard
                        key={school._id}
                        data={school}
                        onClick={() => {
                          setData({ ...data, school: { ...school } });
                          setShowItems(false);
                          setSearch("");
                          inputSearch.current.value = "";
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              {data.school ? (
                <>
                  <div className="flex flex-col flex-start my-4">
                    Nom de l'établissement
                    <Input disabled value={data?.school?.fullName} />
                  </div>
                  <div className="flex flex-col flex-start my-4">
                    Commune de l'établissement
                    <Input disabled value={data?.school?.city} />
                  </div>
                  <div className="flex flex-col flex-start my-4">
                    Pays de l'établissement
                    <Input disabled value={data?.school?.country} />
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <p>
                <div>
                  <span className="font-bold">Je réside</span> en France
                </div>
                <div className="h-5 flex items-center">
                  <span className="text-xs leading-5 text-[#666666]">Métropolitaine ou Outre-mer</span>
                </div>
              </p>

              <Toggle onClick={() => setData({ ...data, frenchResidency: !data.frenchResidency })} toggled={data.frenchResidency} />
              {error.frenchResidency ? <span className="text-red-500 text-sm">{error.frenchResidency}</span> : null}

              {/* <div className="flex flex-col flex-start my-4">
              Code Postal input a mettre
            </div> */}
            </div>
          ))}
      </div>
      <StickyButton text="Continuer" onClick={() => onSubmit()} onClickPrevious={() => history.push("/preinscription")} />
    </>
  );
}

const SchoolCard = ({ _id, data, onClick }) => {
  return (
    <div key={_id} className={`my-1 w-full shrink-0 grow-0 cursor-pointer lg:my-4`} onClick={onClick}>
      <article className={`flex items-center overflow-hidden rounded-lg bg-white py-6 shadow-lg`}>
        <div className="flex flex-grow flex-col">
          <header className="flex items-center pl-4 pr-8 leading-tight">
            <span>{data.fullName}</span>
            <h3 className="my-0 pl-5 text-lg text-black">{data.city}</h3>
          </header>

          <footer className="mt-2.5 flex flex-col items-start justify-between px-8 leading-none">
            <p className="flex flex-wrap">
              {data.departmentName} - {data.region}
            </p>
          </footer>
        </div>
        <span className="justify-end">{data.adresse}</span>
      </article>
    </div>
  );
};
