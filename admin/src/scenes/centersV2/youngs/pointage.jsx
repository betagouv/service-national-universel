import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";

import { BiLoaderAlt } from "react-icons/bi";
import { formatDateFR, getAge, translate, COHORTS_WITH_JDM_COUNT } from "snu-lib";
import ArrowCircleRight from "../../../assets/icons/ArrowCircleRight";
import BadgeCheck from "../../../assets/icons/BadgeCheck";
import CursorClick from "../../../assets/icons/CursorClick";
import SpeakerPhone from "../../../assets/icons/SpeakerPhone";
import SelectAction from "../../../components/SelectAction";
import { Filters, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import api from "../../../services/api";
import Panel from "../../volontaires/panel";
import ModalMultiPointageDepart from "../components/modals/ModalMultiPointageDepart";
import ModalMultiPointagePresenceArrivee from "../components/modals/ModalMultiPointagePresenceArrivee";
import ModalMultiPointagePresenceJDM from "../components/modals/ModalMultiPointagePresenceJDM";
import ModalPointageDepart from "../components/modals/ModalPointageDepart";
import ModalPointagePresenceArrivee from "../components/modals/ModalPointagePresenceArrivee";
import ModalPointagePresenceJDM from "../components/modals/ModalPointagePresenceJDM";
import { captureMessage } from "../../../sentry";

export default function Pointage({ updateFilter, isYoungCheckinOpen, focusedSession, filterArray, setHasYoungValidated }) {
  const history = useHistory();
  const [young, setYoung] = useState();
  const [youngSelected, setYoungSelected] = useState([]);
  const [youngsInPage, setYoungsInPage] = useState([]);
  const checkboxRef = React.useRef();

  const [modalPointagePresenceArrivee, setModalPointagePresenceArrivee] = useState({ isOpen: false });
  const [modalMultiPointagePresenceJDM, setModalMultiPointagePresenceJDM] = useState({ isOpen: false });

  //todo
  const [modalPointageDepart, setModalPointageDepart] = useState({ isOpen: false });

  //List state
  const pageId = "pointage-list";
  const [data, setData] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [paramData, setParamData] = useState({
    page: 0,
  });
  const [size, setSize] = useState(10);

  useEffect(() => {
    updateFilter(selectedFilters);
  }, [selectedFilters]);

  useEffect(() => {
    if (!checkboxRef.current) return;
    if (youngSelected?.length === 0) {
      checkboxRef.current.checked = false;
      checkboxRef.current.indeterminate = false;
    } else if (youngSelected?.length < youngsInPage?.length) {
      checkboxRef.current.checked = false;
      checkboxRef.current.indeterminate = true;
    } else if (youngSelected?.length === youngsInPage?.length) {
      checkboxRef.current.checked = true;
      checkboxRef.current.indeterminate = false;
    }
  }, [youngSelected]);

  const handleClick = async (young) => {
    if (!young?._id) {
      captureMessage("Error with young :", { extra: { young } });
      return;
    }
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
  };

  const onClickMainCheckBox = () => {
    if (youngSelected.length === 0) {
      setYoungSelected(youngsInPage);
    } else {
      setYoungSelected([]);
    }
  };

  if (!focusedSession)
    return (
      <div className="flex h-[600px] w-full flex-col items-center">
        <span className="m-auto animate-spin">
          <BiLoaderAlt className="h-12 w-12 text-blue-600" />
        </span>
      </div>
    );

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: "1" }}>
        <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
          <div className="relative flex-1 mb-4 rounded-lg">
            <div className="mx-4 flex flex-col">
              <div className="flex w-full flex-row justify-between">
                <div className="flex items-center gap-2">
                  <Filters
                    pageId={pageId}
                    route={`/elasticsearch/young/by-session/${focusedSession._id}/search`}
                    setData={(value) => {
                      if (value) setYoungsInPage(value.map((h) => ({ _id: h._id, firstName: h.firstName, lastName: h.lastName })));
                      setData(value);
                      setHasYoungValidated(value.some((e) => e.statusPhase1 === "DONE"));
                    }}
                    filters={filterArray}
                    searchPlaceholder="Rechercher par prénom, nom, email, ville, code postal..."
                    selectedFilters={selectedFilters}
                    setSelectedFilters={setSelectedFilters}
                    paramData={paramData}
                    setParamData={setParamData}
                    size={size}
                  />
                  <div>
                    {youngSelected?.length > 0 ? (
                      <div className="text-sm font-normal text-gray-600">
                        <span className="font-bold">{youngSelected?.length}</span>&nbsp;sélectionné{youngSelected?.length > 1 ? "s" : ""}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div>
                  <SelectAction
                    Icon={<CursorClick className="text-gray-400" />}
                    title="Actions"
                    alignItems="right"
                    optionsGroup={[
                      {
                        key: "group1",
                        title: "L'arrivée au séjour",
                        items: [
                          {
                            key: "item1",
                            action: async () => {
                              if (youngSelected.length === 0) return;
                              setModalPointagePresenceArrivee({
                                isOpen: true,
                                values: youngSelected,
                                value: "true",
                                onSubmit: async () => {
                                  try {
                                    const { ok, code } = await api.post(`/young/phase1/multiaction/cohesionStayPresence`, {
                                      value: "true",
                                      ids: youngSelected.map((y) => y._id),
                                    });
                                    if (!ok) {
                                      toastr.error("Oups, une erreur s'est produite", translate(code));
                                      return;
                                    }
                                    history.go(0);
                                  } catch (e) {
                                    console.log(e);
                                    toastr.error("Oups, une erreur s'est produite", translate(e.code));
                                  }
                                },
                              });
                            },
                            render: (
                              <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                                <SpeakerPhone className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                                <div className="font-normal">
                                  Marquer <span className="font-bold">présent</span>
                                  {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                </div>
                              </div>
                            ),
                          },
                          {
                            key: "item2",
                            action: async () => {
                              if (youngSelected.length === 0) return;
                              setModalPointagePresenceArrivee({
                                isOpen: true,
                                values: youngSelected,
                                value: "false",
                                onSubmit: async () => {
                                  try {
                                    const { ok, code } = await api.post(`/young/phase1/multiaction/cohesionStayPresence`, {
                                      value: "false",
                                      ids: youngSelected.map((y) => y._id),
                                    });
                                    if (!ok) {
                                      toastr.error("Oups, une erreur s'est produite", translate(code));
                                      return;
                                    }
                                    history.go(0);
                                  } catch (e) {
                                    console.log(e);
                                    toastr.error("Oups, une erreur s'est produite", translate(e.code));
                                  }
                                },
                              });
                            },
                            render: (
                              <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                                <SpeakerPhone className="text-gray-400 group-hover:scale-105 group-hover:text-orange-600" />
                                <div>
                                  Marquer <span className="font-bold">absent</span>
                                  {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                </div>
                              </div>
                            ),
                          },
                        ],
                      },
                      COHORTS_WITH_JDM_COUNT.includes(focusedSession.cohort)
                        ? {
                            key: "group2",
                            title: "La JDM",
                            items: [
                              {
                                key: "item1",
                                action: async () => {
                                  try {
                                    if (youngSelected.length === 0) return;
                                    setModalMultiPointagePresenceJDM({
                                      isOpen: true,
                                      values: youngSelected,
                                      value: "true",
                                      onSubmit: async () => {
                                        const { ok, code } = await api.post(`/young/phase1/multiaction/presenceJDM`, { value: "true", ids: youngSelected.map((y) => y._id) });
                                        if (!ok) {
                                          toastr.error("Oups, une erreur s'est produite", translate(code));
                                          return;
                                        }
                                        history.go(0);
                                      },
                                    });
                                  } catch (e) {
                                    console.log(e);
                                    toastr.error("Oups, une erreur s'est produite", translate(e.code));
                                  }
                                },
                                render: (
                                  <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                                    <BadgeCheck className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                                    <div>
                                      Marquer <span className="font-bold">présent</span>
                                      {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                    </div>
                                  </div>
                                ),
                              },
                              {
                                key: "item2",
                                action: async () => {
                                  try {
                                    if (youngSelected.length === 0) return;
                                    setModalMultiPointagePresenceJDM({
                                      isOpen: true,
                                      values: youngSelected,
                                      value: "false",
                                      onSubmit: async () => {
                                        const { ok, code } = await api.post(`/young/phase1/multiaction/presenceJDM`, { value: "false", ids: youngSelected.map((y) => y._id) });
                                        if (!ok) {
                                          toastr.error("Oups, une erreur s'est produite", translate(code));
                                          return;
                                        }
                                        history.go(0);
                                      },
                                    });
                                  } catch (e) {
                                    console.log(e);
                                    toastr.error("Oups, une erreur s'est produite", translate(e.code));
                                  }
                                },
                                render: (
                                  <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                                    <BadgeCheck className="text-gray-400 group-hover:scale-105 group-hover:text-orange-600" />
                                    <div>
                                      Marquer <span className="font-bold">absent</span>
                                      {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                    </div>
                                  </div>
                                ),
                              },
                            ],
                          }
                        : null,
                      {
                        key: "group3",
                        items: [
                          {
                            key: "item1",
                            action: async () => {
                              if (youngSelected.length === 0) return;
                              setModalPointageDepart({
                                isOpen: true,
                                values: youngSelected,
                                value: "false",
                                onSubmit: () => {
                                  history.go(0);
                                },
                              });
                            },
                            render: (
                              <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                                <ArrowCircleRight className="text-gray-400 group-hover:scale-105 group-hover:text-orange-600" />
                                Renseigner un départ anticipé
                                {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                              </div>
                            ),
                          },
                        ],
                      },
                    ].filter((item) => item !== null)}
                  />
                </div>
              </div>
              <div className="mt-2 flex flex-row flex-wrap items-center">
                <Save selectedFilters={selectedFilters} filterArray={filterArray} page={paramData?.page} pageId={pageId} />
                <SelectedFilters
                  filterArray={filterArray}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  paramData={paramData}
                  setParamData={setParamData}
                />
              </div>
            </div>

            <ResultTable
              paramData={paramData}
              setParamData={setParamData}
              currentEntryOnPage={data?.length}
              size={size}
              setSize={setSize}
              render={
                <table className="mt-6 w-full">
                  <thead className="">
                    <tr className="border-y-[1px] border-gray-100 text-xs uppercase text-gray-400">
                      <th className="py-3 pl-4">
                        <input ref={checkboxRef} className="cursor-pointer" type="checkbox" onChange={onClickMainCheckBox} />
                      </th>
                      <th className="">Volontaire</th>
                      <th className="">Présence à l&apos;arrivée</th>
                      {COHORTS_WITH_JDM_COUNT.includes(focusedSession?.cohort) ? <th className="">Présence JDM</th> : null}
                      <th className="">Départ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((hit) => (
                      <Line
                        key={hit._id}
                        hit={hit}
                        onClick={() => handleClick(hit)}
                        opened={young?._id === hit._id}
                        onSelect={(newItem) =>
                          setYoungSelected((prev) => {
                            if (prev.find((e) => e._id.toString() === newItem._id.toString())) {
                              return prev.filter((e) => e._id.toString() !== newItem._id.toString());
                            }
                            return [...prev, { _id: newItem._id, firstName: newItem.firstName, lastName: newItem.lastName }];
                          })
                        }
                        selected={youngSelected.find((e) => e._id.toString() === hit._id.toString())}
                        isYoungCheckinOpen={isYoungCheckinOpen}
                        focusedSession={focusedSession}
                      />
                    ))}
                  </tbody>
                </table>
              }
            />
          </div>
        </div>
      </div>
      <Panel
        value={young}
        onChange={() => {
          setYoung(null);
        }}
      />
      <ModalMultiPointagePresenceJDM
        isOpen={modalMultiPointagePresenceJDM?.isOpen}
        onCancel={() => setModalMultiPointagePresenceJDM({ isOpen: false, value: null })}
        onSubmit={modalMultiPointagePresenceJDM?.onSubmit}
        values={modalMultiPointagePresenceJDM?.values}
        value={modalMultiPointagePresenceJDM?.value}
      />
      <ModalMultiPointagePresenceArrivee
        isOpen={modalPointagePresenceArrivee?.isOpen}
        onCancel={() => setModalPointagePresenceArrivee({ isOpen: false, value: null })}
        onSubmit={modalPointagePresenceArrivee?.onSubmit}
        values={modalPointagePresenceArrivee?.values}
        value={modalPointagePresenceArrivee?.value}
      />
      <ModalMultiPointageDepart
        isOpen={modalPointageDepart?.isOpen}
        onCancel={() => setModalPointageDepart({ isOpen: false, value: null })}
        onSubmit={modalPointageDepart?.onSubmit}
        values={modalPointageDepart?.values}
        value={modalPointageDepart?.value}
      />
    </div>
  );
}

const Line = ({ hit, onClick, opened, onSelect, selected, isYoungCheckinOpen, focusedSession }) => {
  const [value, setValue] = useState(null);
  const [modalPointagePresenceArrivee, setModalPointagePresenceArrivee] = useState({ isOpen: false });
  const [modalPointagePresenceJDM, setModalPointagePresenceJDM] = useState({ isOpen: false });
  const [modalPointageDepart, setModalPointageDepart] = useState({ isOpen: false });

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;

  const bgColor = selected ? "bg-blue-500" : opened ? "bg-blue-100" : "";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  const secondTextColor = selected ? "text-blue-100" : "text-[#738297]";

  const cohesionStayPresenceBgColor = value.cohesionStayPresence === "false" && "bg-gray-100";
  const cohesionStayPresenceTextColor = !value.cohesionStayPresence && "text-gray-400";

  const presenceJDMBgColor = value.presenceJDM === "false" && "bg-gray-100";
  const presenceJDMTextColor = !value.presenceJDM && "text-gray-400";

  const onSubmit = async (newValue) => {
    setValue(newValue);

    // on ferme les modales
    setModalPointagePresenceArrivee({ isOpen: false, value: null });
    setModalPointagePresenceJDM({ isOpen: false, value: null });
    setModalPointageDepart({ isOpen: false, value: null });
  };

  return (
    <>
      <tr className={`${!opened && "hover:!bg-gray-100"}`} onClick={onClick}>
        <td className={`${bgColor} ml-2 rounded-l-lg pl-4`}>
          <div onClick={(e) => e.stopPropagation()}>
            <input className="cursor-pointer" type="checkbox" checked={selected} onChange={() => onSelect(value)} />
          </div>
        </td>
        <td className={`${bgColor} py-3 `}>
          <div>
            <div className={`font-bold ${mainTextColor} text-[15px]`}>{`${hit.firstName} ${hit.lastName}`}</div>
            <div className={`text-xs font-normal ${secondTextColor}`}>
              {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
            </div>
          </div>
        </td>
        <td className={`${bgColor}`}>
          <div className="text-xs font-normal text-[#242526]" onClick={(e) => e.stopPropagation()}>
            {isYoungCheckinOpen ? (
              <select
                className={`cursor-pointer rounded-lg border-[1px] border-gray-200 py-2 px-3 text-black ${cohesionStayPresenceBgColor} ${cohesionStayPresenceTextColor}`}
                value={value.cohesionStayPresence || ""}
                onChange={(e) => {
                  setModalPointagePresenceArrivee({
                    isOpen: true,
                    value: e.target.value,
                  });
                }}
                style={{ fontFamily: "Marianne" }}>
                <option disabled label="Présence à l'arrivée">
                  Présence à l&apos;arrivée
                </option>
                {[
                  { label: "Non renseigné", value: "", disabled: true, hidden: true },
                  { label: "Présent", value: "true" },
                  { label: "Absent", value: "false" },
                ].map((option, i) => (
                  <option key={i} value={option.value} label={option.label} disabled={option.disabled} hidden={option.hidden}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="">{value.cohesionStayPresence === "true" ? "Présent" : value.cohesionStayPresence === "false" ? "Absent" : "Non renseigné"}</div>
            )}
          </div>
        </td>
        {COHORTS_WITH_JDM_COUNT.includes(focusedSession?.cohort) ? (
          <td className={`${bgColor}`}>
            <div className="text-xs font-normal text-[#242526]" onClick={(e) => e.stopPropagation()}>
              {isYoungCheckinOpen ? (
                <select
                  className={`cursor-pointer rounded-lg border-[1px] border-gray-200 py-2 px-3 text-black ${presenceJDMBgColor} ${presenceJDMTextColor} disabled:cursor-auto disabled:text-gray-500`}
                  value={value.presenceJDM || ""}
                  disabled={value.cohesionStayPresence === "false"}
                  onChange={(e) => {
                    setModalPointagePresenceJDM({
                      isOpen: true,
                      value: e.target.value,
                    });
                  }}
                  style={{ fontFamily: "Marianne" }}>
                  <option disabled label="Présence JDM">
                    Présence JDM
                  </option>
                  {[
                    { label: "Non renseigné", value: "", disabled: true, hidden: true },
                    { label: "Présent", value: "true" },
                    { label: "Absent", value: "false" },
                  ].map((option, i) => (
                    <option key={i} value={option.value} label={option.label} disabled={option.disabled} hidden={option.hidden}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="">{value.presenceJDM === "true" ? "Présent" : value.presenceJDM === "false" ? "Absent" : "Non renseigné"}</div>
              )}
            </div>
          </td>
        ) : null}
        <td className={`${bgColor} mr-2 rounded-r-lg`}>
          <div className={`text-xs font-normal  ${mainTextColor}`} onClick={(e) => e.stopPropagation()}>
            <div
              className="group flex cursor-pointer items-center gap-1"
              onClick={(e) => {
                if (isYoungCheckinOpen) {
                  setModalPointageDepart({
                    isOpen: true,
                    value: e.target.value,
                  });
                }
              }}>
              <ArrowCircleRight className="text-gray-400 group-hover:scale-105" />
              <div className={isYoungCheckinOpen ? "group-hover:underline" : ""}>
                {!value.departSejourAt ? "Renseigner un départ anticipé" : formatDateFR(value.departSejourAt)}
              </div>
            </div>
          </div>
        </td>
      </tr>
      <ModalPointagePresenceArrivee
        isOpen={modalPointagePresenceArrivee?.isOpen}
        onCancel={() => setModalPointagePresenceArrivee({ isOpen: false, value: null })}
        onSubmit={onSubmit}
        value={modalPointagePresenceArrivee?.value}
        young={value}
      />
      <ModalPointagePresenceJDM
        isOpen={modalPointagePresenceJDM?.isOpen}
        onCancel={() => setModalPointagePresenceJDM({ isOpen: false, value: null })}
        onSubmit={onSubmit}
        value={modalPointagePresenceJDM?.value}
        young={value}
      />
      <ModalPointageDepart
        isOpen={modalPointageDepart?.isOpen}
        onCancel={() => setModalPointageDepart({ isOpen: false, value: null })}
        onSubmit={onSubmit}
        value={modalPointageDepart?.value}
        young={value}
      />
    </>
  );
};
