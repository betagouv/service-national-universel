import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import { useToggle } from "react-use";
import { toastr } from "react-redux-toastr";
import dayjs from "dayjs";

import { Listbox, Transition } from "@headlessui/react";
import { AiOutlinePlus } from "react-icons/ai";
import { HiOutlineChevronDown, HiOutlineChevronUp, HiOutlineSparkles } from "react-icons/hi";
import {
  canInviteYoung,
  getDepartmentNumber,
  isSuperAdmin,
  translateCniExpired,
  translateYoungSource,
  FeatureFlagName,
  PERMISSION_RESOURCES,
  isCreateAuthorized,
  UserDto,
  YoungDto,
} from "snu-lib";

import { Button } from "@snu/ds/admin";

import { AuthState } from "@/redux/auth/reducer";
import { CohortState } from "@/redux/cohorts/reducer";
import { Filter } from "@/components/filters-system-v2/components/Filters";
import { FiltersYoungsForExport } from "@/services/brevoRecipientsService";
import Loader from "@/components/Loader";
import { signinAs } from "@/utils/signinAs";
import { getCohortGroups } from "@/services/cohort.service";
import { useBrevoExport } from "@/hooks/useBrevoExport";
import { ModalCreationListeBrevo, BrevoListData } from "@/components/modals/ModalCreationListeBrevo";

import useDocumentTitle from "../../hooks/useDocumentTitle";
import Badge from "../../components/Badge";
import Breadcrumbs from "../../components/Breadcrumbs";
import { Filters, ResultTable, Save, SelectedFilters, SortOption } from "../../components/filters-system-v2";
import { orderCohort } from "../../components/filters-system-v2/components/filters/utils";
import SelectStatus from "../../components/selectStatus";
import { appURL } from "../../config";
import plausibleEvent from "../../services/plausible";
import { ROLES, YOUNG_STATUS, formatStringLongDate, translate, translateInscriptionStatus } from "../../utils";
import { Title } from "../pointDeRassemblement/components/common";
import useClass from "../classe/utils/useClass";
import useFilterLabels from "../volontaires/useFilterLabels";
import DeletedInscriptionPanel from "./deletedPanel";
import Panel from "./panel";
import ExportInscriptionsButton from "./ExportInscriptionsButton";
import ExportInscriptionsScolariseButton from "./ExportInscriptionsScolariseButton";
import { MAX_EXPORT_VOLONTAIRES, MAX_EXPORT_VOLONTAIRES_SYNC } from "../volontaires/list";

interface ParamData {
  page: number;
  sort: {
    label: string;
    field: string;
    order: string;
  };
  count?: number;
}

export const getInscriptionFilterArray = (user: UserDto, labels: { [key: string]: string }): Filter[] => {
  return [
    { title: "Cohorte", name: "cohort", parentGroup: "Général", missingLabel: "Non renseigné", sort: orderCohort },
    { title: "Autorisation de participation", name: "parentAllowSNU", parentGroup: "Général", missingLabel: "Non renseigné", translate: translate },
    { title: "Statut", name: "status", parentGroup: "Général", missingLabel: "Non renseigné", translate: translateInscriptionStatus },
    { title: "Source", name: "source", parentGroup: "Général", missingLabel: "Non renseigné", translate: translateYoungSource },
    {
      title: "Classe Engagée ID",
      name: "classeId",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: (item: string) => {
        if (item === "N/A") return item;
        return labels[item] || "N/A - Supprimé";
      },
    },
    {
      title: "Etablissement CLE",
      name: "etablissementId",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: (item: string) => {
        if (item === "N/A") return item;
        return labels[item] || "N/A - Supprimé";
      },
    },
    { title: "Pays de résidence", name: "country", parentGroup: "Général", missingLabel: "Non renseigné", translate: translate },
    { title: "Académie", name: "academy", parentGroup: "Général", missingLabel: "Non renseigné", translate: translate },
    {
      title: "Région",
      name: "region",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Département",
      name: "department",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: (e: string) => getDepartmentNumber(e) + " - " + e,
    },
    {
      title: "Note interne",
      name: "hasNotes",
      parentGroup: "Général",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Classe",
      name: "grade",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    ...(user.role === ROLES.REFERENT_DEPARTMENT
      ? [
          {
            title: "Etablissement",
            name: "schoolName",
            parentGroup: "Dossier",
            missingLabel: "Non renseigné",
            translate: translate,
          },
        ]
      : []),
    {
      title: "Situation",
      name: "situation",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Sexe",
      name: "gender",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },

    {
      title: "Bénéficiaire PPS",
      name: "ppsBeneficiary",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Bénéficiaire PAI",
      name: "paiBeneficiary",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Qpv",
      name: "qpv",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Région rurale",
      name: "isRegionRural",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },

    {
      title: "Handicap",
      name: "handicap",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Aménagement spécifique",
      name: "specificAmenagment",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Accès mobilité réduite",
      name: "reducedMobilityAccess",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Affectation dans son département",
      name: "handicapInSameDepartment",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Allergies",
      name: "allergies",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
    {
      title: "Pièce d'identité périmée",
      name: "CNIFileNotValidOnStart",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translateCniExpired,
    },
    {
      title: "PSC1",
      name: "psc1Info",
      parentGroup: "Dossier",
      missingLabel: "Non renseigné",
      translate: translate,
    },
  ];
};

export default function Inscription(): JSX.Element {
  useDocumentTitle("Inscriptions");
  const history = useHistory();
  const pageId = "inscription-list";
  const user = useSelector((state: AuthState) => state.Auth.user);
  const [young, setYoung] = useState<YoungDto | null>(null);
  const { data: labels, isPending: isLabelsPending } = useFilterLabels(pageId);
  const [isCreationListeBrevo, setIsCreationListeBrevo] = useToggle(false);

  //List state
  const [data, setData] = useState<YoungDto[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: Filter }>({});
  const [paramData, setParamData] = useState<ParamData>({
    page: 0,
    sort: { label: "Nom (A > Z)", field: "lastName.keyword", order: "asc" },
  });
  const { exportToCsv, isProcessing: isLoadingExportRecipients } = useBrevoExport("inscription");
  const [size, setSize] = useState<number>(10);

  const hasFilterSelectedOneClass = selectedFilters?.classeId?.filter?.length === 1;
  const selectedClassId = selectedFilters?.classeId?.filter?.[0];
  const { data: classe, isLoading: isClassLoading } = useClass(selectedClassId);
  const cohorts = useSelector((state: CohortState) => state.Cohorts);
  const cohort = selectedClassId ? cohorts.find((c) => c.name === classe?.cohort) : null;
  let baseInscriptionPath = hasFilterSelectedOneClass ? `/volontaire/create?classeId=${selectedClassId}` : "/volontaire/create";
  if (hasFilterSelectedOneClass && user.featureFlags?.[FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE]) {
    baseInscriptionPath = `/classes/${selectedClassId}/inscription-manuelle`;
  }
  const invitationState = selectedClassId ? canInviteYoung(user, cohort) : isCreateAuthorized({ user, resource: PERMISSION_RESOURCES.YOUNG, ignorePolicy: true });

  if (isLabelsPending) return <Loader />;

  const handleClickInscription = (): void => {
    plausibleEvent("Inscriptions/CTA - Nouvelle inscription");
    history.push(baseInscriptionPath);
  };

  const handleBrevoContactCreationList = async (formValues: BrevoListData): Promise<void> => {
    await exportToCsv(
      formValues,
      Object.entries(selectedFilters).reduce((acc, [key, value]) => {
        acc[key] = value.filter as string[];
        return acc;
      }, {} as FiltersYoungsForExport),
    );
  };

  const filterArray = getInscriptionFilterArray(user, labels || {});

  return (
    <>
      <Breadcrumbs items={[{ label: "Inscriptions" }]} />
      <div className="flex w-full flex-col px-8">
        <div className="flex items-center justify-between py-8">
          <Title>Inscriptions</Title>
          <div className="flex items-center gap-2">
            {!isClassLoading && invitationState ? (
              <Button
                onClick={handleClickInscription}
                leftIcon={<AiOutlinePlus className="h-4 w-4" />}
                className="w-full ml-2"
                title={selectedFilters?.classeId?.filter?.length === 1 ? "Nouvelle inscription CLE" : "Nouvelle inscription HTS"}
              />
            ) : null}
            {isSuperAdmin(user) ? (
              <Button type="wired" leftIcon={<HiOutlineSparkles size={20} className="mt-1" />} title="Brevo" className="ml-2" onClick={() => setIsCreationListeBrevo(true)} />
            ) : null}
            <ExportInscriptionsButton
              selectedFilters={selectedFilters}
              isAsync={!!paramData?.count && paramData?.count > MAX_EXPORT_VOLONTAIRES_SYNC}
              disabled={!!paramData?.count && paramData?.count > MAX_EXPORT_VOLONTAIRES}
            />
            {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && (
              <ExportInscriptionsScolariseButton
                user={user}
                selectedFilters={selectedFilters}
                isAsync={!!paramData?.count && paramData?.count > MAX_EXPORT_VOLONTAIRES_SYNC}
                disabled={!!paramData?.count && paramData?.count > MAX_EXPORT_VOLONTAIRES}
              />
            )}
          </div>
        </div>
        <div className="mb-8 flex flex-col rounded-xl bg-white py-4">
          <div className="flex items-stretch justify-between  bg-white px-4 pt-2">
            <Filters
              pageId={pageId}
              route="/elasticsearch/young/search"
              setData={(value: YoungDto[]) => setData(value)}
              filters={filterArray}
              searchPlaceholder="Rechercher par prénom, nom, email, ville, code postal..."
              selectedFilters={selectedFilters}
              setSelectedFilters={(filters: any) => setSelectedFilters(filters)}
              paramData={paramData}
              setParamData={setParamData}
              size={size}
              intermediateFilters={[getCohortGroups()]}
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
              <table className="mt-4 mb-2 w-full table-auto font-marianne">
                <thead>
                  <tr className="border-y-[1px] border-y-gray-100 uppercase text-gray-400 text-sm">
                    <th style={{ width: "5%" }} className="pl-4 py-3">
                      #
                    </th>
                    <th style={{ width: "35%" }} className="py-3">
                      Volontaire
                    </th>
                    <th className="text-center px-4 py-3">Cohorte</th>
                    <th className="text-center px-4 py-3">Statut</th>
                    <th style={{ width: "20%" }} className="text-center pr-4 py-3">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((hit, i) => (
                    <Hit key={hit._id} hit={hit} index={i + paramData.page * size} onClick={() => setYoung(hit)} selected={young?._id === hit._id} />
                  ))}
                </tbody>
              </table>
            }
          />
        </div>
      </div>
      {young !== null && young.status === YOUNG_STATUS.DELETED ? (
        <DeletedInscriptionPanel value={young} onChange={() => setYoung(null)} />
      ) : (
        <Panel value={young} onChange={() => setYoung(null)} />
      )}
      <ModalCreationListeBrevo
        isOpen={isCreationListeBrevo}
        onClose={() => setIsCreationListeBrevo(false)}
        onConfirm={handleBrevoContactCreationList}
        youngCountFiltered={paramData!.count!}
        isLoadingProcess={isLoadingExportRecipients}
      />
    </>
  );
}

interface HitProps {
  hit: YoungDto;
  index: number;
  onClick: () => void;
  selected: boolean;
}

const Hit: React.FC<HitProps> = ({ hit, index, onClick }) => {
  const diffMaj = dayjs(new Date(hit.updatedAt || "")).fromNow();
  const diffCreate = dayjs(new Date(hit.createdAt || "")).fromNow();

  return (
    <tr onClick={onClick} className="border-b-[1px] border-y-gray-100 hover:bg-gray-50">
      <td className="pl-4 py-3 w-[5%] tesxt-gray-900 text-base">{index + 1}</td>
      <td className="py-3 w-[35%]">
        <span className="font-bold text-gray-900 leading-6">{hit.status !== "DELETED" ? `${hit.firstName} ${hit.lastName}` : "Compte supprimé"}</span>
        {hit.updatedAt ? (
          <p className="text-sm text-gray-600 leading-5">{`Mis à jour ${diffMaj} • ${formatStringLongDate(hit.updatedAt)}`}</p>
        ) : hit.createdAt ? (
          <p className="text-sm text-gray-600 leading-5">{`Créée ${diffCreate} • ${formatStringLongDate(hit.createdAt)}`}</p>
        ) : null}
      </td>
      <td className="text-center">
        <Badge color="#3B82F6" backgroundColor="#EFF6FF" text={hit.cohort!} className={hit.status === "DELETED" ? "opacity-50" : ""} />
      </td>
      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
        <SelectStatus hit={hit} options={[]} disabled />
      </td>
      <td className="w-[20%] pr-4 py-3" onClick={(e) => e.stopPropagation()}>
        <Action hit={hit} />
      </td>
    </tr>
  );
};

function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface ActionProps {
  hit: YoungDto;
}

const Action: React.FC<ActionProps> = ({ hit }) => {
  const user = useSelector((state: AuthState) => state.Auth.user);

  const onPrendreLaPlace = async (young_id: string): Promise<void> => {
    if (!user) return toastr.error("Vous devez être connecté pour effectuer cette action.", "");

    try {
      plausibleEvent("Volontaires/CTA - Prendre sa place");
      await signinAs("young", young_id);
    } catch (e) {
      toastr.error("Une erreur s'est produite lors de la prise de place du volontaire.", "");
    }
  };

  return (
    <Listbox>
      {({ open }: { open: boolean }) => (
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
                  {/* @ts-ignore */}
                  <Listbox.Option className={"text-gray-900 relative cursor-pointer select-none list-none py-2 pl-3 pr-9 hover:text-white hover:bg-blue-600"}>
                    <span className={"block truncate font-normal text-xs"}>Consulter le profil</span>
                  </Listbox.Option>
                </Link>
                {[ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role) && hit.status !== YOUNG_STATUS.DELETED ? (
                  // @ts-ignore
                  <Listbox.Option
                    className={({ active }: { active: boolean }) =>
                      classNames(active ? "bg-blue-600 text-white" : "text-gray-900", "relative cursor-pointer select-none list-none py-2 pl-3 pr-9")
                    }
                    onClick={() => {
                      window.open(appURL, "_blank");
                      onPrendreLaPlace(hit._id!);
                    }}>
                    Prendre sa place
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
