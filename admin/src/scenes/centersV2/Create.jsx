import React from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { departmentToAcademy, ROLES } from "snu-lib";
// import { useSelector } from "react-redux";
import Breadcrumbs from "../../components/Breadcrumbs";
import { capture } from "../../sentry";
import api from "../../services/api";
import VerifyAddress from "../phase0/components/VerifyAddress";
import Field from "./components/Field";
import Toggle from "./components/Toggle";
import { BiHandicap } from "react-icons/bi";
import { useSelector } from "react-redux";
import Select from "./components/Select";

const optionsTypology = [
  { label: "Public / État", value: "PUBLIC_ETAT" },
  { label: "Public / Collectivité territoriale", value: "PUBLIC_COLLECTIVITE" },
  { label: "Privé / Association ou fondation", value: "PRIVE_ASSOCIATION" },
  { label: "Privé / Autre", value: "PRIVE_AUTRE" },
];

const optionsDomain = [
  { label: "Etablissement d’enseignement", value: "ETABLISSEMENT" },
  { label: "Centre de vacances", value: "VACANCES" },
  { label: "Centre de formation", value: "FORMATION" },
  { label: "Autres", value: "AUTRE" },
];

export default function Create() {
  const urlParams = new URLSearchParams(window.location.search);
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  const cohort = urlParams.get("cohort");
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState({
    name: "",
    code2022: "",
    address: "",
    city: "",
    zip: "",
    department: "",
    region: "",
    addressVerified: false,
    placesTotal: "",
    pmr: false,
    academy: "",
    typology: optionsTypology[0].value,
    domain: optionsDomain[0].value,
    complement: "",
    centerDesignation: "",
    placesSession: "",
    cohort,
    statusSession: "WAITING_VALIDATION",
  });

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setData({
      ...data,
      addressVerified: true,
      region: suggestion.region,
      department: suggestion.department,
      academy: departmentToAcademy[suggestion.department],
      address: isConfirmed ? suggestion.address : data.address,
      zip: isConfirmed ? suggestion.zip : data.zip,
      city: isConfirmed ? suggestion.city : data.city,
    });
  };

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const error = {};
      //check errors
      if (!data?.name) error.name = "Le nom est obligatoire";
      if (!data?.address) error.address = "L'adresse est obligatoire";
      if (!data?.city) error.city = "La ville est obligatoire";
      if (!data?.zip) error.zip = "Le code postal est obligatoire";
      if (!data?.department) error.department = "Le département est obligatoire";
      if (!data?.region) error.region = "La région est obligatoire";
      if (!data?.addressVerified) error.addressVerified = "L'adresse doit être vérifiée";
      if (!data?.placesTotal) error.placesTotal = "Le nombre de places est obligatoire";
      if (!data?.academy) error.academy = "L'académie est obligatoire";
      if (!data?.typology) error.typology = "La typologie est obligatoire";
      if (!data?.domain) error.domain = "Le domaine est obligatoire";
      if (!data?.placesSession) error.placesSession = "Le nombre de places pour la session est obligatoire";

      if (!data?.code2022 && user.role === ROLES.ADMIN) error.code2022 = "Le code est obligatoire";
      if (!data?.centerDesignation && user.role === ROLES.ADMIN) error.centerDesignation = "La désignation est obligatoire";

      if (isNaN(data?.placesTotal)) error.placesTotal = "Le nombre de places doit être un nombre";
      if (isNaN(data?.placesSession)) error.placesSession = "Le nombre de places pour la session doit être un nombre";

      if (!isNaN(data?.placesTotal) && !isNaN(data?.placesSession) && data.placesTotal < data.placesSession)
        error.placesSession = "Le nombre de places pour la session ne peut pas être supérieur à la capacité maximale du centre";

      setErrors(error);
      if (Object.keys(error).length > 0) return setIsLoading(false);

      const { ok, code, data: center } = await api.post("/cohesion-center", data);
      if (!ok) {
        if (code === "ALREADY_EXISTS") {
          toastr.error("Oups, le code du centre est déjà utilisé");
        } else {
          toastr.error("Oups, une erreur est survenue lors de la création du centre", code);
        }
        return setIsLoading(false);
      }
      if (center._id) history.push(`/centre/${center._id}`);
      else history.push(`/centre`);
    } catch (e) {
      capture(e);
      if (e.code === "ALREADY_EXISTS") {
        toastr.error("Oups, le code du centre est déjà utilisé");
      } else {
        toastr.error("Oups, une erreur est survenue lors de la création du centre");
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Centres", to: "/centre" }, { label: "Création de centre" }]} />
      <div className="m-8 flex flex-col rounded-lg bg-white p-8">
        <div className="flex items-center justify-center gap-2 text-center text-2xl font-bold leading-8 tracking-tight">
          <div className="text-gray-400">Créer une session</div>
          <div className="text-gray-400">-</div>
          <div className="text-gray-900">Créer un centre</div>
        </div>
        <hr className="my-8" />
        <div className="flex">
          <div className="flex w-[45%] flex-col gap-4 ">
            <div className="text-lg font-medium leading-6 text-gray-900">Informations générales</div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium leading-4 text-gray-900">Nom du centre</div>
              <Field label="Nom du centre" onChange={(e) => setData({ ...data, name: e.target.value })} value={data.name} error={errors?.name} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center rounded-full bg-gray-100 p-2 ">
                  <BiHandicap className="h-5 w-5 text-gray-500" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="text-sm font-bold leading-5 text-gray-700">Accessibilité PMR</div>
                  <div className="text-sm leading-5 text-gray-700">{data.pmr ? "Oui" : "Non"}</div>
                </div>
              </div>
              <Toggle value={data.pmr} onChange={(e) => setData({ ...data, pmr: e })} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>
              <Field label="Adresse" onChange={(e) => setData({ ...data, address: e.target.value, addressVerified: false })} value={data.address} error={errors?.address} />
              <div className="flex items-center gap-3">
                <Field label="Code postal" onChange={(e) => setData({ ...data, zip: e.target.value, addressVerified: false })} value={data.zip} error={errors?.zip} />
                <Field label="Ville" onChange={(e) => setData({ ...data, city: e.target.value, addressVerified: false })} value={data.city} error={errors?.city} />
              </div>
              {data.addressVerified && (
                <>
                  <div className="flex items-center gap-3">
                    <Field label="Département" onChange={(e) => setData({ ...data, department: e.target.value })} value={data.department} disabled={true} />
                    <Field label="Région" onChange={(e) => setData({ ...data, region: e.target.value })} value={data.region} disabled={true} />
                  </div>
                  <Field label="Académie" onChange={(e) => setData({ ...data, academy: e.target.value })} value={"Académie de " + data.academy} disabled={true} />
                </>
              )}
              <div className="flex flex-col gap-2 ">
                <VerifyAddress
                  address={data.address}
                  zip={data.zip}
                  city={data.city}
                  onSuccess={onVerifyAddress(true)}
                  onFail={onVerifyAddress()}
                  isVerified={data.addressVerified === true}
                  buttonClassName="border-[#1D4ED8] text-[#1D4ED8]"
                  verifyText="Pour vérifier  l'adresse vous devez remplir les champs adresse, code postal et ville."
                />
                {errors?.addressVerified && <div className="text-[#EF4444]">{errors.addressVerified}</div>}
              </div>
              {user.role === ROLES.ADMIN && (
                <>
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-medium leading-4 text-gray-900">Places ouvertes sur le séjour</div>
                      <div className="cursor-pointer rounded-full border-[1px] border-[#66A7F4] bg-[#F9FCFF] px-3 py-1 text-xs font-medium leading-5 text-[#0C7CFF]">{cohort}</div>
                    </div>
                    <Field
                      label="Places ouvertes sur le séjour"
                      onChange={(e) => setData({ ...data, placesSession: e.target.value })}
                      value={data.placesSession}
                      error={errors?.placesSession}
                      tooltips={
                        "C’est le nombre de places proposées sur un séjour. Cette donnée doit être inférieure ou égale à la capacité maximale d’accueil, elle ne peut lui être supérieure."
                      }
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex w-[10%] items-center justify-center">
            <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex w-[45%] flex-col  justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Typologie</div>
                <Select
                  label="Typologie"
                  options={optionsTypology}
                  selected={optionsTypology.find((e) => e.value === data.typology)}
                  setSelected={(e) => setData({ ...data, typology: e.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Domaine</div>
                <Select
                  label="Domaine"
                  options={optionsDomain}
                  selected={optionsDomain.find((e) => e.value === data.domain)}
                  setSelected={(e) => setData({ ...data, domain: e.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Complément</div>
                <Field
                  label="Précisez le gestionnaire ou propriétaire"
                  onChange={(e) => setData({ ...data, complement: e.target.value })}
                  value={data.complement}
                  error={errors?.complement}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Capacité maximale d&apos;accueil</div>
                <Field
                  label="Capacité maximale d'accueil"
                  onChange={(e) => setData({ ...data, placesTotal: e.target.value })}
                  value={data.placesTotal}
                  error={errors?.placesTotal}
                  tooltips={
                    "C’est la capacité d’hébergement maximale du centre, qui dépend du bâti. Elle doit être supérieure ou égale au nombre de places ouvertes sur un séjour donné."
                  }
                />
              </div>
              {user.role !== ROLES.ADMIN && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-medium leading-4 text-gray-900">Places ouvertes sur le séjour</div>
                    <div className="cursor-pointer rounded-full border-[1px] border-[#66A7F4] bg-[#F9FCFF] px-3 py-1 text-xs font-medium leading-5 text-[#0C7CFF]">{cohort}</div>
                  </div>
                  <Field
                    label="Places ouvertes sur le séjour"
                    onChange={(e) => setData({ ...data, placesSession: e.target.value })}
                    value={data.placesSession}
                    error={errors?.placesSession}
                    tooltips={
                      "C’est le nombre de places proposées sur un séjour. Cette donnée doit être inférieure ou égale à la capacité maximale d’accueil, elle ne peut lui être supérieure."
                    }
                  />
                </div>
              )}
              {user.role === ROLES.ADMIN && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-medium leading-4 text-gray-900">Désignation du centre</div>
                  <Field
                    label="Désignation du centre"
                    onChange={(e) => setData({ ...data, centerDesignation: e.target.value })}
                    value={data.centerDesignation}
                    error={errors?.centerDesignation}
                  />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Code du centre</div>
                <Field label="Code du centre" onChange={(e) => setData({ ...data, code2022: e.target.value })} value={data.code2022} error={errors?.code2022} />
              </div>
            </div>
            <button
              onClick={onSubmit}
              className={`mt-4 rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-white hover:shadow-ninaButton disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={isLoading}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
