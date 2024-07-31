import React from "react";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";

import { translate } from "snu-lib";
import Eye from "../../../assets/icons/Eye";
import Bin from "../../../assets/Bin";
import Plus from "../../../assets/icons/Plus";
import Chevron from "../../../components/Chevron";
import Field from "../../phase0/components/Field";
import CustomSelect from "./CustomSelect";
import { MODE_EDITION } from "../utils";

export const Session = ({ session, className, onClickView, mode, onDelete, onCohortChange }) => {
  const isEditionMode = mode === MODE_EDITION;
  return (
    <div className={`flex items-center justify-between border-b border-gray-200 py-4 ${className}`}>
      <div className="flex flex-col items-start">
        <div className="mb-2 font-bold">{session?.center?.name}</div>
        {!isEditionMode && <CohortBadge>{session.cohort}</CohortBadge>}
        {isEditionMode && (
          <CohortSelect
            value={session.cohort}
            options={session.cohorts.map(({ cohort }) => cohort)}
            onChange={(value) => {
              const newSession = session.cohorts.find(({ cohort }) => cohort === value).sessionPhase1Id;
              onCohortChange(newSession);
            }}
          />
        )}
      </div>
      <div className="flex gap-3">
        {onClickView && (
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:shadow-[0_1px_5px_rgba(0,0,0,0.16)]" onClick={onClickView}>
            <Eye className="h-[15px] w-[15px]" />
          </button>
        )}
        {isEditionMode && (
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:shadow-[0_1px_5px_rgba(0,0,0,0.16)]" onClick={onDelete}>
            <Bin className="h-[14px] w-[14px]" />
          </button>
        )}
      </div>
    </div>
  );
};

export const CohortSelect = ({ value, options, onChange, disabled, placeholder = "Choisir un séjour", className = "" }) => {
  if (disabled || options.length === 1) {
    return <CohortBadge className={className}>{value}</CohortBadge>;
  }
  return (
    <UncontrolledDropdown setActiveFromChild className={`flex flex-col ${className}`}>
      <DropdownToggle tag="div">
        <CohortBadge className="cursor-pointer">
          <div className="flex items-center justify-between">
            <span>{value || placeholder}</span>
            <Chevron color="#0C7CFF" className="p-0" />
          </div>
        </CohortBadge>
      </DropdownToggle>
      <DropdownMenu className="min-w-full p-0">
        {options.map((cohort) => {
          return (
            <DropdownItem
              key={cohort}
              className="dropdown-item px-3 py-2 text-sm"
              onClick={() => {
                onChange(cohort);
              }}>
              {cohort}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export const CohortBadge = ({ children, className }) => {
  return (
    <div className={`flex items-center justify-center rounded-full border-[0.5px] border-[#66A7F4] bg-[#F9FCFF] p-1.5 px-4 text-xs text-[#0C7CFF] ${className}`}>{children}</div>
  );
};

export const AddButton = ({ children, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-end rounded-md border border-gray-300 py-2  px-7 font-medium text-gray-700 hover:shadow-[0_1px_5px_rgba(0,0,0,0.16)] ${className}`}>
      <Plus className="mr-2 text-blue-600" />
      {children}
    </button>
  );
};

export const SubRoleAndRegionOrDep = ({ mode, subRole, onSubRoleChange, subRoleOptions, regionOrDepOptions, onRegionOrDepChange, regionOrDep, isRegion }) => (
  <>
    <Field
      className="mt-4"
      mode={mode}
      name="subRole"
      value={subRole}
      onChange={onSubRoleChange}
      label="Fonction"
      options={subRoleOptions}
      type="select"
      transformer={(value) => translate(value)}
    />
    {!isRegion && (
      <CustomSelect
        className="mt-4"
        label="Département"
        readOnly={mode !== MODE_EDITION}
        isMulti
        options={regionOrDepOptions}
        placeholder={"Rechercher un département..."}
        onChange={onRegionOrDepChange}
        value={regionOrDep}
      />
    )}
    {isRegion && (
      <Field
        className="mt-4"
        mode={mode}
        name="region"
        value={regionOrDep}
        onChange={onRegionOrDepChange}
        label="Région"
        options={regionOrDepOptions}
        type="select"
        transformer={(value) => translate(value)}
      />
    )}
  </>
);
