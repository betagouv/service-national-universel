import React, { useEffect, useState, useRef } from "react";
import YoungHeader from "../../phase0/components/YoungHeader";
import { useHistory } from "react-router-dom";
import api from "../../../services/api";
import { ES_NO_LIMIT, MISSION_DOMAINS, translate } from "../../../utils";
import { adminURL } from "../../../config";
import Field from "../../missions/components/Field";
import AsyncSelect from "react-select/async";
import ReactSelect from "react-select";

export default function CustomMission({ young, onChange }) {
  const history = useHistory();
  const [values, setValues] = useState({
    structureId: "",
    structureName: "",
    tutorId: "",
    mainDomain: "",
    domains: [],
    format: "",
    duration: "",
    description: "",
    actions: "",
    contraintes: "",
  });
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [referents, setReferents] = useState([]);
  const [errors, setErrors] = useState({});
  const referentSelectRef = useRef();

  async function initReferents() {
    const body = { query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": values.structureId } }] } }, size: ES_NO_LIMIT };
    const { responses } = await api.esQuery("referent", body);
    if (responses?.length) {
      const responseReferents = responses[0].hits.hits.map((hit) => ({ label: hit._source.firstName + " " + hit._source.lastName, value: hit._id, tutor: hit._source }));
      if (!responseReferents.find((ref) => ref.value === values.tutorId)) {
        if (referentSelectRef.current?.select?.select) referentSelectRef.current.select.select.setValue("");
        setValues({ ...values, tutorId: "" });
      }
      setReferents(responseReferents);
    }
  }
  const mainDomainsOption = Object.keys(MISSION_DOMAINS).map((d) => {
    return { value: d, label: translate(d) };
  });
  useEffect(() => {
    initReferents();
  }, [values.structureId]);
  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />
      <div className="mx-8 my-7 py-6 px-8 bg-white">
        <div className="flex items-center  ">
          <div className="rounded-full p-2 bg-gray-200 cursor-pointer hover:scale-105" onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M5.83333 13.3334L2.5 10.0001M2.5 10.0001L5.83333 6.66675M2.5 10.0001L17.5 10.0001"
                stroke="#374151"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-1 justify-center text-3xl leading-8 font-bold tracking-tight">
            Créer une mission personnalisée à {young.firstName} {young.lastName}
          </div>
        </div>
        <div className="border-b-[1px] border-[#F3F4F6] my-7" />
        <div className="font-bold text-lg">Créer une mission personnalisée</div>

        <div className="flex flex-col lg:flex-row">
          <div>
            <div className="text-lg font-medium text-gray-900">Détails de la mission</div>
            <div>
              <div className="text-xs font-medium mb-2">
                Donnez un nom à votre mission. Privilégiez une phrase précisant l&apos;action du volontaire. <br />
                Exemple : « Je fais les courses de produits pour mes voisins les plus fragiles »
              </div>
              <Field name="name" errors={errors} handleChange={(e) => setValues({ ...values, name: e.target.value })} label="Nom de la mission" value={values.name} />
            </div>
            <div className="mt-4">
              <div className="text-xs font-medium mb-2">Structure rattachée</div>
              <AsyncSelect
                label="Structure"
                value={{ label: values.structureName }}
                loadOptions={fetchStructures}
                noOptionsMessage={() => {
                  return (
                    <a className="flex items-center gap-2 flex-col cursor-pointer no-underline" href={`${adminURL}/structure/create`} target="_blank" rel="noreferrer">
                      <div className="text-sm text-gray-400">La structure recherchée n&apos;est pas dans la liste ?</div>
                      <div className="font-medium text-blue-600 text-">Créer une nouvelle structure</div>
                    </a>
                  );
                }}
                defaultOptions
                onChange={(e) => {
                  setValues({ ...values, structureName: e.label, structureId: e._id });
                  setSelectedStructure(e.structure);
                }}
                placeholder="Rechercher une structure"
                error={errors.structureName}
              />
              {values.structureName && (
                <a
                  target="_blank"
                  rel="noreferrer"
                  href={`${adminURL}/structure/${values.structureId}/edit`}
                  className="inline-block w-full border-[1px] py-2 cursor-pointer text-blue-600 rounded border-blue-600 text-center mt-4">
                  Voir la structure
                </a>
              )}
            </div>
            <div className="mt-4">
              <div className="text-xs font-medium mb-2">Domaine d&apos;action principal</div>
              <CustomSelect
                noOptionsMessage={"Aucun domaine ne correspond à cette recherche"}
                options={mainDomainsOption}
                placeholder={"Sélectionnez un domaine principal"}
                onChange={(e) => {
                  setValues({ ...values, mainDomain: e.value, domains: values.domains.filter((d) => d !== e.value) });
                }}
                value={values.mainDomain}
              />
              <div className="flex flex-row text-xs font-medium my-2">
                <div>Domaine(s) d&apos;action secondaire(s)</div>
                <div className="text-gray-400">&nbsp;(facultatif)</div>
              </div>
              <CustomSelect
                isMulti
                options={mainDomainsOption.filter((d) => d.value !== values.mainDomain)}
                noOptionsMessage={"Aucun domaine ne correspond à cette recherche"}
                placeholder={"Sélectionnez un ou plusieurs domaines"}
                onChange={(e) => {
                  setValues({ ...values, domains: e });
                }}
                value={[...values.domains]}
              />
            </div>
            <div>
              <div className="text-xs font-medium mb-2">Type de mission</div>
              <CustomSelect
                errors={errors}
                options={[
                  { value: "CONTINUOUS", label: translate("CONTINUOUS") },
                  { value: "DISCONTINUOUS", label: translate("DISCONTINUOUS") },
                ]}
                placeholder={"Mission regroupée sur des journées"}
                onChange={(e) => setValues({ ...values, format: e.value })}
                value={values.format}
              />
            </div>
            <div>
              <div className="flex flex-row text-xs font-medium mt-2">
                <div>Durée de la mission</div>
                <div className="text-gray-400">&nbsp;(facultatif)</div>
              </div>
              <div className="text-xs font-medium mb-2">Saisissez un nombre d&apos;heures prévisionnelles pour la réalisation de la mission</div>
              <Field errors={errors} name="duration" handleChange={(e) => setValues({ ...values, duration: e.target.value })} label="Heure(s)" value={translate(values.duration)} />
            </div>
            <div>
              <div className="flex flex-row text-xs font-medium my-2">Objectifs de la mission</div>
              <Field
                errors={errors}
                name="description"
                type="textarea"
                row={4}
                handleChange={(e) => setValues({ ...values, description: e.target.value })}
                label="Décrivez votre mission"
                value={translate(values.description)}
              />
            </div>
            <div>
              <div className="flex flex-row text-xs font-medium my-2">Actions concrètes confiées au(x) volontaire(s)</div>
              <Field
                errors={errors}
                type="textarea"
                name="actions"
                row={4}
                handleChange={(e) => setValues({ ...values, actions: e.target.value })}
                label="Listez les actions confiées au(x) volontaires"
                value={translate(values.actions)}
              />
            </div>
            <div>
              <div className="flex flex-col text-xs font-medium my-2">
                <div>
                  Contraintes spécifiques pour cette mission
                  <span className="text-gray-400">&nbsp;(facultatif).&nbsp;</span>
                </div>
                <div>(conditions physiques, période de formation, mission en soirée...)</div>
              </div>
              <Field
                type="textarea"
                row={4}
                handleChange={(e) => setValues({ ...values, contraintes: e.target.value })}
                label="Précisez les informations complémentaires à préciser au volontaire."
                value={translate(values.contraintes)}
              />
            </div>
          </div>
          <div>
            <div className="text-lg font-medium text-gray-900">Dates et places disponibles</div>
          </div>
        </div>
      </div>
    </>
  );
}

const fetchStructures = async (inputValue) => {
  const body = {
    query: { bool: { must: [] } },
    size: 50,
    track_total_hits: true,
  };
  if (inputValue) {
    body.query.bool.must.push({
      bool: {
        should: [
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "cross_fields",
              operator: "and",
            },
          },
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "phrase",
              operator: "and",
            },
          },
          {
            multi_match: {
              query: inputValue,
              fields: ["name", "address", "city", "zip", "department", "region", "code2022", "centerDesignation"],
              type: "phrase_prefix",
              operator: "and",
            },
          },
        ],
        minimum_should_match: "1",
      },
    });
  }
  const { responses } = await api.esQuery("structure", body);
  return responses[0].hits.hits.map((hit) => {
    return { value: hit._source, _id: hit._id, label: hit._source.name, structure: hit._source };
  });
};
const CustomSelect = ({ ref = null, onChange, options, value, isMulti = false, placeholder, noOptionsMessage = "Aucune option", error }) => {
  return (
    <ReactSelect
      ref={ref}
      noOptionsMessage={() => noOptionsMessage}
      styles={{
        dropdownIndicator: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
        placeholder: (styles) => ({ ...styles, color: error ? "red" : "black" }),
        singleValue: (styles) => ({ ...styles, color: "black" }),
        multiValueRemove: (styles, { isDisabled }) => ({ ...styles, display: isDisabled ? "none" : "flex" }),
        indicatorsContainer: (provided, { isDisabled }) => ({ ...provided, display: isDisabled ? "none" : "flex" }),
      }}
      options={options}
      placeholder={placeholder}
      onChange={(val) => (isMulti ? onChange(val.map((c) => c.value)) : onChange(val))}
      value={isMulti ? options.filter((c) => value.includes(c.value)) : options.find((c) => c.value === value)}
      isMulti={isMulti}
    />
  );
};
