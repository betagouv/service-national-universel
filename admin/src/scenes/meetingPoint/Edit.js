import React, { useEffect, useState } from "react";
import { BiHandicap } from "react-icons/bi";
import { getDepartmentNumber, formatLongDateUTC } from "../../utils";
import BusSvg from "../../assets/icons/Bus";
import Plus from "../../assets/icons/Plus";
import api from "../../services/api";
import ArrowCircleRight from "../../assets/icons/ArrowCircleRight";
import ModalEditMeetingPoint from "./components/ModalEditMeetingPoint";

export default function Edit(props) {
  const [meetingPoint, setMeetingPoint] = useState();
  const [bus, setBus] = useState();
  const [center, setCenter] = useState();
  const [modal, setModal] = React.useState({ isOpen: false });

  useEffect(() => {
    const id = props.match && props.match.params && props.match.params.id;
    (async () => {
      const { data, ok } = await api.get(`/meeting-point/${id}`);
      if (!ok) return;
      setMeetingPoint(data);
    })();
  }, []);

  useEffect(() => {
    if (meetingPoint) {
      (async () => {
        const { data, ok } = await api.get(`/bus/${meetingPoint.busId}`);
        if (!ok) return;
        setBus(data);
      })();
      (async () => {
        const { data, ok } = await api.get(`/cohesion-center/${meetingPoint.centerId}`);
        if (!ok) return;
        setCenter(data);
      })();
    }
  }, [meetingPoint]);

  if (!meetingPoint || !center || !bus) return null;

  return (
    <div className="m-9">
      <div className="flex flex-row items-center mb-4">
        <BusSvg className="h-10 w-10" />
        <div className="font-bold text-2xl ml-4">{meetingPoint.busExcelId}</div>
      </div>
      <div className="flex flex-row  justify-center gap-4 items-center">
        <div className="flex flex-col w-2/5 bg-white rounded-xl p-9 self-stretch">
          <div className="flex justify-between">
            <h4>
              <strong>Point de rassemblement</strong>
            </h4>
          </div>
          <div>
            <Donnee title={"Adresse"} value={meetingPoint.departureAddress} number={""} />
            <Donnee title={"Département"} value={meetingPoint.departureDepartment} number={`(${getDepartmentNumber(center.department)})`} />
            <Donnee title={"Date aller"} value={formatLongDateUTC(meetingPoint.departureAt)} />
            <Donnee title={"Date retour"} value={formatLongDateUTC(meetingPoint.returnAt)} />
            <div className="flex justify-center mt-4">
              <button
                className="group border-[1px] border-blue-700 rounded-lg hover:bg-blue-700"
                onClick={() =>
                  setModal({
                    isOpen: true,
                    onSubmit: async (value) => {
                      console.log(value);
                    },
                  })
                }>
                <div className="flex flex-row items-center p-2">
                  <Plus className="text-blue-700 group-hover:text-white" />
                  <div className="ml-2 text-sm text-blue-700 leading-5 group-hover:text-white">Modifier</div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <ArrowCircleRight className="w-10 h-10 text-gray-500" />
        <div className="flex flex-col w-2/5 bg-white rounded-xl p-9 self-stretch">
          <div className="flex justify-between ">
            <h4>
              <strong>Informations du centre</strong>
            </h4>
            {center.pmr === "true" ? (
              <div className="flex bg-[#14B8A6] rounded-full px-3 py-1 items-center text-[#F0FDFA] text-md gap-1">
                <BiHandicap size={20} />
                <div>Accessible&nbsp;PMR</div>
              </div>
            ) : null}
          </div>
          <div>
            <Donnee title={"Nom du centre"} value={center.name} number={""} />
            {center.code2022 ? <Donnee title={"Code 2022 (modérateur)"} value={center.code2022} number={""} /> : null}
            <Donnee title={"Région"} value={center.region} number={""} />
            <Donnee title={"Département"} value={center.department} number={`(${getDepartmentNumber(center.department)})`} />
            <Donnee title={"Ville"} value={center.city} number={`(${center.zip})`} />
            <Donnee title={"Adresse"} value={center.address} number={""} />
          </div>
        </div>
      </div>
      <ModalEditMeetingPoint isOpen={modal?.isOpen} onCancel={() => setModal({ isOpen: false, value: null })} onSubmit={modal?.onSubmit} />
    </div>
  );
}

const Donnee = ({ title, value, number }) => {
  return (
    <div className="flex pt-4">
      <div className="w-1/2 text-brand-detail_title "> {title} : </div>
      <div className="w-1/2 font-medium">
        {value} {number}
      </div>
    </div>
  );
};
