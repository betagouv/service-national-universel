import { Popover, Transition } from "@headlessui/react";
import React, { Fragment, useEffect } from "react";
import FilterSvg from "../../../assets/icons/Filter";
import FilterPopOver from "./FilterPopOver";

import { SaveDisk } from "./Save";
import { useHistory } from "react-router-dom";

import { toastr } from "react-redux-toastr";
import ViewPopOver from "./ViewPopOver";

import api from "../../../services/api";
import { buildQuery, getURLParam, currentFilterAsUrl, buildBodyAggs } from "./utils";

import ReactTooltip from "react-tooltip";

import { SortOptionComponent } from "./SortOptionComponent";
import { getCustomComponent } from "../customFilter";

import ExportComponent from "../export/ExportXlsxV2";
import ModalExport from "../export/ModalExportV2";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function ListFiltersPopOver({
  esId,
  pageId,
  filters,
  defaultQuery,
  getCount,
  searchBarObject = null,
  setData,
  page = 1,
  size = 25,
  setPage,
  selectedFilters,
  setSelectedFilters,
  sortOptions = null,
  exportComponent = null,
  transform,
  exportFields,
}) {
  // search for filters
  const [search, setSearch] = React.useState("");

  // searchBar
  // data correspond to filters
  const [dataFilter, setDataFilter] = React.useState([]);
  const [filtersVisible, setFiltersVisible] = React.useState(filters);
  const [categories, setCategories] = React.useState([]);
  const mounted = React.useRef(false);
  const [modalSaveVisible, setModalSaveVisible] = React.useState(false);

  const [modalExportVisible, setModalExportVisible] = React.useState(false);

  const [savedView, setSavedView] = React.useState([]);

  const [count, setCount] = React.useState(0);

  const urlParams = new URLSearchParams(window.location.search);
  const history = useHistory();

  const [isShowing, setIsShowing] = React.useState(false);
  const ref = React.useRef(null);
  const refFilter = React.useRef(null);

  const hasSomeFilterSelected = Object.values(selectedFilters).find((item) => item?.filter?.length > 0 && item?.filter[0]?.trim() !== "");

  const [sortSelected, setSortSelected] = React.useState(sortOptions ? sortOptions[0] : null);

  React.useEffect(() => {
    const newFilters = search !== "" ? filters.filter((f) => f.title.toLowerCase().includes(search.toLowerCase())) : filters;
    setFiltersVisible(newFilters);
  }, [search]);

  React.useEffect(() => {
    // send count back to parent on every count updates
    getCount(count);
  }, [count]);

  React.useEffect(() => {
    init();
    getDBFilters();
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target) && refFilter.current && !refFilter.current.contains(event.target)) {
        setIsShowing(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  React.useEffect(() => {
    if (filtersVisible.length === 0) {
      setCategories([]);
      return;
    }
    const newCategories = [];
    filtersVisible?.forEach((f) => {
      if (!newCategories.includes(f.parentGroup)) {
        newCategories.push(f.parentGroup);
      }
    });
    setCategories(newCategories);
  }, [filtersVisible]);

  React.useEffect(() => {
    getData();
    setURL();
  }, [selectedFilters, page, sortSelected]);

  const init = async () => {
    const initialFilters = getURLParam(urlParams, setPage, filters);
    setSelectedFilters(initialFilters);
    const res = await buildQuery(esId, initialFilters, page, size, defaultQuery, filters, searchBarObject);
    if (!res) return;
    setDataFilter({ ...dataFilter, ...res.newFilters });
    setData(res.data);
    setCount(res.count);
    mounted.current = true;
  };

  const getData = async () => {
    console.log("getData", selectedFilters);
    const res = await buildQuery(esId, selectedFilters, page, size, defaultQuery, filters, searchBarObject, sortSelected);
    if (!res) return;
    setDataFilter({ ...dataFilter, ...res.newFilters });
    setCount(res.count);
    if (count !== res.count) setPage(0);
    setData(res.data);
  };

  const setURL = () => {
    history.replace({ search: `?${currentFilterAsUrl(selectedFilters, page)}` });
  };

  // text for tooltip save
  const saveTitle = Object.keys(selectedFilters).map((key) => {
    if (key === "searchbar") {
      if (selectedFilters[key]?.filter?.length > 0 && selectedFilters[key]?.filter[0]?.trim() !== "") return selectedFilters[key]?.filter[0];
      return;
    }
    if (selectedFilters[key]?.filter?.length > 0) {
      return filters.find((f) => f.name === key)?.title + " (" + selectedFilters[key].filter.length + ")";
    }
  });

  const getDBFilters = async () => {
    try {
      const res = await api.get("/filters/" + pageId);
      if (!res.ok) return toastr.error("Oops, une erreur est survenue lors du chargement des filtres");
      setSavedView(res.data);
    } catch (error) {
      console.log(error);
      toastr.error("Oops, une erreur est survenue lors du chargement des filtres");
    }
  };

  const saveFilter = async (name) => {
    try {
      const res = await api.post("/filters", {
        page: pageId,
        url: currentFilterAsUrl(),
        name: name,
      });
      if (!res.ok) return toastr.error("Oops, une erreur est survenue");
      toastr.success("Filtre sauvegardé avec succès");
      getDBFilters();
      setModalSaveVisible(false);
      return res;
    } catch (error) {
      console.log("???", error);
      if (error.code === "ALREADY_EXISTS") return toastr.error("Oops, le filtre existe déjà");
      return error;
    }
  };

  const handleDeleteFilter = async (id) => {
    try {
      const res = await api.remove("/filters/" + id);
      if (!res.ok) return toastr.error("Oops, une erreur est survenue");
      toastr.success("Filtre supprimé avec succès");
      getDBFilters();
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectUrl = (url) => {
    history.replace({ search: url });
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {};
    urlParams.forEach((value, key) => {
      filters[key] = { filter: value.split(",") };
    });
    console.log("filters", filters);
    setSelectedFilters(filters);
    setIsShowing(false);
  };

  const handleFilterShowing = (value) => {
    setIsShowing(value);
    setModalSaveVisible(false);
  };

  const handleCustomComponent = (query, f) => {
    console.log("handleCustomComponent? in listeFiltersPopover", query, f);
    setSelectedFilters({ ...selectedFilters, [f?.name]: { filter: query.value, customComponentQuery: query } });
  };
  async function transformVolontaires(data, values) {
    let all = data;
    if (values.includes("schoolSituation")) {
      const schoolsId = [...new Set(data.map((item) => item.schoolId).filter((e) => e))];
      if (schoolsId?.length) {
        const { responses } = await api.esQuery("schoolramses", {
          query: { bool: { must: { ids: { values: schoolsId } } } },
          size: ES_NO_LIMIT,
        });
        if (responses.length) {
          const schools = responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
          all = data.map((item) => ({ ...item, esSchool: schools?.find((e) => e._id === item.schoolId) }));
        }
      }
    }

    const response = await api.get("/ligne-de-bus/all");
    const meetingPoints = response ? response.data.meetingPoints : [];
    const ligneBus = response ? response.data.ligneBus : [];

    return all.map((data) => {
      let center = {};
      if (data.cohesionCenterId && centers && sessionsPhase1) {
        center = centers.find((c) => c._id === data.cohesionCenterId);
        if (!center) center = {};
      }
      let meetingPoint = {};
      let bus = {};
      if (data.meetingPointId && meetingPoints) {
        meetingPoint = meetingPoints.find((mp) => mp._id === data.meetingPointId);
        bus = ligneBus.find((lb) => lb._id === data.ligneId);
      }

      if (!data.domains) data.domains = [];
      if (!data.periodRanking) data.periodRanking = [];
      const allFields = {
        identity: {
          Prénom: data.firstName,
          Nom: data.lastName,
          Sexe: translate(data.gender),
          Cohorte: data.cohort,
          "Cohorte d'origine": data.originalCohort,
        },
        contact: {
          Email: data.email,
          Téléphone: data.phone,
        },
        birth: {
          "Date de naissance": formatDateFRTimezoneUTC(data.birthdateAt),
          "Pays de naissance": data.birthCountry || "France",
          "Ville de naissance": data.birthCity,
          "Code postal de naissance": data.birthCityZip,
        },
        address: {
          "Adresse postale": data.address,
          "Code postal": data.zip,
          Ville: data.city,
          Pays: data.country,
          "Nom de l'hébergeur": data.hostLastName,
          "Prénom de l'hébergeur": data.hostFirstName,
          "Lien avec l'hébergeur": data.hostRelationship,
          "Adresse - étranger": data.foreignAddress,
          "Code postal - étranger": data.foreignZip,
          "Ville - étranger": data.foreignCity,
          "Pays - étranger": data.foreignCountry,
        },
        location: {
          Département: data.department,
          Académie: data.academy,
          Région: data.region,
        },
        schoolSituation: {
          Situation: translate(data.situation),
          Niveau: translate(data.grade),
          "Type d'établissement": translate(data.esSchool?.type || data.schoolType),
          "Nom de l'établissement": data.esSchool?.fullName || data.schoolName,
          "Code postal de l'établissement": data.esSchool?.postcode || data.schoolZip,
          "Ville de l'établissement": data.esSchool?.city || data.schoolCity,
          "Département de l'établissement": departmentLookUp[data.esSchool?.department] || data.schoolDepartment,
          "UAI de l'établissement": data.esSchool?.uai,
        },
        situation: {
          "Quartier Prioritaire de la ville": translate(data.qpv),
          "Zone Rurale": translate(isInRuralArea(data)),
          Handicap: translate(data.handicap),
          "Bénéficiaire d'un PPS": translate(data.ppsBeneficiary),
          "Bénéficiaire d'un PAI": translate(data.paiBeneficiary),
          "Aménagement spécifique": translate(data.specificAmenagment),
          "Nature de l'aménagement spécifique": translate(data.specificAmenagmentType),
          "Aménagement pour mobilité réduite": translate(data.reducedMobilityAccess),
          "Besoin d'être affecté(e) dans le département de résidence": translate(data.handicapInSameDepartment),
          "Allergies ou intolérances alimentaires": translate(data.allergies),
          "Activité de haut-niveau": translate(data.highSkilledActivity),
          "Nature de l'activité de haut-niveau": data.highSkilledActivityType,
          "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(data.highSkilledActivityInSameDepartment),
          "Document activité de haut-niveau ": data.highSkilledActivityProofFiles,
          "Structure médico-sociale": translate(data.medicosocialStructure),
          "Nom de la structure médico-sociale": data.medicosocialStructureName, // différence avec au-dessus ?
          "Adresse de la structure médico-sociale": data.medicosocialStructureAddress,
          "Code postal de la structure médico-sociale": data.medicosocialStructureZip,
          "Ville de la structure médico-sociale": data.medicosocialStructureCity,
        },
        representative1: {
          "Statut représentant légal 1": translate(data.parent1Status),
          "Prénom représentant légal 1": data.parent1FirstName,
          "Nom représentant légal 1": data.parent1LastName,
          "Email représentant légal 1": data.parent1Email,
          "Téléphone représentant légal 1": data.parent1Phone,
          "Adresse représentant légal 1": data.parent1Address,
          "Code postal représentant légal 1": data.parent1Zip,
          "Ville représentant légal 1": data.parent1City,
          "Département représentant légal 1": data.parent1Department,
          "Région représentant légal 1": data.parent1Region,
        },
        representative2: {
          "Statut représentant légal 2": translate(data.parent2Status),
          "Prénom représentant légal 2": data.parent2FirstName,
          "Nom représentant légal 2": data.parent2LastName,
          "Email représentant légal 2": data.parent2Email,
          "Téléphone représentant légal 2": data.parent2Phone,
          "Adresse représentant légal 2": data.parent2Address,
          "Code postal représentant légal 2": data.parent2Zip,
          "Ville représentant légal 2": data.parent2City,
          "Département représentant légal 2": data.parent2Department,
          "Région représentant légal 2": data.parent2Region,
        },
        consent: {
          "Consentement des représentants légaux": translate(data.parentConsentment),
        },
        status: {
          "Statut général": translate(data.status),
          Phase: translate(data.phase),
          "Statut Phase 1": translatePhase1(data.statusPhase1),
          "Statut Phase 2": translatePhase2(data.statusPhase2),
          "Statut Phase 3": translate(data.statusPhase3),
          "Dernier statut le": formatLongDateFR(data.lastStatusAt),
        },
        phase1Affectation: {
          "ID centre": center._id || "",
          "Code centre (2021)": center.code || "",
          "Code centre (2022)": center.code2022 || "",
          "Nom du centre": center.name || "",
          "Ville du centre": center.city || "",
          "Département du centre": center.department || "",
          "Région du centre": center.region || "",
        },
        phase1Transport: {
          "Se rend au centre par ses propres moyens": translate(data.deplacementPhase1Autonomous),
          "Informations de transport sont transmises par les services locaux": translate(data.transportInfoGivenByLocal),
          "Bus n˚": bus?.busId,
          "Adresse point de rassemblement": meetingPoint?.address,
          "Date aller": formatDateFR(bus?.departuredDate),
          "Date retour": formatDateFR(bus?.returnDate),
        },
        phase1DocumentStatus: {
          "Droit à l'image - Statut": translateFileStatusPhase1(data.imageRightFilesStatus) || "Non Renseigné",
          "Autotest PCR - Statut": translateFileStatusPhase1(data.autoTestPCRFilesStatus) || "Non Renseigné",
          "Règlement intérieur": translate(data.rulesYoung),
          "Fiche sanitaire réceptionnée": translate(data.cohesionStayMedicalFileReceived) || "Non Renseigné",
        },
        phase1DocumentAgreement: {
          "Droit à l'image - Accord": translate(data.imageRight),
          "Autotest PCR - Accord": translate(data.autoTestPCR),
        },
        phase1Attendance: {
          "Présence à l'arrivée": !data.cohesionStayPresence ? "Non renseignée" : data.cohesionStayPresence === "true" ? "Présent" : "Absent",
          "Présence à la JDM": !data.presenceJDM ? "Non renseignée" : data.presenceJDM === "true" ? "Présent" : "Absent",
          "Date de départ": !data.departSejourAt ? "Non renseignée" : formatDateFRTimezoneUTC(data.departSejourAt),
          "Motif du départ": data?.departSejourMotif,
        },
        phase2: {
          "Domaine de MIG 1": data.domains[0],
          "Domaine de MIG 2": data.domains[1],
          "Domaine de MIG 3": data.domains[2],
          "Projet professionnel": translate(data.professionnalProject),
          "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
          "Période privilégiée pour réaliser des missions": data.period,
          "Choix 1 période": translate(data.periodRanking[0]),
          "Choix 2 période": translate(data.periodRanking[1]),
          "Choix 3 période": translate(data.periodRanking[2]),
          "Choix 4 période": translate(data.periodRanking[3]),
          "Choix 5 période": translate(data.periodRanking[4]),
          "Mobilité aux alentours de son établissement": translate(data.mobilityNearSchool),
          "Mobilité aux alentours de son domicile": translate(data.mobilityNearHome),
          "Mobilité aux alentours d'un de ses proches": translate(data.mobilityNearRelative),
          "Informations du proche":
            data.mobilityNearRelative &&
            [data.mobilityNearRelativeName, data.mobilityNearRelativeAddress, data.mobilityNearRelativeZip, data.mobilityNearRelativeCity].filter((e) => e)?.join(", "),
          "Mode de transport": data.mobilityTransport?.map((t) => translate(t)).join(", "),
          "Autre mode de transport": data.mobilityTransportOther,
          "Format de mission": translate(data.missionFormat),
          "Engagement dans une structure en dehors du SNU": translate(data.engaged),
          "Description engagement ": data.engagedDescription,
          "Souhait MIG": data.desiredLocation,
        },
        accountDetails: {
          "Créé lé": formatLongDateFR(data.createdAt),
          "Mis à jour le": formatLongDateFR(data.updatedAt),
          "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
        },
        desistement: {
          "Raison du désistement": getLabelWithdrawnReason(data.withdrawnReason),
          "Message de désistement": data.withdrawnMessage,
          // Date du désistement: // not found in db
        },
      };

      let fields = { ID: data._id };
      for (const element of values) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      return fields;
    });
  }

  return (
    <div>
      {/* TRICK DE FOU FURIEUX POUR RENDER LES CUSTOM COMPONENTS AU LOADING ET EXECUTER LA QUERY*/}
      {selectedFilters &&
        filters
          .filter((f) => f.customComponent)
          .map((f) => {
            return (
              <div className="hidden" key={f.name}>
                {getCustomComponent(f.customComponent, (value) => handleCustomComponent(value, f), selectedFilters[f?.name])}
              </div>
            );
          })}
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center justify-start gap-2">
          {searchBarObject && (
            <div className="h-[38px] w-[305px] border-[1px] rounded-md border-gray-300 overflow-hidden px-2.5">
              <input
                name={"searchbar"}
                placeholder={searchBarObject.placeholder}
                value={selectedFilters?.searchbar?.filter[0] || ""}
                onChange={(e) => setSelectedFilters({ ...selectedFilters, [e.target.name]: { filter: [e.target.value?.trim()] } })}
                className={`w-full h-full text-xs text-gray-600`}
              />
            </div>
          )}

          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  ref={ref}
                  onClick={() => handleFilterShowing(!isShowing)}
                  className={classNames(
                    open ? "ring-2 ring-blue-500 ring-offset-2" : "",
                    "flex gap-2 items-center px-3 h-[38px] rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer outline-none",
                    hasSomeFilterSelected ? "bg-[#2563EB] text-white" : "",
                  )}>
                  <FilterSvg className={`${hasSomeFilterSelected ? "text-white" : "text-gray-400"} h-4 w-4`} />
                  <span>Filtres</span>
                </Popover.Button>

                <Transition
                  as={Fragment}
                  show={isShowing !== false}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1">
                  <Popover.Panel ref={refFilter} className="absolute left-0 z-10 mt-2 w-[305px]">
                    <div className="rounded-lg shadow-lg">
                      <div className="relative grid bg-white py-2 rounded-lg border-[1px] border-gray-100">
                        {savedView.length > 0 && (
                          <ViewPopOver
                            setIsShowing={handleFilterShowing}
                            isShowing={isShowing === "view"}
                            savedView={savedView}
                            handleSelect={handleSelectUrl}
                            handleDelete={handleDeleteFilter}
                          />
                        )}
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="px-3 py-2 bg-gray-100 mx-2 rounded-lg mb-2 placeholder:text-gray-600 text-sm text-gray-900"
                          placeholder="Rechercher par..."
                        />
                        <div className="flex flex-col max-h-[590px] overflow-y-auto">
                          {categories.map((category, index) => (
                            <div key={category}>
                              {index !== 0 && <hr className="my-2 border-gray-100" />}
                              <div className="px-4 text-gray-500 text-xs leading-5 font-light">{category}</div>
                              {filtersVisible
                                ?.filter((f) => f.parentGroup === category)
                                ?.map((item) => (
                                  <FilterPopOver
                                    key={item.title}
                                    filter={item}
                                    selectedFilters={selectedFilters}
                                    setSelectedFilters={setSelectedFilters}
                                    data={dataFilter[item?.name] || []}
                                    isShowing={isShowing === item.name}
                                    setIsShowing={handleFilterShowing}
                                  />
                                ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
        {/* Export Component */}
        {exportComponent && (
          <>
            <div onClick={() => setModalExportVisible(true)}>Exporter les candidature</div>
            <ModalExport
              isOpen={modalExportVisible}
              setIsOpen={setModalExportVisible}
              index={esId}
              selectedFilters={selectedFilters}
              defaultQuery={buildBodyAggs(esId, selectedFilters, page, size, defaultQuery, filters, searchBarObject, sortSelected)}
              exportTitle="candidatures"
              showTotalHits={false}
              transform={transform}
              exportFields={exportFields}
            />
          </>
        )}
      </div>

      <div className="mt-2 flex flex-row flex-wrap gap-2 items-center">
        {/* icon de save */}
        {hasSomeFilterSelected && <SaveDisk saveTitle={saveTitle} saveFilter={saveFilter} modalSaveVisible={modalSaveVisible} setModalSaveVisible={setModalSaveVisible} />}
        {/* Display des filtres sélectionnés */}
        {filtersVisible
          .filter((item) => selectedFilters[item.name] && selectedFilters[item.name].filter.length > 0)
          .map((filter) => (
            <div
              key={filter.title}
              onClick={() => handleFilterShowing(filter.name)}
              className=" cursor-pointer flex flex-row border-[1px] border-gray-200 rounded-md w-fit p-2 items-center gap-1">
              <div className="text-gray-700 font-medium text-xs">{filter.title} :</div>
              {selectedFilters[filter.name].filter.map((item, index) => {
                if (index > 2) {
                  if (index === selectedFilters[filter.name].filter.length - 1) {
                    return (
                      <div key={item}>
                        <ToolTipView selectedFilters={selectedFilters} filter={filter} />
                        <div data-tip="" data-for="tooltip-filtre" className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500">
                          +{index - 2}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }
                return (
                  <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
                    {item}
                  </div>
                );
              })}
            </div>
          ))}
      </div>
      {sortOptions && <SortOptionComponent sortOptions={sortOptions} sortSelected={sortSelected} setSortSelected={setSortSelected} />}
    </div>
  );
}

const ToolTipView = ({ selectedFilters, filter }) => {
  return (
    <ReactTooltip id="tooltip-filtre" className="bg-white shadow-xl text-black !opacity-100" arrowColor="white" disable={false}>
      <div className="flex flex-row gap-2 flex-wrap max-w-[600px] rounded">
        {selectedFilters[filter.name].filter.map((item) => (
          <div className="bg-gray-100 rounded py-1 px-2 text-xs text-gray-500" key={item}>
            {item}
          </div>
        ))}
      </div>
    </ReactTooltip>
  );
};
