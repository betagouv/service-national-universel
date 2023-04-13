import React, { useEffect, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { ES_NO_LIMIT, translate, YOUNG_SITUATIONS, YOUNG_STATUS } from "snu-lib";
import api from "../../../../services/api";
import { FilterComponent } from "../FilterDashBoard";
import { BarChart, FullDoughnut, graphColors, Legend, Legends } from "../graphs";

export default function Details({ selectedFilters }) {
  const [age, setAge] = useState({});
  const [sexe, setSexe] = useState({});
  const [grade, setGrade] = useState({});
  const [situation, setSituation] = useState({});
  const [qpv, setQpv] = useState({});
  const [rural, setRural] = useState({});
  const [specificSituation, setSpecificSituation] = useState({});
  const [selectedDetail, setSelectedDetail] = useState("age");

  const [selectedFiltersBottom, setSelectedFiltersBottom] = React.useState({});
  const filterArrayBottom = [
    {
      id: "status",
      name: "Statuts",
      fullValue: "Tous",
      options: Object.keys(YOUNG_STATUS).map((status) => ({ key: status, label: translate(status) })),
    },
  ];

  async function fetchDetailInscriptions() {
    const res = await getDetailInscriptions({ ...selectedFilters, ...selectedFiltersBottom });
    // get all the years from the res object
    const objectYears = {};
    Object.keys(res?.age || {}).forEach((e) => {
      const year = new Date(parseInt(e)).getFullYear();
      if (!objectYears[year]) objectYears[year] = 1;
      else objectYears[year] += 1;
    });
    setAge(objectYears);
    setSexe(res?.gender || {});
    setGrade(res?.grade || {});
    setSituation(res?.situation || {});
    setQpv(res?.qpv || {});
    setRural(res?.rural || {});
    setSpecificSituation({
      handicap: res?.handicap || {},
      allergies: res?.allergies || {},
      handicapInSameDepartment: res?.handicapInSameDepartment || {},
      reducedMobilityAccess: res?.reducedMobilityAccess || {},
      ppsBeneficiary: res?.ppsBeneficiary || {},
      paiBeneficiary: res?.paiBeneficiary || {},
      specificAmenagment: res?.specificAmenagment || {},
    });
  }

  useEffect(() => {
    fetchDetailInscriptions();
  }, [selectedFiltersBottom, selectedFilters]);

  return (
    <div className="w-[40%] bg-white rounded-lg py-6 px-8 flex items-center flex-col shadow-[0_8px_16px_-3px_rgba(0,0,0,0.05)]">
      <div className="flex flex-row justify-between w-full">
        <div className="text-base font-bold text-gray-900">En détail</div>
        <div className="flex flex-col items-end">
          {filterArrayBottom.map((filter) => (
            <FilterComponent key={filter.id} filter={filter} selectedFilters={selectedFiltersBottom} setSelectedFilters={setSelectedFiltersBottom} maxItems={2} />
          ))}
        </div>
      </div>
      {/* Filter to chose displayed graphs */}
      <div className="pb-10 pt-8">
        <FilterDetail selectedDetail={selectedDetail} setSelectedDetail={setSelectedDetail} />
      </div>

      {/* Displayed graphs */}
      {selectedDetail === "age" ? (
        <div className="flex flex-col justify-center items-center w-full gap-10">
          <FullDoughnut
            title="Âge"
            legendSide="right"
            labels={["Né en 2005", "Né en 2006", "Né en 2007", "Né en 2008"]}
            values={[age["2005"] || 0, age["2006"] || 0, age["2007"] || 0, age["2008"] || 0]}
            maxLegends={2}
          />
          <FullDoughnut title="Sexe" legendSide="left" labels={["Garçons", "Filles"]} values={[sexe.male || 0, sexe.female || 0]} maxLegends={2} />
        </div>
      ) : selectedDetail === "class" ? (
        <div className="flex flex-col justify-center items-center w-full gap-10">
          <FullDoughnut
            title="Classe"
            legendSide="right"
            labels={["2nde GT", "1ère GT", "2nde Pro", "1ère Pro", "3ème", "Autre", "CAP"]}
            values={[grade["2ndeGT"] || 0, grade["1ereGT"] || 0, grade["2ndePro"] || 0, grade["1erePro"] || 0, grade["3eme"] || 0, grade["Autre"] || 0, grade["CAP"] || 0]}
            maxLegends={3}
          />
          <FullDoughnut
            title="Situation"
            legendSide="left"
            labels={["En voie générale ou technologique", "En voie professionnelle (hors apprentissage)", "En enseignement adapté"]}
            values={[situation[YOUNG_SITUATIONS.GENERAL_SCHOOL] || 0, situation[YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL] || 0, situation[YOUNG_SITUATIONS.SPECIALIZED_SCHOOL] || 0]}
            maxLegends={3}
          />
        </div>
      ) : selectedDetail === "situation" ? (
        <div className="flex flex-col justify-center items-center w-full gap-10">
          <BarChart
            values={[
              specificSituation?.handicap?.true || 0,
              specificSituation?.ppsBeneficiary?.true || 0,
              specificSituation?.paiBeneficiary?.true || 0,
              specificSituation?.allergies?.true || 0,
            ]}
            noValue
            className="h-[200px] mt-8"
          />
          <Legends
            className="flew-wrap"
            values={[
              specificSituation.handicap.true || 0,
              specificSituation.ppsBeneficiary.true || 0,
              specificSituation.paiBeneficiary.true || 0,
              specificSituation.allergies.true || 0,
            ]}
            labels={["En situation de handicap", "Bénéficiaire d’un PPS", "Bénéficiaire d’un PAI", "Allergie / intolérance"]}
          />

          <div className="h-[1px] w-3/5 border-b-[1px] border-gray-300" />

          <div className="flex flex-row justify-between w-full">
            <Legend className="!flex-col text-center" name="Aménagement spécifique" value={specificSituation.specificAmenagment.true || 0} color={graphColors[1][0]} />
            <Legend
              className="!flex-col text-center"
              name="Affectation dans le département de résidence"
              value={specificSituation.handicapInSameDepartment.true || 0}
              color={graphColors[1][0]}
            />
            <Legend
              className="!flex-col text-center"
              name="Aménagement pour mobilité réduite"
              value={specificSituation.reducedMobilityAccess.true || 0}
              color={graphColors[1][0]}
            />
          </div>
        </div>
      ) : selectedDetail === "qpv" ? (
        <div className="flex flex-col justify-center items-center w-full gap-10">
          <FullDoughnut title="Quartier prioritaires" legendSide="right" labels={["Oui", "Non"]} values={[qpv.true || 0, qpv[""] || 0 + qpv.false || 0]} maxLegends={3} />
          <FullDoughnut title="Zone rurale" legendSide="left" labels={["Oui", "Non"]} values={[rural.true || 0, rural.false || 0]} maxLegends={3} />
        </div>
      ) : null}
    </div>
  );
}

async function getDetailInscriptions(filters) {
  const body = {
    query: { bool: { must: { match_all: {} }, filter: [] } },
    aggs: {
      age: {
        terms: {
          field: "birthdateAt",
          size: ES_NO_LIMIT,
        },
      },
      gender: {
        terms: {
          field: "gender.keyword",
          size: ES_NO_LIMIT,
        },
      },
      grade: {
        terms: {
          field: "grade.keyword",
          size: ES_NO_LIMIT,
        },
      },
      situation: {
        terms: {
          field: "situation.keyword",
          size: ES_NO_LIMIT,
        },
      },
      qpv: {
        terms: {
          field: "qpv.keyword",
          size: ES_NO_LIMIT,
        },
      },
      rural: {
        terms: {
          field: "isRegionRural.keyword",
          size: ES_NO_LIMIT,
        },
      },
      handicap: {
        terms: {
          field: "handicap.keyword",
          size: ES_NO_LIMIT,
        },
      },
      allergies: {
        terms: {
          field: "allergies.keyword",
          size: ES_NO_LIMIT,
        },
      },
      handicapInSameDepartment: {
        terms: {
          field: "handicapInSameDepartment.keyword",
          size: ES_NO_LIMIT,
        },
      },
      reducedMobilityAccess: {
        terms: {
          field: "reducedMobilityAccess.keyword",
          size: ES_NO_LIMIT,
        },
      },
      ppsBeneficiary: {
        terms: {
          field: "ppsBeneficiary.keyword",
          size: ES_NO_LIMIT,
        },
      },
      paiBeneficiary: {
        terms: {
          field: "paiBeneficiary.keyword",
          size: ES_NO_LIMIT,
        },
      },
      specificAmenagment: {
        terms: {
          field: "specificAmenagment.keyword",
          size: ES_NO_LIMIT,
        },
      },
    },
    size: 0,
  };
  if (filters?.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filters.cohort } });
  if (filters?.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filters.academy } });
  if (filters?.region?.length)
    body.query.bool.filter.push({
      bool: {
        should: [
          { bool: { must: [{ term: { "schooled.keyword": "true" } }, { terms: { "schoolRegion.keyword": filters.region } }] } },
          { bool: { must: [{ term: { "schooled.keyword": "false" } }, { terms: { "region.keyword": filters.region } }] } },
        ],
      },
    });
  if (filters?.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filters.department } });
  if (filters?.status?.length) body.query.bool.filter.push({ terms: { "status.keyword": filters.status } });
  const { responses } = await api.esQuery("young", body);
  if (!responses.length) return;
  // get keys of aggregations
  const keys = Object.keys(responses[0].aggregations);
  const obj = {};
  keys.forEach((key) => {
    // for each key, get the buckets
    obj[key] = {};
    responses[0].aggregations[key].buckets.forEach((e) => {
      // for each bucket, get the key and the doc_count
      obj[key][e.key] = e.doc_count;
    });
  });

  return obj;
}

const FilterDetail = ({ selectedDetail, setSelectedDetail }) => {
  const ref = useRef();
  const optionsDetail = [
    { key: "age", label: "Âge et sexe" },
    { key: "class", label: "Classe et situation" },
    { key: "situation", label: "Situations particulières" },
    { key: "qpv", label: "Issus quartiers prioritaires et zones rurales" },
  ];
  const [showDetailFilter, setShowDetailFilter] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowDetailFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);
  return (
    <div className="relative">
      <div className="min-w-[200px] flex flex-row gap-2 items-center p-2 cursor-pointer justify-center" onClick={() => setShowDetailFilter((open) => !open)}>
        <div>{optionsDetail.find((e) => e.key === selectedDetail).label}</div>
        {showDetailFilter && <BsChevronUp className="h-4 w-4 text-gray-900" aria-hidden="true" />}
        {!showDetailFilter && <BsChevronDown className="h-4 w-4 text-gray-900" aria-hidden="true" />}
      </div>

      {showDetailFilter && (
        <div ref={ref} className="absolute bg-white z-50 w-[236px] rounded-md  ring-1 ring-black ring-opacity-5 shadow-lg  translate-x-1/2 right-1/2">
          {optionsDetail.map((option) => (
            <div
              key={option.key}
              onClick={() => {
                setShowDetailFilter(false);
                setSelectedDetail(option.key);
              }}
              className="hover:bg-gray-100 py-1 cursor-pointer text-sm text-gray-700 leading-5 px-3">
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
