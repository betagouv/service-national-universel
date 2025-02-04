import React, { useState, useEffect, Fragment } from "react";
import { HiOutlineClipboardCheck } from "react-icons/hi";
import { Link, useParams } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useAsync } from "react-use";

import { Button, Container, Header, Page } from "@snu/ds/admin";
import { youngCleExportFields, YOUNG_STATUS } from "snu-lib";
import { ClasseDto, YoungDto } from "snu-lib/src/dto";

import api from "@/services/api";
import { capture } from "@/sentry";
import Loader from "@/components/Loader";
import { Filters, ModalExport, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";

import YoungRowGeneral from "./components/YoungRowGeneral";
import { getFilterArray, transformVolontairesCLE } from "./utils/list";
import YoungRowConsent from "./consent/YoungRowConsent";
import YoungRowValidation from "./validation/YoungRowValidation";
import YoungRowImageRight from "./imageRight/YoungRowImageRight";
import NavbarList from "./components/NavbarList";
import ButtonActionGroupConsent from "./consent/ButtonActionGroupConsent";
import ButtonActionGroupValidation from "./validation/ButtonActionGroupValidation";
import ButtonActionGroupImageRight from "./imageRight/ButtonActionGroupImageRight";
import YoungListHeader from "./components/YoungListHeader";
import useFilterLabels from "../volontaires/useFilterLabels";

interface YoungDtoWithClasse extends YoungDto {
  classe: ClasseDto;
}

export default function List() {
  const pageId = "youngCle-list";
  const { data: labels, isPending } = useFilterLabels(pageId);
  const [youngList, setYoungList] = useState([]);
  const [students, setStudents] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<any>({});
  const [selectedYoungs, setSelectedYoungs] = useState<YoungDtoWithClasse[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  const { tabId } = useParams<{ tabId?: "general" | "consent" | "validation" | "image" }>();
  const currentTab = tabId || "general";
  const filterArray = getFilterArray(labels);

  const { value: studentsCount } = useAsync(async () => {
    try {
      const { inscriptionStep2023, status, imageRight, ...countFilter } = selectedFilters;
      const res = await api.post(`/elasticsearch/cle/young/search`, {
        filters: Object.entries(countFilter).reduce(
          (acc, [key, value]) => {
            const { filter } = value as { filter: (string | number)[] };

            if (key === "searchbar" || (filter.length === 1 && filter[0] === "")) {
              return acc;
            }

            return { ...acc, [key]: filter.map((item) => String(item)) };
          },
          {} as { [key: string]: string[] },
        ),
      });
      return {
        studentsWaitingConsent: res.responses[1].aggregations?.inscriptionStep2023?.names?.buckets.find((e) => e.key === "WAITING_CONSENT")?.doc_count || 0,
        studentsWaitingValidation: res.responses[1].aggregations?.status?.names?.buckets.find((e) => e.key === YOUNG_STATUS.WAITING_VALIDATION)?.doc_count || 0,
        studentsWaitingImageRights: res.responses[1].aggregations?.imageRight?.names?.buckets.find((e) => e.key === "N/A")?.doc_count || 0,
      };
    } catch (e) {
      capture(e);
      toastr.error("Erreur", "Oups, une erreur est survenue lors de la récupération des données");
    }
    return {
      studentsWaitingConsent: 0,
      studentsWaitingValidation: 0,
      studentsWaitingImageRights: 0,
    };
  }, [selectedFilters, youngList]);

  const getDataForExport = async () => {
    try {
      const res = await api.post(`/elasticsearch/cle/young/search`, {
        filters: {},
      });

      setStudents(res.responses[0].hits.total.value > 0);
    } catch (e) {
      toastr.error("Erreur", "Oups, une erreur est survenue lors de la récupération des données");
    }
  };

  useEffect(() => {
    getDataForExport();
  }, []);

  const initFilters = () => {
    setYoungList([]);
    setSelectedYoungs([]);
    setSelectAll(false);
    setSize(10);
    setParamData({ page: 0 });
    if (currentTab === "general") {
      setSelectedFilters((prevFilters) => {
        const { inscriptionStep2023, status, imageRight, ...rest } = prevFilters;
        return rest;
      });
    } else if (currentTab === "consent") {
      setSelectedFilters((prevFilters) => {
        const { status, imageRight, ...rest } = prevFilters;
        return {
          ...rest,
          inscriptionStep2023: { filter: ["WAITING_CONSENT"] },
        };
      });
    } else if (currentTab === "validation") {
      setSelectedFilters((prevFilters) => {
        const { inscriptionStep2023, imageRight, ...rest } = prevFilters;
        return {
          ...rest,
          status: { filter: [YOUNG_STATUS.WAITING_VALIDATION] },
        };
      });
    } else if (currentTab === "image") {
      setSelectedFilters((prevFilters) => {
        const { inscriptionStep2023, status, ...rest } = prevFilters;
        return {
          ...rest,
          imageRight: { filter: ["N/A"] },
        };
      });
    }
  };

  useEffect(() => {
    initFilters();
  }, [currentTab]);

  if (isPending) return <Loader />;

  return (
    <Page>
      <Header
        title="Liste de mes élèves"
        breadcrumb={[{ title: "Mes élèves" }]}
        actions={students ? [<Button key="export" title="Exporter la liste des élèves (.xlsx)" type="primary" onClick={() => setIsExportOpen(true)} />] : []}
      />
      {!students && (
        <Container className="!p-8">
          <div className="py-6 bg-gray-50">
            <div className="flex items-center justify-center h-[136px] mb-4 text-lg text-gray-500 text-center">Vous n’avez pas encore d'élèves inscrits</div>
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
            totalHits={true}
            selectedFilters={selectedFilters}
          />
          <NavbarList
            currentTab={currentTab}
            studentsWaitingConsent={studentsCount?.studentsWaitingConsent}
            studentsWaitingValidation={studentsCount?.studentsWaitingValidation}
            studentsWaitingImageRights={studentsCount?.studentsWaitingImageRights}
          />

          <Container className="!p-0">
            <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
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
                  {currentTab === "consent" && !!studentsCount?.studentsWaitingConsent && (
                    <ButtonActionGroupConsent
                      selectedYoungs={selectedYoungs}
                      setSelectedYoungs={setSelectedYoungs}
                      setSelectAll={setSelectAll}
                      onYoungsChange={() => initFilters()}
                    />
                  )}
                  {currentTab === "validation" && !!studentsCount?.studentsWaitingValidation && (
                    <ButtonActionGroupValidation
                      selectedYoungs={selectedYoungs}
                      setSelectedYoungs={setSelectedYoungs}
                      setSelectAll={setSelectAll}
                      onYoungsChange={() => initFilters()}
                    />
                  )}
                  {currentTab === "image" && !!studentsCount?.studentsWaitingImageRights && (
                    <ButtonActionGroupImageRight
                      selectedYoungs={selectedYoungs}
                      setSelectedYoungs={setSelectedYoungs}
                      setSelectAll={setSelectAll}
                      onYoungsChange={() => initFilters()}
                    />
                  )}

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
                {currentTab === "consent" && !studentsCount?.studentsWaitingConsent ? (
                  <div className="bg-gray-50 mx-8 h-[500px] flex flex-col justify-center items-center">
                    <HiOutlineClipboardCheck size={64} className="text-gray-400 mb-8" />
                    <p className="text-base leading-5 text-gray-400">Vous n’avez plus de consentements à la participation à récolter actuellement</p>
                  </div>
                ) : currentTab === "validation" && !studentsCount?.studentsWaitingValidation ? (
                  <div className="bg-gray-50 mx-8 h-[500px] flex flex-col justify-center items-center">
                    <HiOutlineClipboardCheck size={64} className="text-gray-400 mb-8" />
                    <p className="text-base leading-5 text-gray-400">Vous n’avez plus d'inscription à valider actuellement</p>
                  </div>
                ) : currentTab === "image" && !studentsCount?.studentsWaitingImageRights ? (
                  <div className="bg-gray-50 mx-8 h-[500px] flex flex-col justify-center items-center">
                    <HiOutlineClipboardCheck size={64} className="text-gray-400 mb-8" />
                    <p className="text-base leading-5 text-gray-400">Vous n’avez plus de droits à l'image à récolter actuellement</p>
                  </div>
                ) : (
                  <ResultTable
                    paramData={paramData}
                    setParamData={setParamData}
                    currentEntryOnPage={youngList?.length}
                    size={size}
                    setSize={setSize}
                    render={
                      <table className="mt-6 mb-2 flex w-full flex-col divide-y table-auto divide-gray-100 border-gray-100">
                        <thead>
                          <YoungListHeader
                            currentTab={currentTab}
                            selectAll={selectAll}
                            onSelectAllChange={setSelectAll}
                            selectedYoungs={selectedYoungs}
                            onSelectedYoungsChange={setSelectedYoungs}
                            youngList={youngList}
                          />
                        </thead>
                        <tbody>
                          {youngList.map((young: YoungDto & { classe: ClasseDto }) => (
                            <Fragment key={young._id}>
                              {currentTab === "general" && <YoungRowGeneral young={young} />}
                              {currentTab === "consent" && (
                                <YoungRowConsent young={young} selectedYoungs={selectedYoungs} onYoungSelected={setSelectedYoungs} onChange={() => initFilters()} />
                              )}
                              {currentTab === "validation" && (
                                <YoungRowValidation young={young} selectedYoungs={selectedYoungs} onYoungSelected={setSelectedYoungs} onChange={() => initFilters()} />
                              )}
                              {currentTab === "image" && (
                                <YoungRowImageRight young={young} selectedYoungs={selectedYoungs} onYoungSelected={setSelectedYoungs} onChange={() => initFilters()} />
                              )}
                            </Fragment>
                          ))}
                          <YoungListHeader
                            currentTab={currentTab}
                            selectAll={selectAll}
                            onSelectAllChange={setSelectAll}
                            selectedYoungs={selectedYoungs}
                            onSelectedYoungsChange={setSelectedYoungs}
                            youngList={youngList}
                          />
                        </tbody>
                      </table>
                    }
                  />
                )}
              </>
            </div>
          </Container>
        </>
      )}
    </Page>
  );
}
