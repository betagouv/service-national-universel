import React, { useState, useEffect } from "react";
import { translate, YOUNG_STATUS_COLORS, formatPhoneNumberFR, translatePhase1 } from "snu-lib";
import { copyToClipboard } from "../../../utils";
import Badge from "../../../components/Badge";
import FilterSvg from "../../../assets/icons/Filter";

import { FaBus } from "react-icons/fa";
import { BiCopy, BiWalk } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";
import Select from "../components/SelectFilter";

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
            label: [meet?.address, meet?.zip, meet?.city, meet?.department].filter((e) => e).join(", "),
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
            return f?.toString().toLowerCase().replaceAll(" ", "").includes(filter?.search.toLowerCase().replaceAll(" ", ""));
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
        <div className="mb-4 text-2xl font-bold">Volontaires</div>
        <div className=" flex flex-1 flex-col lg:flex-row ">
          <nav className="flex flex-1 gap-1">
            {viewData
              ? Object.keys(data).map((bus) => (
                  <div
                    key={bus}
                    onClick={() => {
                      setCurrentTab(bus);
                      setFilter({ search: "", status: "", meetingPoint: "" });
                    }}
                    className={`cursor-pointer rounded-t-lg border-t-[1px] border-r-[1px] border-l-[1px] border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-600 hover:text-snu-purple-800 ${
                      currentTab === bus && "border-none bg-white !text-snu-purple-800"
                    }`}>
                    <div className="flex items-center gap-2">
                      {bus === "noMeetingPoint" ? (
                        <>
                          <BiWalk /> Autonome(s)<span className="text-xs">({data[bus]?.youngs?.length})</span>
                        </>
                      ) : (
                        <>
                          <FaBus /> {bus === "transportInfoGivenByLocal" ? "Services locaux" : bus}
                          <span className="text-xs">({data[bus]?.youngs?.length})</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              : null}
          </nav>
        </div>
        <div className="rounded-lg bg-white p-3">
          {/* filter */}
          <div className="m-3 flex flex-row items-center gap-x-4">
            <div className="flex w-1/3 overflow-hidden rounded-lg border-[1px] border-gray-300">
              <input
                type="text"
                name="search"
                value={filter?.search || ""}
                className="w-full border-none p-2"
                placeholder="Rechercher par prénom, nom, email, ville ..."
                onChange={(e) => updateFilter({ [e.target.name]: e.target.value })}
              />
            </div>
            <Select
              Icon={<FilterSvg className="text-gray-400" />}
              value={filter?.status || ""}
              onChange={(e) => updateFilter({ status: e })}
              placeholder="Filtrer par statut"
              alignItems="left"
              options={activeStatus.map((s) => {
                return {
                  label: translatePhase1(s),
                  value: s,
                };
              })}
            />
            {currentTab !== "noMeetingPoint" && currentTab !== "transportInfoGivenByLocal" ? (
              <Select
                Icon={<FilterSvg className="text-gray-400" />}
                value={filter?.meetingPoint || ""}
                onChange={(e) => updateFilter({ meetingPoint: e })}
                placeholder="Filtrer par point de rassemblement"
                alignItems="left"
                options={activeMeetingPoint}
              />
            ) : null}
          </div>
          <table className="w-full bg-white">
            <thead className="">
              <tr className="border-y-[1px] border-gray-100 text-xs uppercase text-gray-400 ">
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
            <tbody className="divide-y divide-gray-100">{viewData ? viewData.youngs.map((hit) => <Line key={`${hit.firstName} ${hit.lastName}`} hit={hit} />) : null}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}

const Line = ({ hit }) => {
  const [copiedElements, setCopiedElements] = React.useState({});
  const parent2 = hit.parent2FirstName && hit.parent2LastName && hit.parent2Status && hit.parent2Email && hit.parent2Phone;

  useEffect(() => {
    if (Object.values(copiedElements).some((e) => e)) {
      setTimeout(() => setCopiedElements({}), 3000);
    }
  }, [copiedElements]);

  return (
    <tr className="hover:!bg-gray-100">
      <td className="ml-2 rounded-l-lg py-3 pl-4">
        <div>
          <div className="text-[15px] font-bold">{`${hit.firstName} ${hit.lastName}`}</div>
          <div className="text-xs font-normal text-[#738297]">{`${hit.city || ""} (${hit.department || ""})`}</div>
        </div>
      </td>
      <td>
        <div className="my-2 flex items-center px-2">
          <div className="flex-row pr-2 text-xs text-gray-700">{hit.email.length > 17 ? `${hit.email.substring(0, 17)} ...` : hit.email}</div>
          <div
            className="flex cursor-pointer items-center justify-center hover:scale-105"
            onClick={() => {
              copyToClipboard(hit.email);
              setCopiedElements((prev) => ({ ...prev, email: true }));
            }}>
            {copiedElements?.email ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
          </div>
        </div>
      </td>
      <td>
        {hit.phone ? (
          <div className="flex items-center gap-1">
            <div className="flex items-center text-xs font-normal">{formatPhoneNumberFR(hit.phone)}</div>
            <div
              className="flex cursor-pointer items-center justify-center hover:scale-105"
              onClick={() => {
                copyToClipboard(hit.phone);
                setCopiedElements((prev) => ({ ...prev, phone: true }));
              }}>
              {copiedElements?.phone ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
            </div>
          </div>
        ) : null}
      </td>
      <td>
        <div>
          <div className="text-xs font-normal ">{`${hit.parent1FirstName} ${hit.parent1LastName} ${hit?.parent1Status ? "(" + translate(hit.parent1Status) + ")" : ""}`}</div>
          {parent2 ? <div className="text-xs font-normal ">{`${hit.parent2FirstName} ${hit.parent2LastName} (${translate(hit.parent2Status)})`}</div> : null}
        </div>
      </td>
      <td>
        <div>
          <div className="my-2 flex items-center px-2">
            <div className="flex-row pr-2 text-xs text-gray-700 ">{hit?.parent1Email?.length > 17 ? `${hit?.parent1Email?.substring(0, 17)} ...` : hit.parent1Email}</div>
            <div
              className="flex cursor-pointer items-center justify-center hover:scale-105"
              onClick={() => {
                copyToClipboard(hit.parent1Email);
                setCopiedElements((prev) => ({ ...prev, parent1Email: true }));
              }}>
              {copiedElements?.parent1Email ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
            </div>
          </div>
          {parent2 ? (
            <div className="my-2 flex items-center px-2">
              <div className="flex-row pr-2 text-xs text-gray-700">{hit.parent2Email.length > 17 ? `${hit.parent2Email.substring(0, 17)} ...` : hit.parent2Email}</div>
              <div
                className="flex cursor-pointer items-center justify-center hover:scale-105"
                onClick={() => {
                  copyToClipboard(hit.parent2Email);
                  setCopiedElements((prev) => ({ ...prev, parent2Email: true }));
                }}>
                {copiedElements?.parent2Email ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
              </div>
            </div>
          ) : null}
        </div>
      </td>
      <td>
        <div>
          <div className="flex items-center gap-1">
            <div className="text-xs font-normal ">{formatPhoneNumberFR(hit.parent1Phone)}</div>
            <div
              className="flex cursor-pointer items-center justify-center hover:scale-105"
              onClick={() => {
                copyToClipboard(hit.parent1Phone);
                setCopiedElements((prev) => ({ ...prev, parent1Phone: true }));
              }}>
              {copiedElements?.parent1Phone ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
            </div>
          </div>
          {parent2 ? (
            <div className="flex items-center gap-1">
              <div className="text-xs font-normal ">{formatPhoneNumberFR(hit.parent2Phone)}</div>
              <div
                className="flex cursor-pointer items-center justify-center hover:scale-105"
                onClick={() => {
                  copyToClipboard(hit.parent2Phone);
                  setCopiedElements((prev) => ({ ...prev, parent2Phone: true }));
                }}>
                {copiedElements?.parent2Phone ? <HiCheckCircle className="text-green-500" /> : <BiCopy className="text-gray-400" />}
              </div>
            </div>
          ) : null}
        </div>
      </td>
      <td className="rounded-r-lg">
        <div>
          <Badge text={translatePhase1(hit.statusPhase1)} color={YOUNG_STATUS_COLORS[hit.statusPhase1]} />
        </div>
      </td>
    </tr>
  );
};
