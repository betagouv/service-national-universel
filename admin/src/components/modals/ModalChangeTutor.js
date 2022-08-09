import React, { useEffect, useReducer, useState } from "react";
import { Modal } from "reactstrap";
import { translate } from "../../utils";

import { ReactiveBase } from "@appbaseio/reactivesearch";
import { toastr } from "react-redux-toastr";
import { formatStringDateTimezoneUTC } from "snu-lib/date";
import CloseSvg from "../../assets/Close";
import CheckCircle from "../../assets/icons/CheckCircle";
import { apiURL } from "../../config";
import api from "../../services/api";
import ModalButton from "../buttons/ModalButton";
import { ResultTable } from "../list";
import ReactiveListComponent from "../ReactiveListComponent";
import CursorClick from "../../assets/icons/CursorClick";

import ReactSelect, { components } from "react-select";
import ModalConfirm from "./ModalConfirm";

export default function ModalChangeTutor({ isOpen, tutor, onChange, onCancel, onConfirm, size = "xl", cancelText = "Annuler" }) {
  if (!tutor) return null;

  // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const [responsables, setResponsables] = useState([]);
  const [missionsSelected, setMissionsSelected] = useState([]);
  const [missionsInPage, setMissionsInPage] = useState([]);
  const [sending, setSending] = useState(false);

  const checkboxRef = React.useRef();

  useEffect(() => {
    (async () => {
      const { responses } = await api.esQuery("referent", {
        query: {
          bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": tutor.structureId } }] },
        },
      });
      if (responses.length) {
        setResponsables(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })).filter((e) => e._id.toString() !== tutor._id.toString()));
      }
    })();
  }, []);

  useEffect(() => {
    if (!checkboxRef.current) return;
    if (missionsSelected?.length === 0) {
      checkboxRef.current.checked = false;
      checkboxRef.current.indeterminate = false;
    } else if (missionsSelected?.length < missionsInPage?.length) {
      checkboxRef.current.checked = false;
      checkboxRef.current.indeterminate = true;
    } else if (missionsSelected?.length === missionsInPage?.length) {
      checkboxRef.current.checked = true;
      checkboxRef.current.indeterminate = false;
    }
  }, [missionsSelected]);

  const onSubmit = async () => {
    setSending(true);
    await onConfirm();
    setSending(false);
  };

  const getDefaultQuery = () => ({
    query: {
      bool: {
        must_not: {
          term: { dummy: ignored }, // * Used to force a re-render of the component
        },
        filter: { term: { "tutorId.keyword": tutor._id.toString() } },
      },
    },
    track_total_hits: true,
  });

  const onClickMainCheckBox = () => {
    if (missionsSelected.length === 0) {
      setMissionsSelected(missionsInPage);
    } else {
      setMissionsSelected([]);
    }
  };

  const responsablesOptions = responsables.map((e) => ({ label: e.firstName + " " + e.lastName, value: e._id.toString() }));

  return (
    <Modal size={size} centered isOpen={isOpen} toggle={onCancel || onChange}>
      <div className="flex justify-center items-center flex-col rounded-2xl overflow-hidden pt-8">
        <CloseSvg className="absolute right-0 top-0 m-4 cursor-pointer text-gray-500" height={10} width={10} onClick={onCancel || onChange} />
        <div className="mx-6">
          <div className="flex items-center justify-center text-gray-900 text-xl text-center mb-3">Nommer un nouveau tuteur</div>
          <div className="flex flex-col items-center justify-center text-gray-500 text-sm font-normal text-center mb-3">
            <div>
              {tutor.firstName} {tutor.lastName} est tuteur/tutrice sur une ou plusieurs missions.
            </div>
            <div>Afin de supprimer son compte, veuillez rattacher cette/ces missions à un nouveau tuteur.</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center text-center px-8 w-full ">
          <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div style={{ display: "flex", alignItems: "flex-start", width: "100%", height: "100%" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <ResultTable>
                  <ReactiveListComponent
                    defaultQuery={getDefaultQuery}
                    dataField="name.keyword"
                    sortBy="asc"
                    pagination={true}
                    paginationAt="bottom"
                    showTopResultStats={false}
                    pageSize={50}
                    onData={async ({ rawData }) => {
                      if (rawData?.hits?.hits) setMissionsInPage(rawData.hits.hits.map((h) => ({ _id: h._id, name: h._source.name })));
                    }}
                    render={({ data }) => {
                      if (data.length === 0) return null;

                      return (
                        <>
                          <Header
                            missionsSelected={missionsSelected}
                            setMissionsSelected={setMissionsSelected}
                            responsablesOptions={responsablesOptions}
                            forceUpdate={forceUpdate}
                          />
                          <Table
                            data={data}
                            checkboxRef={checkboxRef}
                            onClickMainCheckBox={onClickMainCheckBox}
                            responsablesOptions={responsablesOptions}
                            missionsSelected={missionsSelected}
                            setMissionsSelected={setMissionsSelected}
                            forceUpdate={forceUpdate}
                          />
                        </>
                      );
                    }}
                    renderNoResults={() => {
                      return (
                        <div className="flex gap-2 justify-center items-center ">
                          <CheckCircle className="w-10 h-10 text-green-600" />
                          <h1 className="text-center text-gray-600 font-normal">Toutes les missions ont bien été redistribuées</h1>
                        </div>
                      );
                    }}
                  />
                </ResultTable>
              </div>
            </div>
          </ReactiveBase>
        </div>
        <div className="flex gap-2 justify-center mb-4">
          <ModalButton disabled={sending} onClick={onCancel || onChange}>
            {cancelText}
          </ModalButton>
          <ModalButton loading={sending} disabled={sending || missionsInPage.length} onClick={onSubmit} primary>
            Confirmer la suppression de ce compte
          </ModalButton>
        </div>
      </div>
    </Modal>
  );
}

const Header = ({ missionsSelected, setMissionsSelected, responsablesOptions, forceUpdate }) => {
  const [modalConfirmationReattributionTutor, setModalConfirmationReattributionTutor] = useState({ isOpen: false });
  const [loading, setLoading] = useState(false);

  // Change la manière de rendu de l'option une fois sélectionnée
  const SingleValue = (props) => (
    <components.SingleValue {...props}>
      <div className="flex items-center gap-2">
        <CursorClick className="text-gray-400" />
        {loading ? <span className={`font-medium text-sm text-gray-400`}>Chargement...</span> : <span className={`font-medium text-sm text-gray-400`}>Actions groupée</span>}
      </div>
    </components.SingleValue>
  );

  return (
    <div className="flex justify-between mb-2">
      <div className="flex items-center mb-2 gap-2">
        <div>
          <div className="text-gray-600 font-normal text-sm">
            <span className="font-bold">{missionsSelected?.length}</span> &nbsp;sélectionné{missionsSelected?.length > 1 ? "s" : ""}
          </div>
        </div>
      </div>
      <ReactSelect
        className="min-w-[200px] text-sm"
        options={responsablesOptions}
        placeholder={
          <div className="flex items-center gap-2">
            <CursorClick className="text-gray-400" />
            {loading ? <span className={`font-medium text-sm text-gray-400`}>Chargement...</span> : <span className={`font-medium text-sm text-gray-400`}>Actions groupée</span>}
          </div>
        }
        isDisabled={missionsSelected.length === 0}
        noOptionsMessage={() => "Pas de tuteur trouvé"}
        components={{ SingleValue }}
        onChange={(newValue) => {
          setLoading(true);
          const value = newValue.value;
          const label = newValue.label;
          setModalConfirmationReattributionTutor({
            isOpen: true,
            label: label,
            onSubmit: async () => {
              const { ok, code } = await api.post(`/mission/multiaction/change-tutor`, {
                ids: missionsSelected.map((m) => m._id),
                tutorId: value,
                tutorName: label,
              });
              if (!ok) {
                toastr.error("Oups, une erreur s'est produite", translate(code));
                return;
              }

              setModalConfirmationReattributionTutor({
                isOpen: false,
              });
              setMissionsSelected([]);
              setLoading(false);
              forceUpdate();
            },
          });
        }}
      />
      <ModalConfirm
        isOpen={modalConfirmationReattributionTutor.isOpen}
        title={`Réattribution de plusieurs missions`}
        message={`Veuillez confirmer la réattribution à ${modalConfirmationReattributionTutor.label}.`}
        onChange={() => {
          setModalConfirmationReattributionTutor({ isOpen: false, onConfirm: null });
          setLoading(false);
        }}
        onConfirm={modalConfirmationReattributionTutor?.onSubmit}
      />
    </div>
  );
};

function Table({ data, checkboxRef, onClickMainCheckBox, responsablesOptions, missionsSelected, setMissionsSelected, forceUpdate }) {
  return (
    <table className="w-full">
      <thead className="">
        <tr className="text-xs uppercase text-gray-400 border-y-[1px] border-gray-10">
          <th className="py-3 px-4">
            <input ref={checkboxRef} className="cursor-pointer m-auto" type="checkbox" onChange={onClickMainCheckBox} />
          </th>
          <th className="py-3 pl-2 text-left">Mission</th>
          <th className="py-3 pl-2 text-left">Date</th>
          <th className="py-3 pl-2 text-left">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((hit) => (
          <Line
            key={hit._id}
            hit={hit}
            opened={false}
            responsablesOptions={responsablesOptions}
            onSelect={(newItem) =>
              setMissionsSelected((prev) => {
                if (prev.find((e) => e._id.toString() === newItem._id.toString())) {
                  return prev.filter((e) => e._id.toString() !== newItem._id.toString());
                }

                return [
                  ...prev,
                  {
                    _id: newItem._id,
                    name: newItem.name,
                  },
                ];
              })
            }
            onChange={() => {
              setMissionsSelected((prev) => {
                return prev.filter((e) => e._id.toString() !== hit._id.toString());
              });
              forceUpdate();
            }}
            selected={missionsSelected.find((e) => e._id.toString() === hit._id.toString())}
          />
        ))}
      </tbody>
    </table>
  );
}

const Line = ({ hit, opened, onSelect, onChange, selected, responsablesOptions }) => {
  const [modalConfirmationReattributionTutor, setModalConfirmationReattributionTutor] = useState({ isOpen: false });

  const value = hit;

  if (!value) return <></>;

  const bgColor = selected ? "bg-blue-500" : opened ? "bg-blue-100" : "";
  const mainTextColor = selected ? "text-white" : "text-[#242526]";
  const secondTextColor = selected ? "text-blue-100" : "text-[#738297]";

  const onSubmit = async (id, name) => {
    const { ok, code } = await api.put(`/mission/${hit._id}`, { ...hit, tutorId: id, tutorName: name });
    if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));

    await onChange();
    setModalConfirmationReattributionTutor({ isOpen: false });
  };

  return (
    <tr className={`${!opened && "hover:!bg-gray-100"}`}>
      <td className={`${bgColor} px-4 rounded-l-lg`}>
        <div onClick={(e) => e.stopPropagation()}>
          <input className="cursor-pointer m-auto" type="checkbox" checked={selected} onChange={() => onSelect(value)} />
        </div>
      </td>
      <td className={`${bgColor} py-3 text-left`}>
        <div>
          <div className={`font-bold ${mainTextColor} text-[15px]`}>{`${hit.name}`}</div>
          <div className={`font-normal text-xs ${secondTextColor}`}>{`${hit.structureName}`}</div>
          <div className={`font-normal text-xs ${secondTextColor}`}>{`${hit.city || ""} • (${hit.department || ""})`}</div>
        </div>
      </td>
      <td className={`${bgColor} py-3 text-left`}>
        <div>
          <span className={"text-[#cbd5e0] mr-1"}>Du</span> {formatStringDateTimezoneUTC(hit.startAt)}
        </div>
        <div>
          <span className={"text-[#cbd5e0] mr-1"}>Au</span> {formatStringDateTimezoneUTC(hit.endAt)}
        </div>
      </td>
      <td className={`${bgColor} rounded-r-lg text-left`}>
        <div className="font-normal text-xs text-[#242526]" onClick={(e) => e.stopPropagation()}>
          <ReactSelect
            className="text-sm w-[260px]"
            options={responsablesOptions}
            placeholder="Choisissez un nouveau tuteur"
            noOptionsMessage={() => "Pas de tuteur trouvé"}
            onChange={(newValue) => {
              setModalConfirmationReattributionTutor({
                isOpen: true,
                label: newValue.label,
                value: newValue.value,
              });
            }}
          />
        </div>
      </td>
      <ModalConfirm
        isOpen={modalConfirmationReattributionTutor.isOpen}
        title={`Réattribution de la mission ${hit.name}`}
        message={`Veuillez confirmer la réattribution à ${modalConfirmationReattributionTutor.label}.`}
        onChange={() => setModalConfirmationReattributionTutor({ isOpen: false, onConfirm: null })}
        onConfirm={() => onSubmit(modalConfirmationReattributionTutor.value, modalConfirmationReattributionTutor.label)}
      />
    </tr>
  );
};
