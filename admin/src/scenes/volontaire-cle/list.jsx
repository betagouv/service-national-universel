import React, { useState, useEffect, Fragment } from "react";
import { HiHome, HiOutlineClipboardCheck } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { Filters, ModalExport, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { Button, Container, Header, Page } from "@snu/ds/admin";
import { youngCleExportFields, YOUNG_STATUS } from "snu-lib";
import api from "@/services/api";

import { getFilterArray, transformVolontairesCLE } from "./utils/list";
import YoungRowGeneral from "./components/YoungRowGeneral";
import YoungRowConsent from "./consent/YoungRowConsent";
import YoungRowValidation from "./validation/YoungRowValidation";
import YoungRowImageRight from "./imageRight/YoungRowImageRight";
import NavbarList from "./components/NavbarList";
import Loader from "@/components/Loader";

import ButtonActionGroupConsent from "./consent/ButtonActionGroupConsent";
import YoungListHeaderConsent from "./consent/YoungListHeaderConsent";
import ButtonActionGroupValidation from "./validation/ButtonActionGroupValidation";
import YoungListHeaderValidation from "./validation/YoungListHeaderValidation";
import ButtonActionGroupImageRight from "./imageRight/ButtonActionGroupImageRight";
import YoungListHeaderImageRight from "./imageRight/YoungListHeaderImageRight";

export default function List() {
  const [sessionsPhase1, setSessionsPhase1] = useState(null);
  const [bus, setBus] = useState(null);
  const [classes, setClasses] = useState(null);
  const [youngList, setYoungList] = useState([]);
  const [students, setStudents] = useState(null);
  const [studentsWaitingConsent, setStudentsWaitingConsent] = useState(0);
  const [studentsWaitingValidation, setStudentsWaitingValidation] = useState(0);
  const [studentsWaitingImageRights, setStudentsWaitingImageRights] = useState(0);
  const pageId = "youngCle-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get("tab") || "general";
  const filterArray = getFilterArray(sessionsPhase1, bus, classes);
  const [classeId, setClasseId] = useState(queryParams.get("classeId"));

  const getDefaultFilters = (filters) => {
    const newFilters = {};
    filters.map((f) => {
      if (f?.customComponent?.getQuery) {
        newFilters[f.name] = { filter: f.defaultValue, customComponentQuery: f.getQuery(f.defaultValue) };
      } else {
        newFilters[f.name] = { filter: f?.defaultValue ? f.defaultValue : [] };
      }
    });
    return newFilters;
  };

  const getData = async () => {
    try {
      const res = await api.post(`/elasticsearch/cle/young/search`, {
        filters: Object.entries(selectedFilters).reduce((e, [key, value]) => {
          if (key === "searchbar" || (value.filter.length === 1 && value.filter[0] === "")) {
            return e;
          }
          return { ...e, [key]: value.filter.map((e) => String(e)) };
        }, {}),
      });

      setStudentsWaitingConsent(res.responses[1].aggregations?.reinscriptionStep2023?.names?.buckets.find((e) => e.key === "WAITING_CONSENT")?.doc_count || 0);
      setStudentsWaitingValidation(res.responses[1].aggregations?.status?.names?.buckets.find((e) => e.key === YOUNG_STATUS.WAITING_VALIDATION)?.doc_count || 0);
      setStudentsWaitingImageRights(res.responses[1].aggregations?.imageRight?.names?.buckets.find((e) => e.key === "N/A")?.doc_count || 0);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
  };

  const getDataForExport = async () => {
    try {
      const { data: sessions } = await api.post(`/elasticsearch/sessionphase1/export`, {
        filters: {},
        exportFields: ["codeCentre", "cohesionCenterId"],
      });
      const { data: bus } = await api.post(`/elasticsearch/lignebus/export`, {
        filters: {},
        exportFields: ["busId"],
      });
      const { data: classes } = await api.post(`/elasticsearch/cle/classe/export`, {
        filters: {},
        exportFields: ["name", "uniqueKeyAndId"],
      });

      const res = await api.post(`/elasticsearch/cle/young/search`, {
        filters: {},
      });

      setStudents(res.responses[0].hits.total.value > 0);
      setSessionsPhase1(sessions);
      setBus(bus);
      setClasses(classes);
    } catch (e) {
      toastr.error("Oups, une erreur est survenue lors de la récupération des données");
    }
  };

  useEffect(() => {
    getDataForExport();
  }, []);

  useEffect(() => {
    getData();
    console.log("je suis dans le use effect qui set la classe");
    setClasseId(selectedFilters?.classeId?.filter[0]);
    console.log(classeId);
  }, [selectedFilters]);

  useEffect(() => {
    console.log("je suis dans le use effect qui set les filtre");
    if (currentTab === "consent") {
      setSelectedFilters({ ...selectedFilters, ["reinscriptionStep2023"]: { filter: ["WAITING_CONSENT"] } });
    } else if (currentTab === "validation") {
      setSelectedFilters({ ...selectedFilters, ["status"]: { filter: [YOUNG_STATUS.WAITING_VALIDATION] } });
    } else if (currentTab === "image") {
      console.log("je suis dans le use effect qui set les filtre image");
      setSelectedFilters({ ...selectedFilters, ["imageRight"]: { filter: ["N/A"] } });
    } else {
      if (!classeId) {
        console.log("je ne devrais pas etre ici");
        const defaultFilters = getDefaultFilters(filterArray);
        setSelectedFilters(defaultFilters);
      }
    }
    console.log(selectedFilters);
  }, [currentTab]);
  //console.log(classeId);
  //console.log(selectedFilters);

  if (!sessionsPhase1 || !bus || !classes) return <Loader />;

  return (
    <Page>
      <Header
        title="Liste de mes élèves"
        breadcrumb={[{ title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" />, to: "/" }, { title: "Mes élèves" }]}
        actions={students && [<Button key="export" title="Exporter la liste des élèves (.xlsx)" type="primary" onClick={() => setIsExportOpen(true)} />]}
      />
      {!students && (
        <Container className="!p-8">
          <div className="py-6 bg-gray-50">
            <div className="flex items-center justify-center h-[136px] mb-4 text-lg text-gray-500 text-center">Vous n’avez pas encore d'élèves inscrit</div>
            <div className="flex items-start justify-center h-[136px]">
              <Link to="/classes">
                <Button type="wired" title="Voir mes classes" />
              </Link>
            </div>
          </div>
        </Container>
      )}
      {students && (
        <>
          <ModalExport
            isOpen={isExportOpen}
            setIsOpen={setIsExportOpen}
            route="/elasticsearch/cle/young/export"
            transform={(data, values) => transformVolontairesCLE(data, values)}
            exportFields={youngCleExportFields}
            exportTitle="volontaires"
            showTotalHits={true}
            selectedFilters={selectedFilters}
          />
          <NavbarList
            currentTab={currentTab}
            classeId={classeId}
            setSelectedFilters={setSelectedFilters}
            setSize={setSize}
            setParamData={setParamData}
            studentsWaitingConsent={studentsWaitingConsent}
            studentsWaitingValidation={studentsWaitingValidation}
            studentsWaitingImageRights={studentsWaitingImageRights}
          />

          <Container className="!p-0">
            <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
              {currentTab === "consent" && studentsWaitingConsent === 0 ? (
                <div className="bg-gray-50 mx-8 h-[500px] flex flex-col justify-center items-center">
                  <HiOutlineClipboardCheck size={64} className="text-gray-400 mb-8" />
                  <p className="text-base leading-5 text-gray-400">Vous n’avez plus de consentements à la participation à récolter actuellement</p>
                </div>
              ) : currentTab === "validation" && studentsWaitingValidation === 0 ? (
                <div className="bg-gray-50 mx-8 h-[500px] flex flex-col justify-center items-center">
                  <HiOutlineClipboardCheck size={64} className="text-gray-400 mb-8" />
                  <p className="text-base leading-5 text-gray-400">Vous n’avez plus d'inscription à valider actuellement</p>
                </div>
              ) : currentTab === "image" && studentsWaitingImageRights === 0 ? (
                <div className="bg-gray-50 mx-8 h-[500px] flex flex-col justify-center items-center">
                  <HiOutlineClipboardCheck size={64} className="text-gray-400 mb-8" />
                  <p className="text-base leading-5 text-gray-400">Vous n’avez plus de droits à l'image à récolter actuellement</p>
                </div>
              ) : (
                <>
                  <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
                    <Filters
                      pageId={pageId}
                      route="/elasticsearch/cle/young/search?needClasseInfo=true"
                      setData={(value) => setYoungList(value)}
                      filters={filterArray}
                      searchPlaceholder="Rechercher par mots clés, ville, code postal..."
                      selectedFilters={selectedFilters}
                      setSelectedFilters={setSelectedFilters}
                      paramData={paramData}
                      setParamData={setParamData}
                      size={size}
                      disabled={currentTab !== "general"}
                    />
                    {currentTab === "consent" && <ButtonActionGroupConsent />}
                    {currentTab === "validation" && <ButtonActionGroupValidation />}
                    {currentTab === "image" && <ButtonActionGroupImageRight />}

                    <SortOption
                      sortOptions={[
                        { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
                        { label: "Nom (Z > A)", field: "lastName.keyword", order: "desc" },
                        { label: "Prénom (A > Z)", field: "firstName.keyword", order: "asc" },
                        { label: "Prénom (Z > A)", field: "firstName.keyword", order: "desc" },
                        { label: "Classes", field: "classeId.keyword" },
                      ]}
                      selectedFilters={selectedFilters}
                      pagination={paramData}
                      onPaginationChange={setParamData}
                    />
                  </div>
                  <div className="mt-2 flex flex-row flex-wrap items-center px-4">
                    <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} disabled={currentTab !== "general"} />
                    <SelectedFilters
                      filterArray={filterArray}
                      selectedFilters={selectedFilters}
                      setSelectedFilters={setSelectedFilters}
                      paramData={paramData}
                      setParamData={setParamData}
                      disabled={currentTab !== "general"}
                    />
                  </div>
                  <ResultTable
                    paramData={paramData}
                    setParamData={setParamData}
                    currentEntryOnPage={youngList?.length}
                    size={size}
                    setSize={setSize}
                    render={
                      <table className="mt-6 mb-2 flex w-full flex-col divide-y table-auto divide-gray-100 border-gray-100">
                        <thead>
                          {currentTab === "general" && (
                            <tr className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 bg-gray-50">
                              <th className="w-[30%]">Élèves</th>
                              <th className="w-[20%]">Cohortes</th>
                              <th className="w-[20%]">Classes</th>
                              <th className="w-[20%] flex justify-center">Statuts</th>
                              <th className="w-[10%]">Actions</th>
                            </tr>
                          )}
                          {currentTab === "consent" && <YoungListHeaderConsent />}
                          {currentTab === "validation" && <YoungListHeaderValidation />}
                          {currentTab === "image" && <YoungListHeaderImageRight />}
                        </thead>
                        <tbody>
                          {youngList.map((young) => (
                            <Fragment key={young._id}>
                              {currentTab === "general" && <YoungRowGeneral young={young} />}
                              {currentTab === "consent" && <YoungRowConsent young={young} />}
                              {currentTab === "validation" && <YoungRowValidation young={young} />}
                              {currentTab === "image" && <YoungRowImageRight young={young} />}
                            </Fragment>
                          ))}
                          {currentTab === "general" && (
                            <tr className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 bg-gray-50">
                              <th className="w-[30%]">Élèves</th>
                              <th className="w-[20%]">Cohortes</th>
                              <th className="w-[20%]">Classes</th>
                              <th className="w-[20%] flex justify-center">Statuts</th>
                              <th className="w-[10%]">Actions</th>
                            </tr>
                          )}
                          {currentTab === "consent" && <YoungListHeaderConsent />}
                          {currentTab === "validation" && <YoungListHeaderValidation />}
                          {currentTab === "image" && <YoungListHeaderImageRight />}
                        </tbody>
                      </table>
                    }
                  />
                </>
              )}
            </div>
          </Container>
        </>
      )}
    </Page>
  );
}
