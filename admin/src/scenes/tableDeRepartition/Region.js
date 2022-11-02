import React from "react";
import { useParams } from "react-router-dom";
import { region2department, regionList } from "snu-lib";
import api from "../../services/api";
import { FiChevronDown } from "react-icons/fi";

export default function tableDeRepartition() {
  const { region, cohort } = useParams();
  const [selected, setSelected] = React.useState({});
  const getTable = async () => {
    const { ok, data } = await api.get(`/table-de-repartition/from-region/${region}/cohort/${cohort}`);
    if (ok) {
      let update = {};
      data.map((item) => {
        if (update[item.toRegion]) {
          if (update[item.toRegion].includes(item.toDepartment)) {
            update[item.toRegion] = update[region].filter((e) => e !== item.toDepartment);
          } else {
            update[item.toRegion].push(item.toDepartment);
          }
        } else {
          update[item.toRegion] = [item.toDepartment];
        }
      });
      setSelected(update);
    }
  };

  React.useEffect(() => {
    getTable();
  }, []);

  const onSelected = (region, departement) => {
    let update = { ...selected };
    if (update[region]) {
      if (update[region].includes(departement)) {
        update[region] = update[region].filter((e) => e !== departement);
      } else {
        update[region].push(departement);
      }
    } else {
      update[region] = [departement];
    }
    setSelected(update);
  };

  const onSelectRegion = (region) => {
    let update = { ...selected };
    if (update[region]) {
      delete update[region];
    } else {
      update[region] = [];
    }
    setSelected(update);
  };

  const onSubmit = async () => {
    selected.fromRegion = region;
    selected.cohort = cohort;
    const { ok, data } = await api.post(`/table-de-repartition`, selected);
    //use data to refresh the table
    console.log(ok, data);
  };

  return (
    <div className="flex flex-col w-full p-4 ">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold ">Répartition des régions d’accueil - {region}</div>
      </div>
      <div className="flex flex-col bg-white rounded-xl">
        <div className="flex items-center justify-end gap-4 px-6 py-4">
          <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:!text-blue-600 hover:bg-white">Exporter</button>
          <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:!text-blue-600 hover:bg-white" onClick={onSubmit}>
            Enregistrer
          </button>
        </div>
        {regionList
          .filter((r) => r !== region)
          .map((r, index) => (
            <Region key={index} onSelectRegion={onSelectRegion} onSelected={onSelected} selected={selected} region={r} />
          ))}
      </div>
    </div>
  );
}

const Region = ({ onSelectRegion, onSelected, selected, region }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <hr />
      <div className={`p-4 ${open ? "bg-gray-100" : "bg-white"} m-2 rounded-xl`}>
        <div className="flex items-center justify-between w-full cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="flex items-center gap-4">
            <div onClick={() => onSelectRegion(region)}>
              <div className={`relative w-[36px] h-[16px] rounded-[36px] ${Object.keys(selected).includes(region) ? "bg-blue-600" : "bg-gray-200"}`}>
                <div
                  className={`w-[20px] h-[20px] bg-[#FFFFFF] rounded-[20px] border-[#E5E7EB] border-[1px] absolute top-[-2px] shadow-[0_1px_3px_rgb(0,0,0,0.1),0_1px_2px_rgb(0,0,0,0.06)] ${
                    Object.keys(selected).includes(region) ? "right-[-2px]" : "left-[-2px]"
                  }`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-bold text-base">{region}</div>
              {selected[region]?.length > 0 && <div className="text-gray-800 font-normal text-xs">{selected[region]?.reduce((prev, d) => `${prev}, ${d}`)}</div>}
            </div>
          </div>
          <FiChevronDown className={`text-gray-400 h-6 w-6 transform ${open ? "rotate-180" : ""}`} />
        </div>
        {open ? (
          <div className="grid grid-cols-3 gap-y-2 gap-x-4 mt-4">
            {region2department[region].map((department, index) => (
              <Department key={index} onSelected={onSelected} selected={selected} region={region} department={department} />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
};

const Department = ({ onSelected, selected, region, department }) => {
  return (
    <div className="flex items-center basis-1/3 p-2 gap-4 bg-gray-300 rounded-xl">
      <input type="checkbox" checked={selected[region]?.includes(department) || false} onChange={() => onSelected(region, department)} />
      <div className="text-base text-gray-800">{department}</div>
    </div>
  );
};
