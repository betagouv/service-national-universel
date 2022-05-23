import React, { useEffect, useState } from "react";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import FilterSvg from "../../../assets/icons/Filter";
import { copyToClipboard, formatPhoneNumberFR, translate, translatePhase1, YOUNG_STATUS_COLORS } from "../../../utils";
import Select from "../components/Select";
import SelectFilter from "../components/SelectFilter";
import Badge from "../../../components/Badge";
import ChevronDown from "../../../assets/icons/ChevronDown";
import Phone from "../../../assets/icons/Phone";

export default function MobileList({ data }) {
  const [currentTab, setCurrentTab] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [filter, setFilter] = useState();
  const [activeStatus, setActiveStatus] = useState([]);
  const [activeMeetingPoint, setActiveMeetingPoint] = useState([]);
  const [volontaire, setVolontaire] = useState(null);

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  useEffect(() => {
    if (Object.keys(data).length) {
      setCurrentTab(Object.keys(data)[0]);
    }
  }, [data]);

  useEffect(() => {
    if (currentTab) {
      setViewData(data[currentTab]);
      let status = [];
      data[currentTab].youngs.forEach((y) => {
        if (y.statusPhase1 && !status.includes(y.statusPhase1)) {
          status.push(y.statusPhase1);
        }
      });
      setActiveStatus(status);

      setActiveMeetingPoint(
        data[currentTab].meetingPoint.map((meet) => {
          return {
            value: meet._id,
            label: [meet?.departureAddress, meet?.departureZip, meet?.departureCity, meet?.departureDepartment].filter((e) => e).join(", "),
          };
        }),
      );
    }
  }, [currentTab]);

  useEffect(() => {
    if (data[currentTab]) {
      let youngs = data[currentTab].youngs
        .filter((e) => {
          if (!filter?.search) return true;
          return Object.values(e).some((f) => {
            return f.toString().toLowerCase().replaceAll(" ", "").includes(filter.search.toLowerCase().replaceAll(" ", ""));
          });
        })
        .filter((e) => !filter?.status || e.statusPhase1 === filter?.status)
        .filter((e) => !filter?.meetingPoint || e.meetingPointId === filter?.meetingPoint);
      setViewData({ ...viewData, youngs });
    }
  }, [filter]);

  return (
    <div className="w-full">
      <div className="hidden border-[#FE7B52] border-[#FEB951] border-[#6CC763] border-[#F8A9AD] border-[#382F79] border-[#d7d7d7] border-[#FE7B52] border-[#382F79] border-[#FEB951] border-[#FEB951] border-[#FE7B52] border-[#FE7B52] border-[#FE7B52] border-[#6CC763] border-[#BE3B12] border-[#ffa987] border-[#d7d7d7] border-[#BE3B12]" />
      <div className="flex flex-row !justify-between items-center mx-2 my-6">
        <div className="font-bold text-2xl">Volontaires</div>
        <Select
          alignItems="right"
          onChange={(bus) => {
            setCurrentTab(bus);
            setFilter({ search: "", status: "", meetingPoint: "" });
          }}
          value={currentTab}
          options={
            viewData
              ? Object.keys(data).map((bus) => {
                  return {
                    value: bus,
                  };
                })
              : []
          }
        />
      </div>
      <div className=" bg-white rounded-lg p-3">
        {/* filter */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex rounded-lg border-[1px] border-gray-300 w-full overflow-hidden">
            <input
              type="text"
              name="search"
              value={filter?.search || ""}
              className="border-none p-2 w-full"
              placeholder="Rechercher par prénom, nom, email, ville ..."
              onChange={(e) => updateFilter({ [e.target.name]: e.target.value })}
            />
          </div>
          <SelectFilter
            Icon={<FilterSvg className="text-gray-400" />}
            value={filter?.status || ""}
            onChange={(e) => updateFilter({ status: e })}
            placeholder="Filtrer par status"
            alignItems="left"
            options={activeStatus.map((s) => {
              return {
                label: translatePhase1(s),
                value: s,
              };
            })}
          />
          {currentTab !== "noMeetingPoint" ? (
            <SelectFilter
              Icon={<FilterSvg className="text-gray-400" />}
              value={filter?.meetingPoint || ""}
              onChange={(e) => updateFilter({ meetingPoint: e })}
              placeholder="Filtrer par point de rassemblement"
              alignItems="left"
              options={activeMeetingPoint}
            />
          ) : null}
        </div>
      </div>
      <div className="bg-white">
        {viewData
          ? viewData.youngs.map((hit) => (
              <Line key={hit._id} hit={hit} onClick={() => setVolontaire(volontaire?._id === hit._id ? null : hit)} selected={volontaire?._id === hit._id} />
            ))
          : null}
        <hr className="text-gray-100" />
      </div>
    </div>
  );
}

const Line = ({ hit, onClick, selected }) => {
  const [copied, setCopied] = React.useState(false);
  const [copied1, setCopied1] = React.useState(false);
  const [copied2, setCopied2] = React.useState(false);
  const parent2 = hit.parent2FirstName && hit.parent2LastName && hit.parent2Status && hit.parent2Email && hit.parent2Phone;

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
    if (copied1) {
      setTimeout(() => setCopied1(false), 3000);
    }
    if (copied2) {
      setTimeout(() => setCopied2(false), 3000);
    }
  }, [copied, copied1, copied2]);

  const getClassName = () => {
    let res = "border-l-2 pl-2";
    let color = "border-[" + YOUNG_STATUS_COLORS[hit.statusPhase1] + "]";
    return res + " " + color;
  };

  return (
    <>
      <hr className="text-gray-100" />
      <div className="mx-4 py-4">
        <div className="flex  items-center justify-between" onClick={onClick}>
          <div className={getClassName()}>
            <div className="font-bold text-[15px]">{`${hit.firstName} ${hit.lastName}`}</div>
            <div className="font-normal text-xs text-[#738297]">{`${hit.city || ""} (${hit.department || ""})`}</div>
          </div>
          {selected ? <ChevronDown className="text-gray-400 rotate-180" /> : <ChevronDown className="text-gray-400" />}
        </div>
        {selected ? (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex flex-row items-center justify-between">
              <div
                className="flex my-2 px-2 items-center"
                onClick={() => {
                  copyToClipboard(hit.email);
                  setCopied(true);
                }}>
                <div className="flex items-center justify-center cursor-pointer hover:scale-105">
                  {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
                </div>
                <div className="pl-2 flex-row text-gray-700 text-xs">{hit.email.length > 17 ? `${hit.email.substring(0, 17)} ...` : hit.email}</div>
              </div>
              {hit.phone ? (
                <div className="flex item-center gap-2">
                  <Phone className="text-gray-400" />
                  <div className="font-normal text-xs">{formatPhoneNumberFR(hit.phone)}</div>
                </div>
              ) : null}
            </div>
            <div className="font-bold text-sm">{`${hit.parent1FirstName} ${hit.parent1LastName} ${hit?.parent1Status ? "(" + translate(hit.parent1Status) + ")" : ""}`}</div>
            <div className="flex flex-row items-center justify-between">
              <div
                className="flex my-2 px-2 items-center"
                onClick={() => {
                  copyToClipboard(hit.parent1Email);
                  setCopied1(true);
                }}>
                <div className="flex items-center justify-center cursor-pointer hover:scale-105">
                  {copied1 ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
                </div>
                <div className="pl-2 flex-row text-gray-700 text-xs">{hit.parent1Email.length > 17 ? `${hit.parent1Email.substring(0, 17)} ...` : hit.parent1Email}</div>
              </div>
              {hit.parent1Phone ? (
                <div className="flex item-center gap-2">
                  <Phone className="text-gray-400" />
                  <div className="font-normal text-xs">{formatPhoneNumberFR(hit.parent1Phone)}</div>
                </div>
              ) : null}
            </div>
            {parent2 ? (
              <>
                <div className="font-bold text-sm">{`${hit.parent2FirstName} ${hit.parent2LastName} ${hit?.parent2Status ? "(" + translate(hit.parent2Status) + ")" : ""}`}</div>
                <div className="flex flex-row items-center justify-between">
                  <div
                    className="flex my-2 px-2 items-center"
                    onClick={() => {
                      copyToClipboard(hit.parent2Email);
                      setCopied2(true);
                    }}>
                    <div className="flex items-center justify-center cursor-pointer hover:scale-105">
                      {copied2 ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
                    </div>
                    <div className="pl-2 flex-row text-gray-700 text-xs">{hit.parent2Email.length > 17 ? `${hit.parent2Email.substring(0, 17)} ...` : hit.parent2Email}</div>
                  </div>
                  {hit.parent2Phone ? (
                    <div className="flex item-center gap-2">
                      <Phone className="text-gray-400" />
                      <div className="font-normal text-xs">{formatPhoneNumberFR(hit.parent2Phone)}</div>
                    </div>
                  ) : null}
                </div>
              </>
            ) : null}
            <div className="flex justify-center">
              <Badge text={translate(hit.statusPhase1)} color={YOUNG_STATUS_COLORS[hit.statusPhase1]} />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};
