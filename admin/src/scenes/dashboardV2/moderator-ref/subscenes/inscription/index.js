import React, { useEffect, useMemo, useState, useRef } from "react";
import ButtonPrimary from "../../../../../components/ui/buttons/ButtonPrimary";
import DashboardContainer from "../../../components/DashboardContainer";
import { FullDoughnut, HorizontalBar, BarChart, Legends, Legend, graphColors } from "../../../components/graphs";

import { FilterDashBoard, FilterComponent } from "../../../components/FilterDashBoard";
import api from "../../../../../services/api";
import { toastr } from "react-redux-toastr";
import {
  YOUNG_STATUS,
  YOUNG_SITUATIONS,
  REFERENT_ROLES,
  departmentList,
  regionList,
  COHORTS,
  ES_NO_LIMIT,
  translate,
  academyList,
  region2department,
  department2region,
  academyToDepartments,
  departmentToAcademy,
} from "snu-lib";
import { useSelector } from "react-redux";
import StatutPhase from "../../../components/inscription/StatutPhase.js";

import { BsChevronUp, BsChevronDown } from "react-icons/bs";

export default function Index() {
  const user = useSelector((state) => state.Auth.user);
  const [inscriptionGoals, setInscriptionGoals] = useState();

  const [inscriptionDetailObject, setInscriptionDetailObject] = useState({});

  const [age, setAge] = useState({});
  const [sexe, setSexe] = useState({});
  const [grade, setGrade] = useState({});
  const [situation, setSituation] = useState({});
  const [qpv, setQpv] = useState({});
  const [rural, setRural] = useState({});
  const [specificSituation, setSpecificSituation] = useState({});

  const [departmentOptions, setDepartmentOptions] = useState(departmentList.map((department) => ({ key: department, label: department })));
  const [regionOptions, setRegionOptions] = useState(regionList.map((region) => ({ key: region, label: region })));
  const [academyOptions, setAcademyOptions] = useState(academyList.map((department) => ({ key: department, label: department })));

  const filterArray = [
    {
      id: "region",
      name: "Région",
      fullValue: "Toutes",
      options: regionOptions,
    },
    {
      id: "department",
      name: "Département",
      fullValue: "Tous",
      options: departmentOptions,
    },
    {
      id: "academy",
      name: "Académie",
      fullValue: "Tous",
      options: academyOptions,
    },
    {
      id: "cohort",
      name: "Cohorte",
      fullValue: "Toutes",
      options: COHORTS.map((cohort) => ({ key: cohort, label: cohort })),
    },
  ];

  const [selectedFilters, setSelectedFilters] = React.useState({
    cohort: ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Juin 2023", "Juillet 2023"],
  });

  /*
  const updateLocalisationOptions = () => {
    // check region
    if (selectedFilters?.region?.length > 0) {
      // if region is selected, we filter the department list
      // get the list of departments from the selected regions
      const departments = selectedFilters.region.map((region) => region2department[region]).flat();
      // check if there is a duplicate
      const uniqueDepartments = [...new Set(departments)];
      // set the department list
      // remove the department from the filter if it is not in the list
      const newDepartment = selectedFilters?.department?.filter((department) => uniqueDepartments.includes(department));

      const academy = uniqueDepartments.map((department) => departmentToAcademy[department]).flat();
      const uniqueAcademy = [...new Set(academy)];

      // remove the academy from the filter if it is not in the list
      const newAcademy = selectedFilters?.academy?.filter((academy) => uniqueAcademy.includes(academy));

      // verifier si les array newDepartment et selectedFilters.department sont differents
      if (newDepartment && (newDepartment.length !== selectedFilters?.department?.length || !selectedFilters.department.every((val, i) => val === newDepartment[i]))) {
        if (newAcademy && (newAcademy.length !== selectedFilters?.academy?.length || !selectedFilters.academy.every((val, i) => val === newAcademy[i])))
          return setSelectedFilters({ ...selectedFilters, department: newDepartment, academy: newAcademy });
        return setSelectedFilters({ ...selectedFilters, department: newDepartment });
      } else if (newAcademy && (newAcademy.length !== selectedFilters?.academy?.length || !selectedFilters.academy.every((val, i) => val === newAcademy[i]))) {
        return setSelectedFilters({ ...selectedFilters, academy: newAcademy });
      } else {
        setDepartmentOptions(uniqueDepartments.map((department) => ({ key: department, label: department })));
        setAcademyOptions(uniqueAcademy.map((academy) => ({ key: academy, label: academy })));
      }
    } else {
      if (selectedFilters?.department?.length === 0) setDepartmentOptions(departmentList.map((department) => ({ key: department, label: department })));
      if (selectedFilters?.academy?.length === 0) setAcademyOptions(academyList.map((academy) => ({ key: academy, label: academy })));
    }
    // check department
    if (selectedFilters?.department?.length > 0) {
      // if department is selected, we filter the region list
      // get the list of regions from the selected departments
      const regions = selectedFilters.department.map((department) => department2region[department]);
      // check if there is a duplicate
      const uniqueRegions = [...new Set(regions)];

      // filtrer les academies
      const academy = selectedFilters.department.map((department) => departmentToAcademy[department]).flat();
      const uniqueAcademy = [...new Set(academy)];

      // remove the region from the filter if it is not in the list
      const newRegion = selectedFilters?.region?.filter((region) => uniqueRegions.includes(region));

      // remove the academy from the filter if it is not in the list
      const newAcademy = selectedFilters?.academy?.filter((academy) => uniqueAcademy.includes(academy));

      // verifier si les array newRegion et selectedFilters.region sont differents
      if (newAcademy && (newAcademy.length !== selectedFilters?.academy?.length || !selectedFilters.academy.every((val, i) => val === newAcademy[i]))) {
        if (newRegion && (newRegion.length !== selectedFilters?.region?.length || !selectedFilters.region.every((val, i) => val === newRegion[i])))
          return setSelectedFilters({ ...selectedFilters, region: newRegion, academy: newAcademy });
        return setSelectedFilters({ ...selectedFilters, academy: newAcademy });
      } else if (newRegion && (newRegion.length !== selectedFilters?.region?.length || !selectedFilters.region.every((val, i) => val === newRegion[i]))) {
        return setSelectedFilters({ ...selectedFilters, region: newRegion });
      } else setRegionOptions(uniqueRegions.map((region) => ({ key: region, label: region })));
      setAcademyOptions(uniqueAcademy.map((academy) => ({ key: academy, label: academy })));
    } else {
      setRegionOptions(regionList.map((region) => ({ key: region, label: region })));
    }
    // check academy
    if (selectedFilters?.academy?.length > 0) {
      // if academy is selected, we filter the department list
      // get the list of departments from the selected regions
      const departments = selectedFilters.academy.map((academy) => academyToDepartments[academy]).flat();
      // check if there is a duplicate
      const uniqueDepartments = [...new Set(departments)];
      console.log(uniqueDepartments);
      // set the department list

      // filter on region
      const regions = uniqueDepartments.map((department) => department2region[department]);
      const uniqueRegions = [...new Set(regions)];

      // remove the region from the filter if it is not in the list
      const newRegion = selectedFilters?.region?.filter((region) => uniqueRegions.includes(region));

      // remove the department from the filter if it is not in the list
      const newDepartment = selectedFilters?.department?.filter((department) => uniqueDepartments.includes(department));
      // verifier si les array newDepartment et selectedFilters.department sont differents
      if (newDepartment && (newDepartment.length !== selectedFilters?.department?.length || !selectedFilters.department.every((val, i) => val === newDepartment[i]))) {
        if (newRegion && (newRegion.length !== selectedFilters?.region?.length || !selectedFilters.region.every((val, i) => val === newRegion[i])))
          return setSelectedFilters({ ...selectedFilters, region: newRegion, department: newDepartment });
        return setSelectedFilters({ ...selectedFilters, department: newDepartment });
      } else if (newRegion && (newRegion.length !== selectedFilters?.region?.length || !selectedFilters.region.every((val, i) => val === newRegion[i]))) {
        return setSelectedFilters({ ...selectedFilters, region: newRegion });
      } else setDepartmentOptions(uniqueDepartments.map((department) => ({ key: department, label: department })));
      setRegionOptions(uniqueRegions.map((region) => ({ key: region, label: region })));
    }
  };
*/
  const [selectedFiltersBottom, setSelectedFiltersBottom] = React.useState({});
  const filterArrayBottom = [
    {
      id: "status",
      name: "Statuts",
      fullValue: "Tous",
      options: Object.keys(YOUNG_STATUS).map((status) => ({ key: status, label: translate(status) })),
    },
    {
      id: "cohort",
      name: "Cohorte",
      fullValue: "Toutes",
      options: COHORTS.map((cohort) => ({ key: cohort, label: cohort })),
    },
  ];

  const [selectedDetail, setSelectedDetail] = useState("age");

  async function fetchInscriptionGoals() {
    const res = await getInscriptionGoals();
    setInscriptionGoals(res);
  }
  async function fetchCurrentInscriptions() {
    const res = await getCurrentInscriptions(selectedFilters);
    setInscriptionDetailObject(res);
  }

  async function fetchDetailInscriptions() {
    const res = await getDetailInscriptions({ ...selectedFilters, ...selectedFiltersBottom });
    // get all the years from the res object
    const objectYears = {};
    Object.keys(res.age).forEach((e) => {
      const year = new Date(parseInt(e)).getFullYear();
      if (!objectYears[year]) objectYears[year] = 1;
      else objectYears[year] += 1;
    });
    setAge(objectYears);
    setSexe(res.gender);
    setGrade(res.grade);
    setSituation(res.situation);
    setQpv(res.qpv);
    setRural(res.rural);
    setSpecificSituation({
      handicap: res.handicap,
      allergies: res.allergies,
      handicapInSameDepartment: res.handicapInSameDepartment,
      reducedMobilityAccess: res.reducedMobilityAccess,
      ppsBeneficiary: res.ppsBeneficiary,
      paiBeneficiary: res.paiBeneficiary,
      specificAmenagment: res.specificAmenagment,
    });
  }

  useEffect(() => {
    fetchInscriptionGoals();
  }, []);

  useEffect(() => {
    fetchCurrentInscriptions();
    fetchDetailInscriptions();
    //updateLocalisationOptions();
  }, [selectedFilters]);

  useEffect(() => {
    fetchDetailInscriptions();
  }, [selectedFiltersBottom]);

  const goal = useMemo(
    () =>
      inscriptionGoals &&
      inscriptionGoals
        .filter((e) => filterByRegionAndDepartement(e, selectedFilters, user))
        // if selectedFilters.cohort is empty --> we select all cohorts thus no .filter()
        .filter((e) => !selectedFilters.cohort.length || selectedFilters.cohort.includes(e.cohort))
        .reduce((acc, current) => acc + (current.max && !isNaN(Number(current.max)) ? Number(current.max) : 0), 0),
    [inscriptionGoals, selectedFilters.cohort, selectedFilters.department, selectedFilters.region, selectedFilters.academy],
  );
  return (
    <DashboardContainer
      active="inscription"
      availableTab={["general", "engagement", "sejour", "inscription", "analytics"]}
      navChildren={
        <div className="flex items-center gap-2">
          <ButtonPrimary className="text-sm">
            Exporter le rapport <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
          <ButtonPrimary className="text-sm">
            Exporter les statistiques <span className="font-bold">“Inscription”</span>
          </ButtonPrimary>
        </div>
      }>
      <div>Inscription</div>
      <FilterDashBoard selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} filterArray={filterArray} />
      <div className="bg-white my-4 p-8 rounded-lg">
        <HorizontalBar
          title="Objectif des inscriptions"
          labels={["Sur la liste principale", "Sur liste complémentaire", "En attente de validation", "En attente de correction", "En cours"]}
          values={[
            inscriptionDetailObject.VALIDATED,
            inscriptionDetailObject.WAITING_LIST,
            inscriptionDetailObject.WAITING_VALIDATION,
            inscriptionDetailObject.WAITING_CORRECTION,
            inscriptionDetailObject.IN_PROGRESS,
          ]}
          goal={goal}
        />
      </div>

      <StatutPhase values={inscriptionDetailObject} />

      <div className="min-w-[463px] w-[40%] bg-white rounded-lg my-4 py-6 px-8 flex items-center flex-col">
        <div className="flex flex-row justify-between items-center w-full">
          <div className="text-base font-bold text-gray-900">En détail</div>
          <div className="w-fit">
            {filterArrayBottom.map((filter) => (
              <FilterComponent key={filter.id} filter={filter} selectedFilters={selectedFiltersBottom} setSelectedFilters={setSelectedFiltersBottom} />
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
              values={[age["2005"], age["2006"], age["2007"], age["2008"]]}
              maxLegends={2}
            />
            <FullDoughnut title="Sexe" legendSide="left" labels={["Garçons", "Filles"]} values={[sexe.male, sexe.female]} maxLegends={2} />
          </div>
        ) : selectedDetail === "class" ? (
          <div className="flex flex-col justify-center items-center w-full gap-10">
            <FullDoughnut
              title="Classe"
              legendSide="right"
              labels={["2nde GT", "1ère GT", "2nde Pro", "1ère Pro", "3ème", "Autre", "CAP"]}
              values={[grade["2ndeGT"], grade["1ereGT"], grade["2ndePro"], grade["1erePro"], grade["3eme"], grade["Autre"], grade["CAP"]]}
              maxLegends={3}
            />
            <FullDoughnut
              title="Situation"
              legendSide="left"
              labels={["En voie générale ou technologique", "En voie professionnelle (hors apprentissage)", "En enseignement adapté"]}
              values={[situation[YOUNG_SITUATIONS.GENERAL_SCHOOL], situation[YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL], situation[YOUNG_SITUATIONS.SPECIALIZED_SCHOOL]]}
              maxLegends={3}
            />
          </div>
        ) : selectedDetail === "situation" ? (
          <div className="flex flex-col justify-center items-center w-full gap-10">
            <BarChart
              values={[specificSituation.handicap.true, specificSituation.ppsBeneficiary.true, specificSituation.paiBeneficiary.true, specificSituation.allergies.true]}
              noValue
              className="h-[200px] mt-8"
            />
            <Legends
              className="flew-wrap"
              values={[specificSituation.handicap.true, specificSituation.ppsBeneficiary.true, specificSituation.paiBeneficiary.true, specificSituation.allergies.true]}
              labels={["En situation de handicap", "Bénéficiaire d’un PPS", "Bénéficiaire d’un PAI", "Allergie/intolérance"]}
            />

            <div className="h-[1px] w-3/5 border-b-[1px] border-gray-300" />

            <div className="flex flex-row justify-between w-full">
              <Legend className="!flex-col text-center" name="Aménagement spécifique" value={specificSituation.specificAmenagment.true} color={graphColors[1][0]} />
              <Legend
                className="!flex-col text-center"
                name="Affectation dans le département de résidence"
                value={specificSituation.handicapInSameDepartment.true}
                color={graphColors[1][0]}
              />
              <Legend className="!flex-col text-center" name="Aménagement pour mobilité réduite" value={specificSituation.reducedMobilityAccess.true} color={graphColors[1][0]} />
            </div>
          </div>
        ) : selectedDetail === "qpv" ? (
          <div className="flex flex-col justify-center items-center w-full gap-10">
            <FullDoughnut title="Quartier prioritaires" legendSide="right" labels={["Oui", "Non"]} values={[qpv.true, qpv[""] + qpv.false]} maxLegends={3} />
            <FullDoughnut title="Zone rurale" legendSide="left" labels={["Oui", "Non"]} values={[rural.true, rural.false]} maxLegends={3} />
          </div>
        ) : null}
      </div>
    </DashboardContainer>
  );
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
        <div ref={ref} className="absolute bg-white z-50 w-fit rounded-md shadow-sm">
          {optionsDetail.map((option) => (
            <div
              key={option.key}
              onClick={() => {
                setShowDetailFilter(false);
                setSelectedDetail(option.key);
              }}
              className="hover:bg-gray-100 p-2 cursor-pointer">
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getInscriptionGoals = async () => {
  let dataMerged = [];
  const query = {
    query: { bool: { must: { match_all: {} } } },
    size: ES_NO_LIMIT,
  };
  const { responses } = await api.esQuery("inscriptiongoal", query);
  if (!responses.length) {
    toastr.error("Une erreur est survenue");
    return [];
  }
  const result = responses[0].hits.hits;
  result.map((e) => {
    const { department, region, academy, cohort, max } = e._source;
    dataMerged[department] = { cohort, department, region, academy, max: (dataMerged[department]?.max ? dataMerged[department].max : 0) + max };
  });

  return result.map((e) => e._source);
};

function filterByRegionAndDepartement(e, filters, user) {
  if (filters?.department?.length) return filters.department.includes(e.department);
  else if (user.role === REFERENT_ROLES.REFERENT_DEPARTMENT) return user.department.includes(e.department);
  if (filters?.region?.length) return filters.region.includes(e.region);
  if (filters?.academy?.length) return filters.academy.includes(e.academy);
  return true;
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
async function getCurrentInscriptions(filters) {
  const body = {
    query: { bool: { must: { match_all: {} }, filter: [] } },
    aggs: {
      status: {
        terms: {
          field: "status.keyword",
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

  const { responses } = await api.esQuery("young", body);
  if (!responses.length) return {};
  return api.getAggregations(responses[0]);
}
