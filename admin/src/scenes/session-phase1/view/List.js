import React, { useState, useEffect } from "react";
import { translate, copyToClipboard, YOUNG_STATUS_COLORS, formatPhoneNumberFR, translatePhase1, YOUNG_STATUS_PHASE1 } from "../../../utils";
import Badge from "../../../components/Badge";
import FilterSvg from "../../../assets/icons/Filter";

import { FaBus } from "react-icons/fa";
import { BiCopy, BiWalk } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import Select from "./Select";

export default function List({ data }) {
  const [currentTab, setCurrentTab] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [filter, setFilter] = useState();
  const [activeStatus, setActiveStatus] = useState([]);
  const [activeMeetingPoint, setActiveMeetingPoint] = useState([]);

  function updateFilter(n) {
    setFilter({ ...filter, ...n });
  }

  useEffect(() => {
    if (Object.keys(data).length) {
      setCurrentTab(Object.keys(data)[0]);
      console.log("here");
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
    <>
      <div className="m-12 w-full">
        <div className="font-bold text-2xl mb-4">Volontaires</div>
        <div className=" flex flex-1 flex-col lg:flex-row ">
          <nav className="flex flex-1 gap-1">
            {viewData
              ? Object.keys(data).map((bus) => (
                  <div
                    onClick={() => {
                      setCurrentTab(bus);
                      setFilter({ search: "", status: "", meetingPoint: "" });
                    }}
                    className={`text-[13px] px-3 py-2 cursor-pointer text-gray-600 rounded-t-lg bg-gray-50 border-t-[1px] border-r-[1px] border-l-[1px] border-gray-200 hover:text-snu-purple-800 ${
                      currentTab === bus && "!text-snu-purple-800 bg-white border-none"
                    }`}>
                    <div className="flex items-center gap-2">
                      {bus === "noMeetingPoint" ? (
                        <>
                          <BiWalk /> Autonome(s)
                        </>
                      ) : (
                        <>
                          <FaBus /> {bus}
                        </>
                      )}
                    </div>
                  </div>
                ))
              : null}
          </nav>
        </div>
        <div className="p-3 bg-white rounded-lg">
          {/* filter */}
          <div className="flex flex-row m-3 items-center gap-x-4">
            <div className="flex rounded-lg border-[1px] border-gray-300 w-1/3 overflow-hidden">
              <input
                type="text"
                name="search"
                value={filter?.search || ""}
                className="border-none p-2 w-full"
                placeholder="Rechercher par prénom, nom, email, ville ..."
                onChange={(e) => updateFilter({ [e.target.name]: e.target.value })}
              />
            </div>
            <Select
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
            <Select
              Icon={<FilterSvg className="text-gray-400" />}
              value={filter?.meetingPoint || ""}
              onChange={(e) => updateFilter({ meetingPoint: e })}
              placeholder="Filtrer par point de rassemblement"
              alignItems="left"
              options={activeMeetingPoint}
            />
          </div>
          <table className="w-full bg-white">
            <thead className="">
              <tr className="text-xs uppercase text-gray-400 border-y-[1px] border-gray-100 ">
                <th className="py-3 pl-4 font-normal">Volontaire</th>
                <th className="font-normal">
                  Email du <br /> volontaire
                </th>
                <th className="font-normal">
                  Téléphone du <br /> volontaire
                </th>
                <th className="font-normal">
                  Représentants <br /> légaux
                </th>
                <th className="font-normal">
                  Email des <br />
                  représentants
                </th>
                <th className="font-normal">
                  Téléphone des <br />
                  représentants
                </th>
                <th className="font-normal">Statut phase 1</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">{viewData ? viewData.youngs.map((hit) => <Line hit={hit} />) : null}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const Line = ({ hit }) => {
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

  return (
    <tr className="hover:!bg-gray-100" o>
      <td className="py-3 pl-4 ml-2 rounded-l-lg">
        <div>
          <div className="font-bold text-[15px]">{`${hit.firstName} ${hit.lastName}`}</div>
          <div className="font-normal text-xs text-[#738297]">{`${hit.city || ""} (${hit.department || ""})`}</div>
        </div>
      </td>
      <td>
        <div className="flex my-2 px-2 items-center">
          <div className="pr-2 flex-row text-gray-700 text-xs">{hit.email.length > 17 ? `${hit.email.substring(0, 17)} ...` : hit.email}</div>
          <div
            className="flex items-center justify-center cursor-pointer hover:scale-105"
            onClick={() => {
              copyToClipboard(hit.email);
              setCopied(true);
            }}>
            {copied ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
          </div>
        </div>
      </td>
      <td>
        <div className="font-normal text-xs">{formatPhoneNumberFR(hit.phone)}</div>
      </td>
      <td>
        <div>
          <div className="font-normal text-xs ">{`${hit.parent1FirstName} ${hit.parent1LastName} ${hit?.parent1Status ? "(" + translate(hit.parent1Status) + ")" : ""}`}</div>
          {parent2 ? <div className="font-normal text-xs ">{`${hit.parent2FirstName} ${hit.parent2LastName} (${translate(hit.parent2Status)})`}</div> : null}
        </div>
      </td>
      <td>
        <div>
          <div className="flex my-2 px-2 items-center">
            <div className="pr-2 flex-row text-gray-700 text-xs ">{hit.parent1Email.length > 17 ? `${hit.parent1Email.substring(0, 17)} ...` : hit.parent1Email}</div>
            <div
              className="flex items-center justify-center cursor-pointer hover:scale-105"
              onClick={() => {
                copyToClipboard(hit.parent1Email);
                setCopied1(true);
              }}>
              {copied1 ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
            </div>
          </div>
          {parent2 ? (
            <div className="flex my-2 px-2 items-center">
              <div className="pr-2 flex-row text-gray-700 text-xs">{hit.parent2Email.length > 17 ? `${hit.parent2Email.substring(0, 17)} ...` : hit.parent2Email}</div>
              <div
                className="flex items-center justify-center cursor-pointer hover:scale-105"
                onClick={() => {
                  copyToClipboard(hit.parent2Email);
                  setCopied2(true);
                }}>
                {copied2 ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
              </div>
            </div>
          ) : null}
        </div>
      </td>
      <td>
        <div>
          <div className="font-normal text-xs ">{formatPhoneNumberFR(hit.parent1Phone)}</div>
          {parent2 ? <div className="font-normal text-xs ">{formatPhoneNumberFR(hit.parent2Phone)}</div> : null}
        </div>
      </td>
      <td className="rounded-r-lg">
        <div>
          <Badge text={translate(hit.statusPhase1)} color={YOUNG_STATUS_COLORS[hit.statusPhase1]} />
        </div>
      </td>
    </tr>
  );
};
