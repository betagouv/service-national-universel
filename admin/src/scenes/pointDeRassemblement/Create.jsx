import React from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
// import { useSelector } from "react-redux";
import Breadcrumbs from "../../components/Breadcrumbs";
import { capture } from "../../sentry";
import api from "../../services/api";
import VerifyAddress from "../phase0/components/VerifyAddress";
import { Title } from "./components/common";
import Field from "./components/Field";

export default function Create() {
  //   const user = useSelector((state) => state.Auth.user);
  const urlParams = new URLSearchParams(window.location.search);
  const history = useHistory();
  const cohort = urlParams.get("cohort");
  const [errors, setErrors] = React.useState({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [data, setData] = React.useState({
    name: "",
    address: "",
    complementAddress: "",
    city: "",
    zip: "",
    department: "",
    region: "",
    location: {},
    addressVerified: false,
  });

  const onVerifyAddress = (isConfirmed) => (suggestion) => {
    setData({
      ...data,
      addressVerified: true,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      address: isConfirmed ? suggestion.address : data.address,
      zip: isConfirmed ? suggestion.zip : data.zip,
      city: isConfirmed ? suggestion.city : data.city,
    });
  };

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      const error = {};
      if (!data?.name) {
        error.name = "Le nom est obligatoire";
      }
      if (!data?.address) {
        error.address = "L'adresse est obligatoire";
      }
      if (!data?.city) {
        error.city = "La ville est obligatoire";
      }
      if (!data?.zip) {
        error.zip = "Le code postal est obligatoire";
      }
      if (!data?.addressVerified) {
        error.addressVerified = "L'adresse n'a pas été vérifiée";
      }
      setErrors(error);
      if (Object.keys(error).length > 0) return setIsLoading(false);
      delete data.addressVerified;
      data.cohort = cohort;
      const { ok, code, data: PDR } = await api.post("/point-de-rassemblement", data);

      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la création du point de rassemblement", code);
        return setIsLoading(false);
      }
      if (PDR._id) history.push(`/point-de-rassemblement/${PDR._id}`);
      else history.push(`/point-de-rassemblement`);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la création du point de rassemblement");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Point de rassemblement", to: "/point-de-rassemblement" }, { label: "Créer un point de rassemblement" }]} />
      <div className="m-8 flex flex-col rounded-lg bg-white p-8">
        <Title className="text-center">Créer un point de rassemblement</Title>
        <hr className="my-8" />
        <div className="flex">
          <div className="flex w-[45%] flex-col gap-4 ">
            <div className="text-lg font-medium leading-6 text-gray-900">Informations générales</div>
            <div className="flex flex-col gap-2">
              <div className="text-xs font-medium leading-4 text-gray-900">Nom du point de rassemblement</div>
              <Field label={"Nom du point de rassemblement"} onChange={(e) => setData({ ...data, name: e.target.value })} value={data.name} error={errors?.name} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="text-xs font-medium leading-4 text-gray-900">Adresse</div>
              <Field label={"Adresse"} onChange={(e) => setData({ ...data, address: e.target.value, addressVerified: false })} value={data.address} error={errors?.address} />
              <div className="flex items-center gap-3">
                <Field label="Code postal" onChange={(e) => setData({ ...data, zip: e.target.value, addressVerified: false })} value={data.zip} error={errors?.zip} />
                <Field label="Ville" onChange={(e) => setData({ ...data, city: e.target.value, addressVerified: false })} value={data.city} error={errors?.city} />
              </div>
              {data.addressVerified && (
                <div className="flex items-center gap-3">
                  <Field label="Département" onChange={(e) => setData({ ...data, department: e.target.value })} value={data.department} disabled={true} />
                  <Field label="Région" onChange={(e) => setData({ ...data, region: e.target.value })} value={data.region} disabled={true} />
                </div>
              )}
              <div className="flex flex-col gap-2">
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
            </div>
          </div>
          <div className="flex w-[10%] items-center justify-center">
            <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
          </div>
          <div className="flex w-[45%] flex-col  justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="text-lg font-medium leading-6 text-gray-900">Détails du séjour</div>
                <div className="cursor-pointer rounded-full border-[1px] border-[#66A7F4] bg-[#F9FCFF] px-3 py-1 text-xs font-medium leading-5 text-[#0C7CFF]">{cohort}</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-xs font-medium leading-4 text-gray-900">Complément d’adresse (optionnel)</div>
                <Field label="Complément d’adresse" onChange={(e) => setData({ ...data, complementAddress: e.target.value })} value={data.complementAddress} />
              </div>
            </div>
            <button
              onClick={onSubmit}
              className={`rounded-lg border-[1px] border-blue-600 bg-blue-600 py-2 text-white hover:shadow-ninaButton disabled:cursor-not-allowed disabled:opacity-50`}
              disabled={isLoading}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
