import React, { useEffect, useState } from "react";
import { GroupBox, GroupHeader, Loading } from "../../components/commons";
import { GROUPSTEPS } from "../../util";
import api from "../../../../services/api";
import { capture } from "../../../../sentry";
import { PlainButton } from "../../components/Buttons";

export default function GroupGatheringPlacesOld({ group, className = "", onChangeStep, onChange }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selection, setSelection] = useState(group.gatheringPlaces);
  const [pdrLines, setPdrLines] = useState([]);

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    setPdrLines(
      list.map((pdr) => (
        <div key={pdr._id} className="group border-t border-t-gray-200 p-4 hover:bg-gray-200 flex items-center cursor-pointer" onClick={() => toggleSelection(pdr)}>
          <input type="checkbox" checked={isSelected(pdr)} />
          <div className="grow ml-4">
            <div className="text-base text-[#242526] font-bold pb-2.5">{pdr.name}</div>
            <div className="text-xs text-[#738297]">
              {pdr.department} • {pdr.code}
            </div>
          </div>
        </div>
      )),
    );
  }, [selection, list]);

  async function loadList() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.get(`/schema-de-repartition/pdr/${group.fromDepartment}/${group.cohort}`);
      if (result.ok) {
        setList(result.data);
      } else {
        setError("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
      }
    } catch (err) {
      capture(err);
      setError("Impossible de récupérer la liste des points de rassemblement. Veuillez essayer dans quelques instants.");
    }
    setLoading(false);
  }

  function toggleSelection(pdr) {
    const index = selection.findIndex((gp) => {
      return gp === pdr._id;
    });

    const newSelection = [...selection];
    if (index >= 0) {
      newSelection.splice(index, 1);
    } else {
      newSelection.push(pdr._id);
    }
    setSelection(newSelection);
  }

  function isSelected(pdr) {
    return (
      selection.findIndex((gp) => {
        return gp === pdr._id;
      }) >= 0
    );
  }

  function validate() {
    onChange(
      {
        ...group,
        gatheringPlaces: selection,
      },
      GROUPSTEPS.AFFECTATION_SUMMARY,
    );
  }

  return (
    <GroupBox className={`flex flex-col ${className}`}>
      <GroupHeader onBack={() => onChangeStep(GROUPSTEPS.CENTER)}>Choisissez les lieux de rassemblements</GroupHeader>
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="text-[#DC5318]">{error}</div>
      ) : (
        <div className="grow flex flex-col">
          <div className="grow">{pdrLines}</div>
          <div className="flex justify-end">
            <PlainButton onClick={validate}>Continuer</PlainButton>
          </div>
        </div>
      )}
    </GroupBox>
  );
}
