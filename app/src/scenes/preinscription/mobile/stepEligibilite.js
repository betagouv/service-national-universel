import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { useHistory } from "react-router-dom";
import Select from "../components/select";
import Toggle from "../components/toggle";
import Input from "../components/input";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import DateFilter from "../components/DatePickerList";
import { ReactiveBase, DataSearch } from "@appbaseio/reactivesearch";
import { apiURL } from "../../../config";
import api from "../../../services/api";
import { useEffect } from "react";
import { toastr } from "react-redux-toastr";
import Loader from "../../../components/Loader";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const [search, setSearch] = React.useState();
  const [isSearching, setIsSearching] = React.useState(false);
  const [schools, setSchools] = React.useState([]);
  const [schoolSelected, setSchoolSelected] = React.useState();
  const history = useHistory();
  const optionsScolarite = [
    { value: "NOT_SCOLARISE", label: "Non scolarisé" },
    { value: "THIRD", label: "3ème" },
    { value: "SECOND", label: "2nde" },
    { value: "TERM", label: "1ale" },
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

  return (
    <div className="bg-white p-4">
      <div className="w-full flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Vérifiez votre éligibilité au SNU</h1>
        <QuestionMarkBlueCircle />
      </div>
      <hr className="my-4 h-px bg-gray-200 border-0" />
      <div className="flex items-center my-4">
        <input
          type="checkbox"
          className={`w-4 h-4 cursor-pointer`}
          checked={data.frenchNationality === "true"}
          onChange={(e) => setData({ ...data, frenchNationality: e.target.checked ? "true" : "false" })}
        />
        <div className="ml-4">Je suis de nationalité française </div>
      </div>
      <div className="flex flex-col flex-start my-4">
        Niveau de scolarité
        <Select options={optionsScolarite} value={data.scolarity} placeholder="Sélectionner une option" onChange={(e) => setData({ ...data, scolarity: e })} />
      </div>
      <div className="flex flex-col flex-start my-4">
        Date de naissance
        <DateFilter title="" value={data.birthDate} onChange={(e) => setData({ ...data, birthDate: e.target.value })} />
      </div>
      {data.scolarity &&
        (data.scolarity !== "NOT_SCOLARISE" ? (
          <div>
            <input
              type="text"
              placeholder="Rechercher une ecole.."
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <div className="relative flex w-full items-center">
              {schools.length > 0 && (
                <div className="absolute top-0 left-0 z-50 max-h-80 w-full overflow-auto  bg-white drop-shadow-lg">
                  {search.length > 0 && isSearching && <Loader size={20} className="my-4" />}
                  {search.length > 0 && !isSearching && !schools.length && <span className="block py-2 px-8 text-sm text-black">Il n'y a pas de résultat 👀</span>}
                  {schools?.map((school) => (
                    <SchoolCard
                      key={school._id}
                      data={school}
                      onClick={() => {
                        setData({ ...data, school: { ...school } });
                        setSchoolSelected(school);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            {/* <div className="flex flex-col flex-start my-4">
              Niveau de scolarité
              <Select options={optionsScolarite} value={data.scolarity} placeholder="Sélectionner une option" onChange={(e) => setData({ ...data, scolarity: e })} />
            </div>
            <Input disabled /> */}
          </div>
        ) : (
          <div className="flex justify-between">
            <div className="flex">
              <div className="font-bold">Je réside</div> en France
            </div>

            <Toggle onClick={() => setData({ ...data, frenchResidency: !data.frenchResidency })} toggled={data.frenchResidency} />
          </div>
        ))}
    </div>
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
