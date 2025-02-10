import React, { useState } from "react";
import { BsDownload } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { PointDeRassemblementType, ROLES, getDepartmentNumber, isSuperAdmin } from "snu-lib";
import Breadcrumbs from "../../components/Breadcrumbs";
import { ExportComponent, Filters, ResultTable, Save, SelectedFilters } from "../../components/filters-system-v2";
import { Title } from "./components/common";
import ModalCreation from "./components/ModalCreation";
import { getCohortGroups } from "@/services/cohort.service";
import { getDefaultCohort } from "@/utils/session";
import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";
import { Filter } from "@/components/filters-system-v2/components/Filters";
import ImportPDRButton from "./components/ImportPDRButton";

export default function List() {
  const user = useSelector((state: AuthState) => state.Auth.user);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const [modal, setModal] = React.useState({ isOpen: false });
  const defaultCohortName = getDefaultCohort(cohorts)?.name;
  const history = useHistory();
  const { search } = useLocation();
  const query = new URLSearchParams(search);

  React.useEffect(() => {
    const modalCreationOpen = query.get("modal_creation_open");
    setModal({ isOpen: !!modalCreationOpen });
  }, []);

  if (!defaultCohortName || !user) return <div></div>;
  return (
    <>
      <Breadcrumbs items={[{ title: "Séjours" }, { label: "Points de rassemblement" }]} />
      <div className="flex w-full flex-col px-8">
        <div className="flex items-center justify-between pt-8">
          <Title>Points de rassemblement</Title>
          <div className="flex gap-4">{isSuperAdmin(user) && <ImportPDRButton className="mb-8" />}</div>
        </div>
        <div>
          <div className={`relative mb-8 items-start rounded-b-lg rounded-tr-lg bg-white`}>
            <div className="flex w-full flex-col pt-4">
              <ListPoints user={user} />
            </div>
          </div>
        </div>
      </div>
      <ModalCreation
        isOpen={modal.isOpen}
        onCancel={() => {
          setModal({ isOpen: false });
          query.delete("modal_creation_open");
          history.replace({ search: query.toString() });
        }}
      />
    </>
  );
}

const ListPoints = ({ user }) => {
  const [data, setData] = React.useState<PointDeRassemblementType[]>([]);
  const [selectedFilters, setSelectedFilters] = React.useState({});
  const pageId = "pdrList";
  const [paramData, setParamData] = React.useState({ page: 0 });
  const [size, setSize] = useState(10);
  const filterArray: Filter[] = [
    { title: "Région", name: "region", missingLabel: "Non renseignée", defaultValue: user.role === ROLES.REFERENT_REGION ? [user.region] : [] },
    {
      title: "Département",
      name: "department",
      missingLabel: "Non renseignée",
      defaultValue: user.role === ROLES.REFERENT_DEPARTMENT ? user.department : [],
      translate: (e) => getDepartmentNumber(e) + " - " + e,
    },
  ];

  return (
    <div className="flex flex-col rounded-lg bg-white mb-4">
      <div className="mx-4">
        <div className="flex w-full flex-row justify-between">
          <Filters
            pageId={pageId}
            route="/elasticsearch/pointderassemblement/search"
            setData={(value) => setData(value)}
            filters={filterArray}
            searchPlaceholder="Rechercher un point de rassemblement"
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            paramData={paramData}
            setParamData={setParamData}
            size={size}
            intermediateFilters={[getCohortGroups("cohorts")]}
          />
          <ExportComponent
            title="Exporter"
            // @ts-ignore
            filters={filterArray}
            exportTitle="point_de_rassemblement"
            route="/elasticsearch/pointderassemblement/export"
            transform={async (data) => {
              const res: PointDeRassemblementType[] = [];
              for (const item of data) {
                res.push({
                  // @ts-ignore
                  Identifiant: item._id.toString(),
                  Matricule: item.matricule,
                  Code: item.code,
                  Nom: item.name,
                  Adresse: item.address,
                  Ville: item.city,
                  "Code postal": item.zip,
                  Département: item.department,
                  Région: item.region,
                });
              }
              return res;
            }}
            selectedFilters={selectedFilters}
            icon={<BsDownload className="text-gray-400" />}
            customCss={{
              override: true,
              button: `text-grey-700 bg-white border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
              loadingButton: `text-grey-700 bg-white  border border-gray-300 h-10 rounded-md px-3 font-medium text-sm`,
            }}
          />
        </div>
        <div className="mt-2 flex flex-row flex-wrap items-center">
          <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
          <SelectedFilters filterArray={filterArray} selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} paramData={paramData} setParamData={setParamData} />
        </div>
      </div>

      <ResultTable
        paramData={paramData}
        setParamData={setParamData}
        currentEntryOnPage={data?.length}
        size={size}
        setSize={setSize}
        render={
          <div className="mt-6 mb-2 flex w-full flex-col">
            <hr />
            <div className="flex items-center py-3 px-4 text-xs uppercase text-gray-400">
              <div className="w-[40%]">Points de rassemblements</div>
            </div>
            {data?.map((hit) => {
              return <Hit key={hit._id} hit={hit} />;
            })}
            <hr />
          </div>
        }
      />
    </div>
  );
};

const Hit = ({ hit }) => {
  const history = useHistory();
  return (
    <>
      <hr />
      <div className="flex items-center py-2 px-4 hover:bg-gray-50">
        <div className="flex w-[40%] cursor-pointer flex-col gap-1" onClick={() => history.push(`/point-de-rassemblement/${hit._id}`)}>
          <div className="font-bold leading-6 text-gray-900">{hit.name}</div>
          <div className="text-sm font-medium leading-4 text-gray-500">
            {hit.address}, {hit.zip}, {hit.city}
          </div>
          <div className="text-xs leading-4 text-gray-500">
            {hit.department}, {hit.region}
          </div>
        </div>
      </div>
    </>
  );
};
