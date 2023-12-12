import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "@/components/filters-system-v2";
import { capture } from "@/sentry";
import api from "@/services/api";
import { translate } from "@/utils";
import { Badge, Button, Container, Header, Page } from "@snu/ds/admin";
import { useEffect, useState } from "react";
import { HiPlus, HiUsers, HiOutlineOfficeBuilding } from "react-icons/hi";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { ROLES } from "snu-lib";
import { statusClassForBadge } from "./utils";

export default function list() {
  const [classes, setClasses] = useState(null);
  const [data, setData] = useState([]);
  const pageId = "classe-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [etablissements, setEtablissements] = useState(null);
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    //else fetch classes
    (async () => {
      try {
        const { data: etablissements } = await api.post(`/elasticsearch/cle/etablissement/export`, {
          filters: {},
          exportFields: ["name", "uai"],
        });
        console.log(etablissements);
        setEtablissements(etablissements);
        if ([ROLES.REFERENT_DEPARTMENT, ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role)) return setClasses(true);
        const res = await api.post(`/elasticsearch/cle/classe/search`, { filters: {} });
        setClasses(res.responses[0].hits.total.value > 0);
      } catch (e) {
        setClasses(false);
        capture(e);
      }
    })();
  }, []);

  if (classes === null || !etablissements) return null;

  const filterArray = [
    { title: "Cohorte", name: "cohort", missingLabel: "Non renseigné" },
    {
      title: "Établissement",
      name: "etablissementId",
      missingLabel: "Non renseigné",
      translate: (item) => {
        if (item === "N/A" || !etablissements.length) return item;
        const res = etablissements.find((option) => option._id.toString() === item);
        if (!res) return "N/A - Supprimé";
        return res?.name;
      },
    },
    { title: "Numéro d'identification", name: "uniqueKeyAndId", missingLabel: "Non renseigné" },
    { title: "Statut", name: "status", missingLabel: "Non renseigné" },
    { title: "Statut phase 1", name: "statusPhase1", missingLabel: "Non renseigné" },
    { title: "Nom", name: "name", missingLabel: "Non renseigné" },
    { title: "Couleur", name: "coloration", missingLabel: "Non renseigné" },
    { title: "Type", name: "type", missingLabel: "Non renseigné" },
    { title: "Secteur", name: "sector", missingLabel: "Non renseigné" },
    { title: "Niveau", name: "grade", missingLabel: "Non renseigné" },
  ].filter(Boolean);

  if (classes === null) return null;

  return (
    <Page>
      <Header
        title="Liste de mes classes"
        breadcrumb={[{ title: <HiOutlineOfficeBuilding size={20} /> }, { title: "Mes classes" }]}
        actions={[
          ![ROLES.REFERENT_DEPARTMENT, ROLES.ADMIN, ROLES.REFERENT_REGION].includes(user.role) && (
            <Link key="list" to="/classes/create" className="ml-2">
              <Button leftIcon={<HiOutlineOfficeBuilding size={16} />} title="Créer une classe" />
            </Link>
          ),
        ].filter(Boolean)}
      />
      {!classes && (
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
      {classes && (
        <Container className="!p-0">
          <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
            <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
              <Filters
                pageId={pageId}
                route="/elasticsearch/cle/classe/search"
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
                  { label: "Nom (A > Z)", field: "name.keyword", order: "asc" },
                  { label: "Nom (Z > A)", field: "name.keyword", order: "desc" },
                  { label: "Date de création (récent > ancien)", field: "createdAt", order: "desc" },
                  { label: "Date de création (ancien > récent)", field: "createdAt", order: "asc" },
                ]}
                selectedFilters={selectedFilters}
                paramData={paramData}
                setParamData={setParamData}
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
                <table className="mt-6 mb-2 flex w-full flex-col table-auto divide-y divide-gray-100 border-gray-100">
                  <thead>
                    <tr className="flex items-center py-3 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
                      <span className="w-[40%]">Classes</span>
                      <span className="w-[20%]">Cohortes</span>
                      <span className="w-[20%]">Élèves</span>
                      <span className="w-[20%]">Statuts</span>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((hit) => (
                      <Hit key={hit._id} hit={hit} />
                    ))}
                  </tbody>
                  <tr className="flex items-center py-3 px-4 text-xs leading-5 font-[500] uppercase text-gray-500 bg-gray-50 ">
                    <span className="w-[40%]">Classes</span>
                    <span className="w-[20%]">Cohortes</span>
                    <span className="w-[20%]">Élèves</span>
                    <span className="w-[20%]">Statuts</span>
                  </tr>
                </table>
              }
            />
          </div>
        </Container>
      )}
    </Page>
  );
}

const Hit = ({ hit }) => {
  const history = useHistory();
  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50" onClick={() => history.push(`/classes/${hit._id}`)}>
      <td className="flex w-[40%] cursor-pointer items-center gap-4">
        <div className="flex w-full flex-col justify-center">
          <div className="m-0 table w-full table-fixed border-collapse">
            {hit?.name ? (
              <div className="table-cell truncate font-bold text-gray-900 text-base leading-5">{hit.name}</div>
            ) : (
              <div className="table-cell  text-gray-400 italic leading-5">Nom à préciser</div>
            )}
          </div>
          <div className="m-0 mt-1 table w-full table-fixed border-collapse">
            <div className="table-cel truncate text-xs leading-5 text-gray-500 ">id: {hit.uniqueKeyAndId}</div>
          </div>
        </div>
      </td>
      <td className="flex w-[20%] flex-col gap-2">
        <Badge title={hit.cohort} leftIcon={<HiUsers color="#EC4899" size={20} />} />
      </td>
      <td className="flex w-[20%] flex-col gap-2">{hit?.totalSeats ? <Badge title={hit.seatsTaken + "/" + hit.totalSeats} /> : <Badge title="À préciser" />}</td>
      <td className="w-[20%]">
        <Badge title={translate(hit.status)} status={statusClassForBadge(hit.status)} />
      </td>
    </tr>
  );
};
