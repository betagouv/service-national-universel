import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Page, Header, Container, Badge, DropdownButton } from "@snu/ds/admin";
import { formatLongDateFR, getDepartmentNumber, ROLES, translate } from "snu-lib";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { BsDownload } from "react-icons/bs";
import api from "@/services/api";
import dayjs from "@/utils/dayjs.utils";
import { IoFlashOutline } from "react-icons/io5";
import { HiOutlineHome } from "react-icons/hi";

export default function List() {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const [services, setServices] = useState();

  //List params
  const [data, setData] = useState([
    {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "manager_department",
    },
    {
      firstName: "Alice",
      lastName: "Smith",
      email: "alice.smith@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "assistant_manager_department",
    },
    {
      firstName: "Bob",
      lastName: "Johnson",
      email: "bob.johnson@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "manager_phase2",
    },
    {
      firstName: "Emily",
      lastName: "Brown",
      email: "emily.brown@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "secretariat",
    },
    {
      firstName: "David",
      lastName: "Lee",
      email: "david.lee@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "coordinator",
    },
    {
      firstName: "Grace",
      lastName: "Wilson",
      email: "grace.wilson@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "assistant_coordinator",
    },
    {
      firstName: "Michael",
      lastName: "Anderson",
      email: "michael.anderson@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
    },
    {
      firstName: "Sophia",
      lastName: "Taylor",
      email: "sophia.taylor@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "manager_department",
    },
    {
      firstName: "William",
      lastName: "Thomas",
      email: "william.thomas@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "assistant_manager_department",
    },
    {
      firstName: "Olivia",
      lastName: "Moore",
      email: "olivia.moore@example.com",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toUTCString(),
      role: "referent_department",
      subRole: "secretariat",
    },
  ]);
  const pageId = "referent-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
    sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
  });
  const [size, setSize] = useState(10);

  const filterArray = [
    {
      title: "Rôle",
      name: "role",
      translate: translate,
      missingLabel: "Non renseigné",
    },
    {
      title: "Région",
      name: "region",
      missingLabel: "Non renseignée",
      defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [],
    },
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseignée",
      translate: (e) => getDepartmentNumber(e) + " - " + e,
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
    },
    {
      title: "Fonction",
      name: "subRole",
      missingLabel: "Non renseignée",
      translate: translate,
    },
    {
      title: "Cohorte",
      name: "cohorts",
      missingLabel: "Non renseignée",
      translate: translate,
    },
  ];

  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get(`/department-service`);
      if (!ok) return;
      setServices(data);
    })();
  }, []);

  return (
    <Page>
      <Header
        title="Liste de mes contacts"
        breadcrumb={[{ title: <HiOutlineHome size={20} className="hover:text-gray-500" />, to: "/" }, { title: "Mes contacts" }]}
        actions={[
          <ExportComponent
            key={0}
            title="Exporter"
            exportTitle="Utilisateurs"
            route={`/elasticsearch/referent/export${user.role === ROLES.HEAD_CENTER ? "?cohort=" + sessionPhase1?.cohort : ""}`}
            filters={filterArray}
            selectedFilters={selectedFilters}
            setIsOpen={() => true}
            icon={<BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />}
            customCss={{
              override: true,
              button: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
              loadingButton: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
            }}
            transform={(all) => {
              return all.map((data) => {
                let service = {};
                if (data.role === ROLES.REFERENT_DEPARTMENT && services) {
                  service = services.find((s) => s.department === data.department);
                  if (!service) service = {};
                }
                return {
                  _id: data._id,
                  Prénom: data.firstName,
                  Nom: data.lastName,
                  Email: data.email,
                  Rôle: data.role,
                  Fonction: data.subRole,
                  Téléphone: data.phone,
                  Portable: data.mobile,
                  Département: data.department,
                  Région: data.region,
                  "Nom de la direction du service départemental": service?.directionName || "",
                  "Adresse du service départemental": service?.address + service?.complementAddress || "",
                  "Code Postal du service départemental": service?.zip || "",
                  "Ville du service départemental": service?.city || "",
                  "Créé lé": formatLongDateFR(data.createdAt),
                  "Mis à jour le": formatLongDateFR(data.updatedAt),
                  "Dernière connexion le": formatLongDateFR(data.lastLoginAt),
                };
              });
            }}
          />,
        ]}
      />
      <Container className="!p-3">
        <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
          <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
            <Filters
              pageId={pageId}
              route={`/elasticsearch/referent/search${user.role === ROLES.HEAD_CENTER ? "?cohort=" + sessionPhase1?.cohort : ""}`}
              setData={(value) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par prénom, nom, email..."
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
                    <span className="w-[30%]">Utilisateurs</span>
                    <span className="w-[30%]">Rôles / Fonctions</span>
                    <span className="w-[17%]">Création</span>
                    <span className="w-[18%]">Dernière connexion</span>
                    <span className="w-[5%]">Actions</span>
                  </tr>
                </thead>
                <tbody>
                  {data.map((hit) => (
                    <Hit key={hit._id} hit={hit} />
                  ))}
                </tbody>
                <tr className="flex items-center py-3 px-4 text-xs font-[500] leading-5 uppercase text-gray-500 bg-gray-50 cursor-default">
                  <span className="w-[30%]">Utilisateurs</span>
                  <span className="w-[30%]">Rôles / Fonctions</span>
                  <span className="w-[17%]">Création</span>
                  <span className="w-[18%]">Dernière connexion</span>
                  <span className="w-[5%]">Actions</span>
                </tr>
              </table>
            }
          />
        </div>
      </Container>
    </Page>
  );
}

const Hit = ({ hit }) => {
  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50">
      <td className="w-[30%] table-cell truncate cursor-pointer" onClick={() => history.push(`/student/${hit._id}`)}>
        <span className="font-bold text-gray-900 text-base leading-5">{hit.status !== "DELETED" ? `${hit.firstName} ${hit.lastName}` : "Compte supprimé"}</span>
        <p className="text-xs text-gray-500 leading-5">{hit.email}</p>
      </td>
      <td className="flex w-[30%] flex-col gap-2">
        {hit.role && (
          <>
            <Badge title={translate(hit.role)} />
            {hit.subRole && hit.subRole !== "god" ? <Badge title={translate(hit.subRole)} status={"secondary"} /> : null}
          </>
        )}
      </td>
      <td className="w-[17%]" onClick={() => history.push(`/mission/${hit._id}`)}>
        <p className="text-sm leading-none text-gray-900">{dayjs(hit.createdAt).format("DD/MM/YYYY")}</p>
        <p className="text-sm leading-none text-gray-500 mt-2">{dayjs(hit.createdAt).format("hh:mm")}</p>
      </td>
      <td className="w-[18%]">
        <p className="text-sm leading-none text-gray-900">{dayjs(hit.lastLoginAt).format("DD/MM/YYYY")}</p>
        <p className="text-sm leading-none text-gray-500 mt-2">{dayjs(hit.lastLoginAt).format("hh:mm")}</p>
      </td>
      <td className="flex w-[5%] flex-col gap-2">
        <DropdownButton
          title={<IoFlashOutline size={20} />}
          mode={"badge"}
          rightIcon={false}
          buttonClassName={"rounded-[50%] !p-0 !w-10 !h-10 border-none hover:bg-white hover:text-blue-600"}
          position="right"
          optionsGroup={[
            {
              key: "actions",
              title: "",
              items: [
                { key: "action1", render: <p>Action 1</p> },
                { key: "action2", render: <p>Action 2</p> },
              ],
            },
          ]}
        />
      </td>
    </tr>
  );
};
