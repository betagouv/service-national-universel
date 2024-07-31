import React, { useEffect, useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { toastr } from "react-redux-toastr";
import CursorClick from "../../../assets/icons/CursorClick";
import ShieldCheck from "../../../assets/icons/ShieldCheck";
import SelectAction from "../../../components/SelectAction";
import { Filters, ResultTable, Save, SelectedFilters } from "../../../components/filters-system-v2";
import api from "../../../services/api";
import { getAge, translate } from "snu-lib";
import Panel from "../../volontaires/panel";
import ModalMultiPointageFicheSanitaire from "../components/modals/ModalMultiPointageFicheSanitaire";
import ModalPointageFicheSanitaire from "../components/modals/ModalPointageFicheSanitaire";
import { captureMessage } from "../../../sentry";

export default function FicheSanitaire({ updateFilter, focusedSession, filterArray, setHasYoungValidated }) {
  const [young, setYoung] = useState();
  const [youngSelected, setYoungSelected] = useState([]);
  const [youngsInPage, setYoungsInPage] = useState([]);
  const checkboxRef = React.useRef();

  const [modalPointageFicheSanitaire, setModalPointageFicheSanitaire] = useState({ isOpen: false });

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

  const onClickMainCheckBox = () => {
    if (youngSelected.length === 0) {
      setYoungSelected(youngsInPage);
    } else {
      setYoungSelected([]);
    }
  };

  const handleClick = async (young) => {
    if (!young?._id) {
      captureMessage("Error with young :", { extra: { young } });
      return;
    }
    const { ok, data } = await api.get(`/referent/young/${young._id}`);
    if (ok) setYoung(data);
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
                        key: "sanitaire",
                        title: "Fiche sanitaire",
                        items: [
                          {
                            key: "ok",
                            action: async () => {
                              if (youngSelected.length === 0) return;
                              setModalPointageFicheSanitaire({
                                isOpen: true,
                                values: youngSelected,
                                value: "true",
                                onSubmit: async () => {
                                  const { ok, code } = await api.post(`/young/phase1/multiaction/cohesionStayMedicalFileReceived`, {
                                    value: "true",
                                    ids: youngSelected.map((y) => y._id),
                                  });
                                  if (!ok) {
                                    toastr.error("Oups, une erreur s'est produite", translate(code));
                                    return;
                                  }
                                  history.go(0);
                                },
                              });
                            },
                            render: (
                              <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                                <ShieldCheck className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                                <div>
                                  Marquer <span className="font-bold">renseignée</span>
                                  {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                </div>
                              </div>
                            ),
                          },
                          {
                            key: "nok",
                            action: async () => {
                              if (youngSelected.length === 0) return;
                              setModalPointageFicheSanitaire({
                                isOpen: true,
                                values: youngSelected,
                                value: "false",
                                onSubmit: async () => {
                                  const { ok, code } = await api.post(`/young/phase1/multiaction/cohesionStayMedicalFileReceived`, {
                                    value: "false",
                                    ids: youngSelected.map((y) => y._id),
                                  });
                                  if (!ok) {
                                    toastr.error("Oups, une erreur s'est produite", translate(code));
                                    return;
                                  }
                                  history.go(0);
                                },
                              });
                            },
                            render: (
                              <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
                                <ShieldCheck className="text-gray-400 group-hover:scale-105 group-hover:text-orange-600" />
                                <div>
                                  Marquer <span className="font-bold">non renseignée</span>
                                  {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                </div>
                              </div>
                            ),
                          },
                        ],
                      },
                    ]}
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
                      <th className="py-3 pl-4">Volontaire</th>
                      <th className="">Fiche Sanitaire</th>
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
      <ModalMultiPointageFicheSanitaire
        isOpen={modalPointageFicheSanitaire?.isOpen}
        onCancel={() => setModalPointageFicheSanitaire({ isOpen: false, value: null })}
        onSubmit={modalPointageFicheSanitaire?.onSubmit}
        values={modalPointageFicheSanitaire?.values}
        value={modalPointageFicheSanitaire?.value}
      />
    </div>
  );
}

const Line = ({ hit, onClick, opened, onSelect, selected }) => {
  const [value, setValue] = useState(null);
  const [modalPointageFicheSanitaire, setModalPointageFicheSanitaire] = useState({ isOpen: false });

  useEffect(() => {
    setValue(hit);
  }, [hit._id]);

  if (!value) return <></>;

  const bgColor = selected ? "bg-blue-500" : opened ? "bg-blue-100" : "";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  const secondTextColor = selected ? "text-blue-100" : "text-[#738297]";

  const ficheSanitaireBgColor = value.cohesionStayMedicalFileReceived === "false" && "bg-gray-100";
  const ficheSanitaireTextColor = !value.cohesionStayMedicalFileReceived && "text-gray-400";

  const onSubmit = async (newValue) => {
    setValue(newValue);

    // on ferme la modale
    setModalPointageFicheSanitaire({ isOpen: false, value: null });
  };

  return (
    <>
      <tr className={`${!opened && "hover:!bg-gray-100"}`} onClick={onClick}>
        <td className={`${bgColor} ml-2 rounded-l-lg pl-4`}>
          <div onClick={(e) => e.stopPropagation()}>
            <input className="cursor-pointer" type="checkbox" checked={selected} onChange={() => onSelect(value)} />
          </div>
        </td>
        <td className={`${bgColor} py-3`}>
          <div>
            <div className={`font-bold ${mainTextColor} text-[15px]`}>{`${hit.firstName} ${hit.lastName}`}</div>
            <div className={`text-xs font-normal ${secondTextColor}`}>
              {hit.birthdateAt ? `${getAge(hit.birthdateAt)} ans` : null} {`• ${hit.city || ""} (${hit.department || ""})`}
            </div>
          </div>
        </td>
        <td className={`${bgColor} rounded-r-lg`}>
          <div className="text-xs font-normal text-[#242526]" onClick={(e) => e.stopPropagation()}>
            <select
              className={`cursor-pointer rounded-lg border-[1px] border-gray-200 py-2 px-3 text-black ${ficheSanitaireBgColor} ${ficheSanitaireTextColor}`}
              value={value.cohesionStayMedicalFileReceived || ""}
              onChange={(e) => {
                setModalPointageFicheSanitaire({
                  isOpen: true,
                  value: e.target.value,
                });
              }}
              style={{ fontFamily: "Marianne" }}>
              <option disabled label="Fiche sanitaire">
                Présence à l&apos;arrivée
              </option>
              {[
                { label: "Non renseignée", value: "", disabled: true, hidden: true },
                { label: "Réceptionnée", value: "true" },
                { label: "Non réceptionnée", value: "false" },
              ].map((option, i) => (
                <option key={i} value={option.value} label={option.label} disabled={option.disabled} hidden={option.hidden}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </td>
      </tr>
      <ModalPointageFicheSanitaire
        isOpen={modalPointageFicheSanitaire?.isOpen}
        onCancel={() => setModalPointageFicheSanitaire({ isOpen: false, value: null })}
        onSubmit={onSubmit}
        value={modalPointageFicheSanitaire?.value}
        young={value}
      />
    </>
  );
};
