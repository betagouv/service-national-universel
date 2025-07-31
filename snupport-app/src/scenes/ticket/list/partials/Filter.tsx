import React from "react";
import { HiXCircle } from "react-icons/hi";
import DropdownTags from "./DropdownTags";
import DropdownContactGroup from "./dropdownFilters/DropdownContactGroup";
import DropdownContactDepartment from "./dropdownFilters/DropdownContactDepartment";
import DropdownContactCohort from "./dropdownFilters/DropdownContactCohort";
import DropdownSources from "./dropdownFilters/DropdownSources";
import DropdownAgent from "./dropdownFilters/DropdownAgent";
import DropdownLastActivityDate from "./dropdownFilters/DropdownLastActivityDate";
import AutoCompleteContact from "./AutoCompleteContact";
import DropdownParcours from "./dropdownFilters/DropdownParcours";
import DropdownCreationDate from "./dropdownFilters/DropDownCreationDate";

type FilterProps = {
  filter: Record<string, any>;
  setFilter: (filter: Record<string, any>) => void;
  agents: any;
  cohortList?: string[];
};

export default function Filter({ filter, setFilter, agents, cohortList = [] }: FilterProps) {
  const onReset = () => {
    setFilter({
      page: 1,
      status: "",
      sources: [],
      agent: [],
      agentId: "",
      contactId: "",
      folderId: "",
      sorting: "",
      ticketId: "",
      tag: [],
      contactGroup: [],
      size: 30,
      contactDepartment: [],
      contactCohort: [],
      parcours: [],
      creationDate: {
        from: "",
        to: "",
      },
      lastActivityDate: { from: "", to: "" },
    });
  };
  return (
    <div>
      <div className=" flex items-start gap-3 pr-[30px] pl-6">
        <DropdownContactGroup name="Emetteur" selectedContactGroup={filter.contactGroup} setSelectedContactGroup={(contactGroup) => setFilter({ ...filter, contactGroup })} />
        <DropdownSources name="Source" selectedSources={filter.sources} setSelectedSources={(sources) => setFilter({ ...filter, sources })} />
        <DropdownAgent name="Agent" selectedAgent={filter.agent} setSelectedAgent={(agent) => setFilter({ ...filter, agent })} agents={agents} />
        <DropdownContactDepartment
          name="Departement"
          selectedContactDepartment={filter.contactDepartment}
          setSelectedContactDepartment={(contactDepartment) => setFilter({ ...filter, contactDepartment })}
          status={filter.status}
        />
        <DropdownContactCohort
          name="Cohorte"
          selectedContactCohort={filter.contactCohort}
          setSelectedContactCohort={(contactCohort) => setFilter({ ...filter, contactCohort })}
          cohortList={cohortList}
        />
        <DropdownParcours name="Parcours" selectedParcours={filter.parcours} setSelectedParcours={(parcours) => setFilter({ ...filter, parcours })} />
        <AutoCompleteContact value={filter.contactId} onChange={(contactId) => setFilter({ ...filter, contactId })} />
        <DropdownTags selectedTags={filter.tag || []} filter={filter} onChange={(tag) => setFilter({ ...filter, tag })} />
        <div className="flex">
          <HiXCircle className="mt-[9px] cursor-pointer text-xl text-red-700" onClick={onReset} />
        </div>
      </div>
      <div className="flex items-start gap-3 pr-[30px] pl-6 mt-2">
        <DropdownCreationDate
          name="Date de création"
          selectedCreationDate={filter.creationDate}
          setSelectedCreationDate={(creationDate) => {
            setFilter({
              ...filter,
              creationDate: {
                from: creationDate?.from ? creationDate.from.toISOString() : "",
                to: creationDate?.to ? creationDate.to.toISOString() : "",
              },
            });
          }}
        />
        <DropdownLastActivityDate
          name="Dernière activité"
          selectedLastActivityDate={filter.lastActivityDate}
          setSelectedLastActivityDate={(lastActivityDate) => {
            setFilter({
              ...filter,
              lastActivityDate: {
                from: lastActivityDate?.from ? lastActivityDate.from.toISOString() : "",
                to: lastActivityDate?.to ? lastActivityDate.to.toISOString() : "",
              },
            });
          }}
        />
      </div>
    </div>
  );
}
