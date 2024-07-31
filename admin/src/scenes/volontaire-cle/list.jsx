import React, { useState, useEffect } from "react";
import { Filters, ModalExport, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { translate } from "snu-lib";
import { Badge, Button, Container, DropdownButton, Header, Page } from "@snu/ds/admin";
import { HiPlus, HiUsers, HiOutlineOfficeBuilding, HiHome } from "react-icons/hi";
import { IoFlashOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { YOUNG_STATUS, getAge, youngCleExportFields } from "snu-lib";
import { toastr } from "react-redux-toastr";
import api from "@/services/api";
import { getFilterArray, transformVolontairesCLE } from "./utils/list";

export default function list() {
  const user = useSelector((state) => state.Auth.user);
  const [sessionsPhase1, setSessionsPhase1] = useState(null);
  const [bus, setBus] = useState(null);
  const [classes, setClasses] = useState(null);
  const [data, setData] = useState([]);
  const [students, setStudents] = useState(null);
  const pageId = "youngCle-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  const filterArray = getFilterArray(sessionsPhase1, bus, classes);

  useEffect(() => {
    (async () => {
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
        const res = await api.post(`/elasticsearch/cle/young/search`, { filters: {} });

        setSessionsPhase1(sessions);
        setBus(bus);
        setClasses(classes);
        setStudents(res.responses[0].hits.total.value > 0);
      } catch (e) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      }
    })();
  }, []);

  if (!sessionsPhase1 || !bus || !classes) return null;

  return (
    <Page>
      <Header
        title="Liste de mes élèves"
        breadcrumb={[{ title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" />, to: "/" }, { title: "Mes élèves" }]}
        actions={
          students
            ? [<Button key="export" title="Exporter" type="primary" onClick={() => setIsExportOpen(true)} />]
            : [
                <Link key="list" to="/classes/create" className="ml-2">
                  <Button leftIcon={<HiOutlineOfficeBuilding size={16} />} title="Créer une classe" />
                </Link>,
              ]
        }
      />
      {!students && (
        <Container className="!p-8">
          <div className="py-6 bg-gray-50">
            <div className="flex items-center justify-center h-[136px] mb-4 text-lg text-gray-500 text-center">Vous n’avez pas encore créé de classe engagée</div>
            <div className="flex items-start justify-center h-[136px]">
              <Link to="/classes/create">
                <Button type="wired" leftIcon={<HiPlus />} title="Créer une première classe engagée" />
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
          <Container className="!p-0">
            <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
              <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
                <Filters
                  pageId={pageId}
                  route="/elasticsearch/cle/young/search?needClasseInfo=true"
                  setData={(value) => setData(value)}
                  filters={filterArray}
                  searchPlaceholder="Rechercher par mots clés, ville, code postal..."
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  paramData={paramData}
                  setParamData={setParamData}
                  size={size}
                />
                <SortOption
                  sortOptions={[
                    { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
                    { label: "Nom (Z > A)", field: "lastName.keyword", order: "desc" },
                    { label: "Prénom (A > Z)", field: "firstName.keyword", order: "asc" },
                    { label: "Prénom (Z > A)", field: "firstName.keyword", order: "desc" },
                    { label: "Date de création (récent > ancien)", field: "createdAt", order: "desc" },
                    { label: "Date de création (ancien > récent)", field: "createdAt", order: "asc" },
                  ]}
                  selectedFilters={selectedFilters}
                  pagination={paramData}
                  onPaginationChange={setParamData}
                />
              </div>
              <div className="mt-2 flex flex-row flex-wrap items-center px-4">
                <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
                <SelectedFilters
                  filterArray={filterArray}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  paramData={paramData}
                  setParamData={setParamData}
                />
              </div>

              <ResultTable
                paramData={paramData}
                setParamData={setParamData}
                currentEntryOnPage={data?.length}
                size={size}
                setSize={setSize}
                render={
                  <table className="mt-6 mb-2 flex w-full flex-col divide-y table-auto divide-gray-100 border-gray-100">
                    <thead>
                      <tr className="flex items-center py-3 px-4 text-xs font-[500] leading-5 uppercase text-gray-500 bg-gray-50 cursor-default">
                        <span className="w-[35%]">Élèves</span>
                        <span className="w-[20%]">Cohortes</span>
                        <span className="w-[20%]">Classes</span>
                        <span className="w-[20%]">Statuts</span>
                        <span className="w-[5%]">Actions</span>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((hit) => (
                        <Hit key={hit._id} hit={hit} />
                      ))}
                    </tbody>
                    <tr className="flex items-center py-3 px-4 text-xs uppercase text-gray-400 bg-gray-50">
                      <span className="w-[35%]">Élèves</span>
                      <span className="w-[20%]">Cohortes</span>
                      <span className="w-[20%]">Classes</span>
                      <span className="w-[20%]">Statuts</span>
                      <span className="w-[5%]">Actions</span>
                    </tr>
                  </table>
                }
              />
            </div>
          </Container>
        </>
      )}
    </Page>
  );
}

const Hit = ({ hit }) => {
  const history = useHistory();

  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50">
      <td className="w-[35%] table-cell truncate cursor-pointer" onClick={() => history.push(`/volontaire/${hit._id}`)}>
        <span className="font-bold text-gray-900 text-base leading-5">{hit.status !== YOUNG_STATUS.DELETED ? `${hit.firstName} ${hit.lastName}` : "Compte supprimé"}</span>
        <p className="text-xs text-gray-500 leading-5">
          {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null}{" "}
          {hit.status !== YOUNG_STATUS.DELETED && hit.department ? `• ${hit.city || ""} (${hit.department || ""})` : null}
        </p>
      </td>
      <td className="flex w-[20%] flex-col gap-2">
        <Badge title={hit.cohort} leftIcon={<HiUsers color="#EC4899" size={20} />} />
      </td>
      <td className="flex w-[20%] cursor-pointer items-center gap-4 " onClick={() => history.push(`/classes/${hit.classeId}`)}>
        <div className="flex w-full flex-col justify-center">
          <div className="m-0 table w-full table-fixed border-collapse">
            <div className="table-cell truncate font-bold text-gray-900">{hit?.classe?.name}</div>
          </div>
          <div className="m-0 mt-1 table w-full table-fixed border-collapse">
            <div className="table-cel truncate text-xs leading-5 text-gray-500 ">id: {hit?.classe?.uniqueKeyAndId}</div>
          </div>
        </div>
      </td>
      <td className="w-[20%]">
        <Badge title={translate(YOUNG_STATUS[hit.status])} status={hit.status} />
      </td>
      <td className="flex w-[5%] flex-col gap-2">
        <DropdownButton
          title={<IoFlashOutline size={20} />}
          mode={"badge"}
          rightIcon={false}
          buttonClassName={"rounded-[50%] !p-0 !w-10 !h-10 border-none !bg-gray-100 hover:!bg-white hover:text-blue-600"}
          position="right"
          optionsGroup={[
            {
              key: "actions",
              title: "",
              items: [
                {
                  key: "view",
                  render: (
                    <Link to={`/volontaire/${hit._id}`} className="appearance-none w-full">
                      <p>Consulter le profil</p>
                    </Link>
                  ),
                },
              ].filter(Boolean),
            },
          ]}
        />
      </td>
    </tr>
  );
};
