import React from "react";
import { useParams } from "react-router-dom";
import { region2department, regionList } from "snu-lib";
import api from "../../services/api";
import { FiChevronDown } from "react-icons/fi";
import { BsArrowRight } from "react-icons/bs";
import Select from "react-select";

export default function tableDeRepartition() {
  const { fromRegion, cohort } = useParams();
  const [selected, setSelected] = React.useState({});
  const getTable = async () => {
    const { ok, data } = await api.get(`/table-de-repartition/from-region/${fromRegion}/cohort/${cohort}`);
    if (ok) {
      let update = {};
      data.map((item) => {
        if (update[item.toRegion]) {
          if (update[item.toRegion].includes(item.toDepartment)) {
            update[item.toRegion] = update[fromRegion].filter((e) => e !== item.toDepartment);
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

  const onSelected = (region, fromDepartement, departements) => {
    let update = { ...selected };
    if (update[region]) {
      let find = update[region].find((d) => d.fromDepartment === fromDepartement);
      if (find) {
        find.toDepartments = departements.map((d) => d.value);
      } else {
        update[region].push({ fromDepartment: fromDepartement, toDepartments: departements.map((d) => d.value) });
      }
    } else {
      update[region] = [{ fromDepartement, toDepartments: [departements.map((d) => d.value)] }];
    }
    console.log(update);
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
    selected.fromRegion = fromRegion;
    selected.cohort = cohort;
    const { ok, data } = await api.post(`/table-de-repartition`, selected);
    //use data to refresh the table
    console.log(ok, data);
  };

  return (
    <div className="flex flex-col w-full p-4 ">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold ">Répartition des régions d’accueil - {fromRegion}</div>
      </div>
      <div className="flex flex-col bg-white rounded-xl">
        <div className="flex items-center justify-end gap-4 px-6 py-4">
          <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:!text-blue-600 hover:bg-white">Exporter</button>
          <button className="bg-blue-600 border-[1px] border-blue-600 text-white px-4 py-2 rounded-lg hover:!text-blue-600 hover:bg-white" onClick={onSubmit}>
            Enregistrer
          </button>
        </div>
        {regionList
          .filter((r) => r !== fromRegion)
          .map((r, index) => (
            <Region key={index} onSelectRegion={onSelectRegion} onSelected={onSelected} selected={selected} region={r} fromRegion={fromRegion} />
          ))}
      </div>
    </div>
  );
}

const Region = ({ onSelectRegion, onSelected, selected, region, fromRegion }) => {
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
            </div>
          </div>
          <FiChevronDown className={`text-gray-400 h-6 w-6 transform ${open ? "rotate-180" : ""}`} />
        </div>
        {open ? (
          <div className="flex flex-col gap-2">
            <div className="flex">
              <div className="w-[45%]"> Départements de ma région</div>
              <div className="w-[10%]">
                <BsArrowRight className="text-gray-400 h-6 w-6 " />
              </div>
              <div className="mb-4 w-[45%]">Départements de la région d’accueil</div>
            </div>
            {region2department[fromRegion].map((fromDepartment, index) => (
              <Department key={index} onSelected={onSelected} selected={selected} region={region} fromDepartment={fromDepartment} />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
};

const Department = ({ onSelected, selected, region, fromDepartment }) => {
  return (
    <>
      <div className="flex">
        <div className="w-[45%] text-base text-gray-800">{fromDepartment}</div>
        <div className="w-[10%]">
          <BsArrowRight className="text-gray-400 h-6 w-6" />
        </div>
        <Select
          isMulti
          className="w-[45%]"
          options={region2department[region].map((d) => ({ value: d, label: d }))}
          onChange={(e) => {
            onSelected(region, fromDepartment, e);
          }}
          value={selected[region]?.find((d) => d.fromDepartment === fromDepartment)?.toDepartment?.map((d) => ({ value: d, label: d }))}
        />
        {/* <div className="flex items-center basis-1/3 p-2 gap-4 bg-gray-300 rounded-xl">
        <input type="checkbox" checked={selected[region]?.includes(fromDepartment) || false} onChange={() => onSelected(region, fromDepartment)} />
      </div> */}
      </div>
    </>
  );
};
