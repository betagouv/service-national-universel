import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";

import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { BsDownload } from "react-icons/bs";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi";
import { toastr } from "react-redux-toastr";
import { youngExportFields } from "snu-lib";
import Badge from "../../components/Badge";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loader from "../../components/Loader";
import { ExportComponent, Filters, ModalExport, ResultTable, Save, SelectedFilters, SortOption } from "../../components/filters-system-v2";
import { appURL } from "../../config";
import api from "../../services/api";
import plausibleEvent from "../../services/plausible";
import { ROLES, YOUNG_STATUS, YOUNG_STATUS_COLORS, getAge, translate, translatePhase1, translatePhase2 } from "../../utils";
import { Title } from "../pointDeRassemblement/components/common";
import DeletedVolontairePanel from "./deletedPanel";
import Panel from "./panel";
import { getFilterArray, transformVolontaires, transformVolontairesSchool } from "./utils";
import { signinAs } from "@/utils/signinAs";
import { getCohortGroups } from "@/services/cohort.service";

export default function VolontaireList() {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  if (user?.role === ROLES.ADMINISTRATEUR_CLE) return history.push("/mes-eleves");

  const [volontaire, setVolontaire] = useState(null);
  const [sessionsPhase1, setSessionsPhase1] = useState(null);
  const [bus, setBus] = useState(null);
  const [classes, setClasses] = useState(null);
  const [etablissements, setEtablissements] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [size, setSize] = useState(10);

  //List state
  const [data, setData] = useState([]);
  const pageId = "young-list";
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
    sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
  });

  const filterArray = getFilterArray(user, bus, sessionsPhase1, classes, etablissements);

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
        const { data: etablissements } = await api.post(`/elasticsearch/cle/etablissement/export`, {
          filters: {},
          exportFields: ["name", "uai"],
        });
        setSessionsPhase1(sessions);
        setBus(bus);
        setClasses(classes);
        setEtablissements(etablissements);
      } catch (e) {
        toastr.error("Oups, une erreur est survenue lors de la récupération des données");
      }
    })();
  }, []);

  if (!sessionsPhase1 || !bus || !classes || !etablissements) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Volontaires" }]} />
      <div className="flex w-full flex-col px-8">
        <div className="flex items-center justify-between py-8">
          <Title>Volontaires</Title>
          <div className="flex items-center gap-2">
            <button
              className="group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out"
              onClick={() => setIsExportOpen(true)}>
              <BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />
              <p>Exporter</p>
            </button>
            <ModalExport
              isOpen={isExportOpen}
              setIsOpen={setIsExportOpen}
              route="/elasticsearch/young/export?tab=volontaire"
              transform={(data, values) => transformVolontaires(data, values)}
              exportFields={youngExportFields}
              exportTitle="volontaires"
              showTotalHits={true}
              selectedFilters={selectedFilters}
            />

            {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
              <ExportComponent
                title={user.role === ROLES.REFERENT_DEPARTMENT ? "Exporter les volontaires scolarisés dans le département" : "Exporter les volontaires scolarisés dans la région"}
                exportTitle="Volontaires"
                route="/elasticsearch/young/young-having-school-in-dep-or-region/export?tab=volontaire"
                filters={filterArray}
                selectedFilters={selectedFilters}
                setIsOpen={() => true}
                icon={<BsDownload className="text-white h-4 w-4 group-hover:!text-blue-600" />}
                customCss={{
                  override: true,
                  button: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
                  loadingButton: `group ml-auto flex items-center gap-3 rounded-lg border-[1px] text-white border-blue-600 bg-blue-600 px-3 py-2 text-sm hover:bg-white hover:!text-blue-600 transition ease-in-out`,
                }}
                transform={async (data) => transformVolontairesSchool(data)}
              />
            )}
          </div>
        </div>

        <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
          <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
            <Filters
              pageId={pageId}
              route="/elasticsearch/young/search?tab=volontaire"
              setData={(value) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par prénom, nom, email, code postal..."
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
              paramData={paramData}
              setParamData={setParamData}
              size={size}
              subFilters={getCohortGroups()}
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
              <table className="mt-4 mb-2 w-full table-auto font-marianne">
                <thead>
                  <tr className="border-y-[1px] border-y-gray-100 uppercase text-gray-400 text-sm">
                    <th width="30%" className="pl-4 py-3">
                      Volontaire
                    </th>
                    <th className="text-center px-4 py-3">Cohorte</th>
                    <th className="text-center px-4 py-3">Contextes</th>
                    <th width="20%" className="text-center pr-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((hit) => (
                    <Hit key={hit._id} hit={hit} onClick={() => setVolontaire(hit)} selected={volontaire?._id === hit._id} />
                  ))}
                </tbody>
              </table>
            }
          />
        </div>
      </div>
      {volontaire !== null && volontaire.status === YOUNG_STATUS.DELETED ? (
        <DeletedVolontairePanel
          value={volontaire}
          onChange={() => {
            setVolontaire(null);
          }}
        />
      ) : (
        <Panel
          value={volontaire}
          onChange={() => {
            setVolontaire(null);
          }}
        />
      )}
    </>
  );
}

const Hit = ({ hit, onClick }) => {
  return (
    <tr onClick={onClick} className="border-b-[1px] border-y-gray-100 hover:bg-gray-50">
      <td className="pl-4 py-3 w-[30%]">
        <span className="font-bold text-gray-900 leading-6">{hit.status !== "DELETED" ? `${hit.firstName} ${hit.lastName}` : "Compte supprimé"}</span>
        <p className="text-sm text-gray-600 leading-5">
          {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {hit.status !== "DELETED" ? `• ${hit.city || ""} (${hit.department || ""})` : null}
        </p>
      </td>
      <td className="text-center">
        <Badge color="#3B82F6" backgroundColor="#EFF6FF" text={hit.cohort} style={{ cursor: "default" }} />
      </td>
      <td className="text-center">
        {hit.status === "WITHDRAWN" && <Badge minify text="Désisté" color={YOUNG_STATUS_COLORS.WITHDRAWN} tooltipText={translate(hit.status)} />}
        {hit.status === "DELETED" && <Badge minify text="Supprimé" color={YOUNG_STATUS_COLORS.DELETED} tooltipText={translate(hit.status)} />}
        <BadgePhase text="Phase 1" value={hit.statusPhase1} redirect={`/volontaire/${hit._id}/phase1`} style={hit.status === "DELETED" ? "opacity-50" : ""} />
        <BadgePhase text="Phase 2" value={hit.statusPhase2} redirect={`/volontaire/${hit._id}/phase2`} style={hit.status === "DELETED" ? "opacity-50" : ""} />
      </td>
      <td onClick={(e) => e.stopPropagation()} className="w-[20%] pr-4 py-3">
        <Action hit={hit} />
      </td>
    </tr>
  );
};

const BadgePhase = ({ text, value, redirect, style }) => {
  const history = useHistory();
  const translator = () => {
    if (text === "Phase 1") {
      return translatePhase1(value);
    } else if (text === "Phase 2") {
      return translatePhase2(value);
    } else {
      return translate(value);
    }
  };

  return (
    <Link to={redirect}>
      <Badge minify text={text} tooltipText={translator()} minTooltipText={`${text}: ${translate(value)}`} color={YOUNG_STATUS_COLORS[value]} className={style} />
    </Link>
  );
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Action = ({ hit }) => {
  const user = useSelector((state) => state.Auth.user);

  const onPrendreLaPlace = async (young_id) => {
    if (!user) return toastr.error("Vous devez être connecté pour effectuer cette action.");

    try {
      plausibleEvent("Volontaires/CTA - Prendre sa place");
      await signinAs("young", young_id);
      window.open(appURL, "_blank");
    } catch (e) {
      toastr.error("Une erreur s'est produite lors de la prise de place du volontaire.");
    }
  };

  return (
    <Listbox>
      {({ open }) => (
        <>
          <div className="relative w-4/5 mx-auto">
            <Listbox.Button className="relative w-full text-left">
              <div className={`${open ? "border-blue-500" : ""} flex items-center gap-0 space-y-0 rounded-lg border-[1px] bg-white py-2 px-2.5`}>
                <div className="flex w-full items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-900">Choisissez une action</p>
                  </div>
                  <div className="pointer-events-none flex items-center pr-2">
                    {open && <HiOutlineChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                    {!open && <HiOutlineChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />}
                  </div>
                </div>
              </div>
            </Listbox.Button>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <Listbox.Options className="max-h-60 absolute z-10 mt-1 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <Link className="!cursor-pointer" to={`/volontaire/${hit._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Consulter profil volontaire")} target="_blank">
                  <Listbox.Option className={("text-gray-900", "relative cursor-pointer select-none list-none py-2 pl-3 pr-9 hover:text-white hover:bg-blue-600")}>
                    <span className={"block truncate font-normal text-xs"}>Consulter le profil</span>
                  </Listbox.Option>
                </Link>
                {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && hit.status !== YOUNG_STATUS.DELETED ? (
                  <Listbox.Option
                    className={({ active }) => classNames(active ? "bg-blue-600 text-white" : "text-gray-900", "relative cursor-pointer select-none list-none py-2 pl-3 pr-9")}>
                    <button className={"block truncate font-normal text-xs"} onClick={() => onPrendreLaPlace(hit._id)}>
                      Prendre sa place
                    </button>
                  </Listbox.Option>
                ) : null}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};
