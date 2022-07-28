import React, { useEffect, useState } from "react";
import { Modal } from "reactstrap";
import { colors } from "../../utils";

import { ModalContainer, Content, Footer } from "./Modal";
import ModalButton from "../buttons/ModalButton";
import CloseSvg from "../../assets/Close";
import styled from "styled-components";
import { ReactiveBase } from "@appbaseio/reactivesearch";
import { apiURL } from "../../config";
import api from "../../services/api";
import { ResultTable } from "../list";
import ReactiveListComponent from "../ReactiveListComponent";
import { formatStringDateTimezoneUTC } from "snu-lib/date";

export default function ModalChangeTutor({ isOpen, onChange, onCancel, onConfirm, size = "xl", disableConfirm = false, confirmText = "Confirmer", cancelText = "Annuler" }) {
  const [tutor, setTutor] = useState(null);
  const [responsables, setResponsables] = useState([]);
  const [missionsSelected, setMissionsSelected] = useState([]);
  const [missionsInPage, setMissionsInPage] = useState([]);
  const [sending, setSending] = useState(false);

  const checkboxRef = React.useRef();

  // ! TO DELETE
  useEffect(async () => {
    const { ok, data, code } = await api.get(`/referent/6266bd6595468507c5c1b7ad`);
    if (!ok) return console.log(`Error: ${code}`);
    setTutor(data);

    const { responses } = await api.esQuery("referent", {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": data.structureId } }] } },
    });
    if (responses.length) {
      setResponsables(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    }
  }, []);

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

  if (!tutor) return null;
  console.log("🚀 ~ file: ModalChangeTutor.js ~ line 41 ~ tutor", tutor);
  console.log("🚀 ~ file: ModalChangeTutor.js ~ line 18 ~ ModalChangeTutor ~ responsables", responsables);
  console.log("🚀 ~ file: ModalChangeTutor.js ~ line 20 ~ ModalChangeTutor ~ missionsSelected", missionsSelected);

  const onSubmit = async () => {
    setSending(true);

    // Will retry to delete
    await onConfirm();
    setSending(false);
  };

  const getDefaultQuery = () => ({ query: { bool: { filter: { term: { "structureId.keyword": tutor.structureId } } } }, track_total_hits: true });

  const onClickMainCheckBox = () => {
    if (missionsSelected.length === 0) {
      setMissionsSelected(missionsInPage);
    } else {
      setMissionsSelected([]);
    }
  };

  return (
    <Modal size={size} centered isOpen={isOpen} toggle={onCancel || onChange}>
      <ModalContainer className="pb-0">
        <CloseSvg className="close-icon" height={10} width={10} onClick={onCancel || onChange} />
        <div className="mx-6">
          <div className="flex items-center justify-center text-gray-900 text-xl text-center mb-3">Nommer un nouveau tuteur</div>
          <div className="flex flex-col items-center justify-center text-gray-500 text-sm font-normal text-center mb-3">
            <div>
              {tutor.firstName} {tutor.lastName} est tuteur/tutrice sur une ou plusieurs missions.
            </div>
            <div>Afin de supprimer son compte, veuillez rattacher cette/ces missions à un nouveau tuteur.</div>
          </div>
        </div>
        <Content>
          <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
              <div style={{ flex: 1, position: "relative" }}>
                {/* <Filter2>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center mb-2 gap-2">
                      <DataSearch
                        defaultQuery={getDefaultQuery}
                        showIcon={false}
                        placeholder="Rechercher par prénom, nom, email, ville, code postal..."
                        componentId="SEARCH"
                        dataField={["email.keyword", "firstName.folded", "lastName.folded", "city.folded", "zip"]}
                        react={{ and: FILTERS.filter((e) => e !== "SEARCH") }}
                        // fuzziness={2}
                        innerClass={{ input: "searchbox" }}
                        autosuggest={false}
                        queryFormat="and"
                        onValueChange={(e) => updateFilter({ SEARCH: e })}
                      />
                      <div
                        className="flex gap-2 items-center px-3 py-2 rounded-lg bg-gray-100 text-[14px] font-medium text-gray-700 cursor-pointer hover:underline"
                        onClick={() => setFilterVisible((e) => !e)}>
                        <FilterSvg className="text-gray-400" />
                        Filtres
                      </div>
                      <div>
                        {youngSelected?.length > 0 ? (
                          <div className="text-gray-600 font-normal text-sm">
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
                            title: "Fiche sanitaire",
                            items: [
                              {
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
                                  <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <ShieldCheck className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
                                    <div>
                                      Marquer <span className="font-bold">renseignée</span>
                                      {youngSelected.length > 0 ? ` (${youngSelected.length})` : ""}
                                    </div>
                                  </div>
                                ),
                              },
                              {
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
                                  <div className="group flex items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50 cursor-pointer">
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
                  <FilterRow visible={filterVisible}>
                    <div className="uppercase text-xs text-snu-purple-800">Général</div>
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="STATUS"
                      dataField="status.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "STATUS") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Statut")}
                      onValueChange={(e) => updateFilter({ STATUS: e })}
                      defaultValue={[YOUNG_STATUS.VALIDATED]}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="STATUS_PHASE_1"
                      dataField="statusPhase1.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "STATUS_PHASE_1") }}
                      renderItem={(e, count) => {
                        return `${translatePhase1(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Statut phase 1", "Statut phase 1")}
                      onValueChange={(e) => updateFilter({ STATUS_PHASE_1: e })}
                    />
                    <RegionFilter defaultQuery={getDefaultQuery} filters={FILTERS} onValueChange={(e) => updateFilter({ REGION: e })} />
                    <DepartmentFilter defaultQuery={getDefaultQuery} filters={FILTERS} onValueChange={(e) => updateFilter({ DEPARTMENT: e })} />
                  </FilterRow>
                  <FilterRow visible={filterVisible}>
                    <div className="uppercase text-xs text-snu-purple-800">Dossier</div>
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="Sexe"
                      componentId="SEXE"
                      dataField="gender.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "SEXE") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Sexe", "Sexe")}
                      onValueChange={(e) => updateFilter({ SEXE: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="Classe"
                      componentId="GRADE"
                      dataField="grade.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "GRADE") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Classe", "Classe")}
                      onValueChange={(e) => updateFilter({ GRADE: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="HANDICAP"
                      componentId="HANDICAP"
                      dataField="handicap.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "HANDICAP") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Handicap", "Handicap")}
                      onValueChange={(e) => updateFilter({ HANDICAP: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="PPS"
                      componentId="PPS"
                      dataField="ppsBeneficiary.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "PPS") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "PPS", "PPS")}
                      onValueChange={(e) => updateFilter({ PPS: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="PAI"
                      componentId="PAI"
                      dataField="paiBeneficiary.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "PAI") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "PAI", "PAI")}
                      onValueChange={(e) => updateFilter({ PAI: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="QPV"
                      componentId="QPV"
                      dataField="qpv.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "QPV") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "QPV", "QPV")}
                      onValueChange={(e) => updateFilter({ QPV: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder=""
                      componentId="ALLERGIES"
                      dataField="allergies.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "ALLERGIES") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Allergies ou intolérances", "Allergies ou intolérances")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ ALLERGIES: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="Aménagement spécifique"
                      componentId="SPECIFIC_AMENAGEMENT"
                      dataField="specificAmenagment.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "SPECIFIC_AMENAGEMENT") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Aménagement spécifique", "Aménagement spécifique")}
                      onValueChange={(e) => updateFilter({ SPECIFIC_AMENAGEMENT: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="PMR"
                      componentId="PMR"
                      dataField="reducedMobilityAccess.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "PMR") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Aménagement PMR", "Aménagement PMR")}
                      onValueChange={(e) => updateFilter({ PMR: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="MEDICAL_FILE_RECEIVED"
                      dataField="cohesionStayMedicalFileReceived.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "MEDICAL_FILE_RECEIVED") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Fiches sanitaires", "Fiches sanitaires")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ MEDICAL_FILE_RECEIVED: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="Droit à l'image"
                      componentId="IMAGE_RIGHT"
                      dataField="imageRight.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "IMAGE_RIGHT") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Droit à l'image", "Droit à l'image")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ IMAGE_RIGHT: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      placeholder="Utilisation d’autotest"
                      componentId="AUTOTEST"
                      dataField="autoTestPCR.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "AUTOTEST") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      renderLabel={(items) => getFilterLabel(items, "Utilisation d’autotest", "Utilisation d’autotest")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ AUTOTEST: e })}
                    />
                  </FilterRow>
                  <FilterRow visible={filterVisible}>
                    <div className="uppercase text-xs text-snu-purple-800">Pointage</div>
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="COHESION_PRESENCE"
                      dataField="cohesionStayPresence.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "COHESION_PRESENCE") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Présence à l'arrivée")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ COHESION_PRESENCE: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="COHESION_JDM"
                      dataField="presenceJDM.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "COHESION_JDM") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Présence à la JDM")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ COHESION_JDM: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="DEPART"
                      dataField="departInform.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "DEPART") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Départ renseigné")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ DEPART: e })}
                    />
                    <MultiDropdownList
                      defaultQuery={getDefaultQuery}
                      className="dropdown-filter"
                      componentId="DEPART_MOTIF"
                      dataField="departSejourMotif.keyword"
                      react={{ and: FILTERS.filter((e) => e !== "DEPART_MOTIF") }}
                      renderItem={(e, count) => {
                        return `${translate(e)} (${count})`;
                      }}
                      title=""
                      URLParams={true}
                      showSearch={false}
                      renderLabel={(items) => getFilterLabel(items, "Motif du départ")}
                      showMissing
                      missingLabel="Non renseigné"
                      onValueChange={(e) => updateFilter({ DEPART_MOTIF: e })}
                    />
                  </FilterRow>
                </Filter2> */}
                <ResultTable>
                  <ReactiveListComponent
                    defaultQuery={getDefaultQuery}
                    // react={{ and: FILTERS }}
                    dataField="name.keyword"
                    sortBy="asc"
                    paginationAt="bottom"
                    showTopResultStats={false}
                    pageSize={10}
                    onData={async ({ rawData }) => {
                      if (rawData?.hits?.hits) setMissionsInPage(rawData.hits.hits.map((h) => ({ _id: h._id, name: h._source.name })));
                    }}
                    render={({ data }) => (
                      <table className="w-full">
                        <thead className="">
                          <tr className="text-xs uppercase text-gray-400 border-y-[1px] border-gray-100">
                            <th className="py-3 pl-4">
                              <input ref={checkboxRef} className="cursor-pointer" type="checkbox" onChange={onClickMainCheckBox} />
                            </th>
                            <th className="py-3 pl-4">Mission</th>
                            <th className="py-3 pl-4">Date</th>
                            <th className="">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data.map((hit) => (
                            <Line
                              key={hit._id}
                              hit={hit}
                              opened={false}
                              responsables={responsables}
                              onSelect={(newItem) =>
                                setMissionsSelected((prev) => {
                                  if (prev.find((e) => e._id.toString() === newItem._id.toString())) {
                                    return prev.filter((e) => e._id.toString() !== newItem._id.toString());
                                  }
                                  return [...prev, { _id: newItem._id, name: newItem.name }];
                                })
                              }
                              selected={missionsSelected.find((e) => e._id.toString() === hit._id.toString())}
                            />
                          ))}
                        </tbody>
                      </table>
                    )}
                  />
                </ResultTable>
              </div>
            </div>
          </ReactiveBase>
        </Content>
        <Footer>
          <ModalButton disabled={sending} onClick={onCancel || onChange}>
            {cancelText}
          </ModalButton>
          <ModalButton loading={sending} disabled={sending || disableConfirm} onClick={onSubmit} primary>
            {confirmText}
          </ModalButton>
        </Footer>
      </ModalContainer>
    </Modal>
  );
}

// const Footer = styled.div`
//   background-color: #f3f3f3;
//   width: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 1rem;
//   input {
//     text-align: center;
//     min-width: 40%;
//     max-width: 40%;
//     border: 1px solid ${colors.grey};
//     border-radius: 10px;
//     padding: 7px 30px;
//   }
//   > * {
//     margin: 0.3rem 0;
//   }
//   p {
//     color: ${colors.grey};
//     font-size: 0.8rem;
//     font-weight: 400;
//     :hover {
//       cursor: pointer;
//       text-decoration: underline;
//     }
//   }
// `;

const Line = ({ hit, opened, onSelect, onChange, selected, responsables }) => {
  const value = hit;

  if (!value) return <></>;

  const bgColor = selected ? "bg-blue-500" : opened ? "bg-blue-100" : "";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  const secondTextColor = selected ? "text-blue-100" : "text-[#738297]";

  const onSubmit = async (newValue) => {
    setValue(newValue);
  };

  const responsablesOptions = responsables.map((e) => ({ label: `${e.name} ${e.lastName}`, value: e._id }));

  return (
    <>
      <tr className={`${!opened && "hover:!bg-gray-100"}`}>
        <td className={`${bgColor} pl-4 ml-2 py-3 rounded-l-lg`}>
          <div onClick={(e) => e.stopPropagation()}>
            <input className="cursor-pointer" type="checkbox" checked={selected} onChange={() => onSelect(value)} />
          </div>
        </td>
        <td className={`${bgColor} py-3`}>
          <div>
            <div className={`font-bold ${mainTextColor} text-[15px]`}>{`${hit.name}`}</div>
            <div className={`font-normal text-xs ${secondTextColor}`}>{`${hit.structureName}`}</div>
            <div className={`font-normal text-xs ${secondTextColor}`}>{`${hit.city || ""} • (${hit.department || ""})`}</div>
          </div>
        </td>
        <td className={`${bgColor} py-3`}>
          <div>
            <span style={{ color: "#cbd5e0", marginRight: 5 }}>Du</span> {formatStringDateTimezoneUTC(hit.startAt)}
          </div>
          <div>
            <span style={{ color: "#cbd5e0", marginRight: 5 }}>Au</span> {formatStringDateTimezoneUTC(hit.endAt)}
          </div>
        </td>
        <td className={`${bgColor} rounded-r-lg`}>
          <div className="font-normal text-xs text-[#242526]" onClick={(e) => e.stopPropagation()}>
            <select
              className={`border-[1px] border-gray-200 rounded-lg text-black py-2 px-3 cursor-pointer`}
              value={value.cohesionStayMedicalFileReceived || ""}
              onChange={(e) => {
                const value = e.target.value;
                // handleChange({ target: { name: keys.city, value } });
              }}
              style={{ fontFamily: "Marianne" }}>
              {responsablesOptions.map((option, i) => (
                <option key={i} value={option.value} label={option.label} disabled={option.disabled} hidden={option.hidden}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </td>
      </tr>
    </>
  );
};
