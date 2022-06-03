import React, { useState } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import BusSvg from "../../assets/icons/Bus";
import Breadcrumbs from "../../components/Breadcrumbs";
import api from "../../services/api";
import { canCreateMeetingPoint } from "../../utils";

export default function CreateTransport() {
  const user = useSelector((state) => state.Auth.user);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // todo: degage si t'as pas le droit
  if (!canCreateMeetingPoint(user)) return null;

  const submit = async () => {
    setLoading(true);
    try {
      const response = await api.post("/bus", data);
      if (!response.ok) return toastr.error("Erreur", "Une erreur est survenue");
      setData({});
      history.push("/point-de-rassemblement/nouveau?bus_id=" + response?.data?._id.toString());
    } catch (error) {
      console.error(error);
      if (error.code !== "ALREADY_EXISTS") {
        toastr.error(`Le transport ${data.idExcel} existe déjà pour le séjour ${data.cohort}`);
      } else {
        toastr.error("Erreur", "Une erreur est survenue");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Points de rassemblement", to: `/point-de-rassemblement` },
          { label: "Création d'un nouveau point de rassemblement", to: `/point-de-rassemblement/nouveau` },
          { label: "Création d'un nouveau transport" },
        ]}
      />
      <div className="m-9">
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="flex flex-row items-center">
            <BusSvg className="h-10 w-10 text-gray-400" />
            <div className="font-bold text-2xl ml-4">Nouveau transport</div>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center">
          <div className="flex flex-col w-2/5 bg-white rounded-xl p-9 self-stretch">
            <div className="flex justify-between">
              <h4>
                <strong>formulaire de création</strong>
              </h4>
            </div>
            <div className="flex flex-col space-y-4">
              <Input value={data.idExcel} name="idExcel" onChange={setData} placeholder="Nº du transport" />
              <Input value={data.capacity} name="capacity" onChange={setData} placeholder="Capacité total" type="number" />
              <Select value={data.cohort} options={["Juin 2022", "Juillet 2022"]} name="cohort" onChange={setData} placeholder="Séjour concerné" />
            </div>
            <div className="mt-8">
              {loading ? (
                <button disabled className="font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:text-gray-100 disabled:cursor-wait">
                  Chargement...
                </button>
              ) : (
                <button
                  disabled={!data.idExcel || !data.capacity || !data.cohort}
                  className="bg-blue-500 hover:bg-blue-700 text-[#ffffff] font-bold py-2 px-4 rounded disabled:bg-gray-300 disabled:text-gray-100 disabled:cursor-not-allowed"
                  onClick={submit}>
                  Créer le transport
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const Input = ({ value, name, onChange, type = "text", placeholder: defaultPlaceholder }) => {
  const [showLabel, setShowLabel] = useState(false);
  const [placeholder, setPlaceHolder] = useState(defaultPlaceholder);

  return (
    <div className="flex flex-col justify-center border-[1px] border-gray-300 w-2/3 px-3 py-2 rounded-lg mt-3">
      {showLabel || value ? <div className="text-xs leading-4 font-normal text-gray-500">{defaultPlaceholder}</div> : null}
      <input
        onFocus={() => {
          setPlaceHolder("");
          setShowLabel(true);
        }}
        onBlur={() => {
          setPlaceHolder(defaultPlaceholder);
          setShowLabel(false);
        }}
        className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
        placeholder={placeholder}
        type={type}
        onChange={(e) => {
          e.persist();
          onChange((prev) => ({ ...prev, [name]: e.target.value }));
        }}
      />
    </div>
  );
};

const Select = ({ value, name, options, onChange, placeholder: defaultPlaceholder }) => {
  const [showLabel, setShowLabel] = useState(false);
  const [placeholder, setPlaceHolder] = useState(defaultPlaceholder);

  return (
    <div className="flex flex-col justify-center border-[1px] border-gray-300 w-2/3 px-3 py-2 rounded-lg mt-3">
      {showLabel || value ? <div className="text-xs leading-4 font-normal text-gray-500">{defaultPlaceholder}</div> : null}
      <select
        onFocus={() => {
          setPlaceHolder("");
          setShowLabel(true);
        }}
        onBlur={() => {
          setPlaceHolder(defaultPlaceholder);
          setShowLabel(false);
        }}
        className="w-full text-sm leading-5 font-normal ::placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          e.persist();
          onChange((prev) => ({ ...prev, [name]: e.target.value }));
        }}>
        <option disabled selected value={null} label={defaultPlaceholder}>
          {defaultPlaceholder}
        </option>
        {options.map((item) => (
          <option key={item} value={item} label={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
};
