import React, { useEffect, useState, useRef } from "react";
import YoungHeader from "../../phase0/components/YoungHeader";
import { useHistory } from "react-router-dom";
import api from "../../../services/api";
import { ES_NO_LIMIT } from "../../../utils";

export default function CustomMission({ young, onChange }) {
  const history = useHistory();
  const [values, setValues] = useState({ structureId: "", tutorId: "" });
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
                Donnez un nom à votre mission. Privilégiez une phrase précisant l&apos;action du volontaire. Ex : « Je fais les courses de produits pour mes voisins les plus
                fragiles »
              </div>
              <Field name="name" errors={errors} handleChange={(e) => setValues({ ...values, name: e.target.value })} label="Nom de la mission" value={values.name} />
            </div>
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
