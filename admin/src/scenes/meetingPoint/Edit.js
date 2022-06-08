import React, { useEffect, useState } from "react";
import { BiHandicap } from "react-icons/bi";
import { MdOutlineHistory } from "react-icons/md";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import ArrowCircleRight from "../../assets/icons/ArrowCircleRight";
import BusSvg from "../../assets/icons/Bus";
import Pencil from "../../assets/icons/Pencil";
import Trash from "../../assets/icons/Trash";
import Breadcrumbs from "../../components/Breadcrumbs";
import api from "../../services/api";
import { getDepartmentNumber, ROLES } from "../../utils";
import ModalEditMeetingPoint from "./components/modalEditMeetingPoint";
import ModalConfirm from "../../components/modals/ModalConfirm";

export default function Edit(props) {
  const [meetingPoint, setMeetingPoint] = useState();
  const [bus, setBus] = useState();
  const [center, setCenter] = useState();
  const [modal, setModal] = React.useState({ isOpen: false });
  const [modalConfirm, setModalConfirm] = React.useState({ isOpen: false });
  const [occupationPercentage, setOccupationPercentage] = React.useState();
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();

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

  useEffect(() => {
    if (!bus) return;
    const occupation = bus.capacity ? (((bus.capacity - bus.placesLeft) * 100) / bus.capacity).toFixed(2) : 0;
    setOccupationPercentage(occupation);
  }, [bus]);

  if (!meetingPoint || !center || !bus) return null;

  return (
    <>
      <Breadcrumbs items={[{ label: "Points de rassemblement", to: `/point-de-rassemblement` }, { label: "Fiche du point de rassemblement" }]} />
      <div className="m-9">
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="flex flex-row items-center">
            <BusSvg className="h-10 w-10 text-gray-400" />
            <div className="font-bold text-2xl ml-4">{meetingPoint.busExcelId}</div>
          </div>
          <div className="flex gap-2 items-center">
            {user.role === ROLES.ADMIN ? (
              <Link to={`/point-de-rassemblement/${props?.match?.params?.id}/historique`}>
                <div className="flex flex-row items-center p-2 group border-[1px] border-blue-700 rounded-lg hover:bg-blue-700 cursor-pointer">
                  <MdOutlineHistory className="text-xl text-blue-700 group-hover:text-white" />
                  <div className="ml-2 text-sm text-blue-700 leading-5 group-hover:text-white">Voir les changements</div>
                </div>
              </Link>
            ) : null}
            {user.role === ROLES.ADMIN ? (
              <>
                <button
                  className="group border-[1px] border-blue-700 rounded-lg hover:bg-blue-700"
                  onClick={() =>
                    setModal({
                      isOpen: true,
                      values: {
                        departureAddress: meetingPoint?.departureAddress || "",
                        departureAtString: meetingPoint?.departureAtString || "",
                        returnAtString: meetingPoint?.returnAtString || "",
                        hideDepartmentInConvocation: meetingPoint.hideDepartmentInConvocation,
                        capacity: bus?.capacity || 0,
                        placesLeft: bus?.placesLeft || 0,
                        department: meetingPoint?.departureDepartment,
                        cohort: bus?.cohort,
                      },
                      onSubmit: async (values) => {
                        const { data: busResult, ok: okBus } = await api.put(`/bus/${bus._id}/capacity`, { capacity: values.capacity });
                        if (!okBus) {
                          toastr.error("Une erreur est survenue lors de la mise à jours des informations");
                          setModal({ isOpen: false, values: {} });
                          return;
                        }
                        setBus(busResult);

                        const { data: meeting, ok: okMeeting } = await api.put(`/meeting-point/${meetingPoint._id}`, {
                          departureAddress: values.departureAddress,
                          departureAtString: values.departureAtString,
                          returnAtString: values.returnAtString,
                          hideDepartmentInConvocation: values.hideDepartmentInConvocation,
                        });
                        if (!okMeeting) {
                          toastr.error("Une erreur est survenue lors de la mise à jours des informations");
                          setModal({ isOpen: false, values: {} });
                          return;
                        }
                        setMeetingPoint(meeting);
                        toastr.success("Le informations ont été mis à jour ");
                        setModal({ isOpen: false, values: {} });
                      },
                    })
                  }>
                  <div className="flex flex-row items-center p-2">
                    <Pencil className="text-blue-700 group-hover:text-white" width={16} height={16} />
                    <div className="ml-2 text-sm text-blue-700 leading-5 group-hover:text-white">Modifier</div>
                  </div>
                </button>
                <button
                  className="group border-[1px] border-blue-700 rounded-lg hover:bg-blue-700"
                  onClick={() =>
                    setModalConfirm({
                      isOpen: true,
                      title: "Suppresion du point de rassemblement",
                      message: "Êtes-vous sûr de vouloir supprimer ce point de rassemblement ?",
                      onConfirm: async () => {
                        const { ok } = await api.remove(`/meeting-point/${meetingPoint._id}`);
                        if (!ok) {
                          toastr.error("Une erreur est survenue lors de la mise à jours des informations");
                          setModalConfirm({ isOpen: false });
                          return;
                        }

                        setModalConfirm({ isOpen: false });
                        toastr.success("Le points de rassemblement a été supprimé !");
                        history.push("/point-de-rassemblement");
                      },
                    })
                  }>
                  <div className="flex flex-row items-center p-2">
                    <Trash className="text-blue-700 group-hover:text-white" width={16} height={16} />
                    <div className="ml-2 text-sm text-blue-700 leading-5 group-hover:text-white">Supprimer</div>
                  </div>
                </button>
              </>
            ) : null}
          </div>
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
              <Donnee
                title={"Département"}
                value={meetingPoint.departureDepartment}
                number={`(${getDepartmentNumber(meetingPoint.departureDepartment)})`}
                showLabelHide={meetingPoint.hideDepartmentInConvocation === "true"}
              />
              <Donnee title={"Date et heure de rendez-vous aller"} value={meetingPoint.departureAtString} />
              <Donnee title={"Date et heure de rendez-vous retour"} value={meetingPoint.returnAtString} />
              <Donnee title={"Place total"} value={bus.capacity} />
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
              <Donnee title={"Code 2022"} value={center.code2022 || <span className="italic text-gray-500">Non renseigné</span>} number={""} />
              <Donnee title={"Région"} value={center.region} number={""} />
              <Donnee title={"Département"} value={center.department} number={`(${getDepartmentNumber(center.department)})`} />
              <Donnee title={"Ville"} value={center.city} number={`(${center.zip})`} />
              <Donnee title={"Adresse"} value={center.address} number={""} />
            </div>
          </div>
        </div>
        {/* // Taux doccupation */}
        <div className="flex items-center justify-center mt-4">
          <OccupationCard occupationPercentage={occupationPercentage} placesTotal={bus.capacity} placesLeft={bus.placesLeft} />
        </div>
        <ModalEditMeetingPoint isOpen={modal?.isOpen} onCancel={() => setModal({ isOpen: false, value: null })} onSubmit={modal?.onSubmit} values={modal?.values} />
        <ModalConfirm
          isOpen={modalConfirm?.isOpen}
          title={modalConfirm?.title}
          message={modalConfirm?.message}
          onCancel={() => setModalConfirm({ isOpen: false, onConfirm: null })}
          onConfirm={() => {
            modalConfirm?.onConfirm();
            setModal({ isOpen: false, onConfirm: null });
          }}
        />
      </div>
    </>
  );
}

const Donnee = ({ title, value, number, showLabelHide }) => {
  return (
    <div className="flex pt-4">
      <div className="w-1/2 text-brand-detail_title "> {title} : </div>
      <div className="w-1/2 font-medium">
        {value} {number} {showLabelHide ? <span className="italic text-gray-500 text-xs">masqué</span> : ""}
      </div>
    </div>
  );
};

const OccupationCard = ({ occupationPercentage, placesLeft, placesTotal }) => {
  let height = `h-0`;
  if (occupationPercentage < 20) height = "h-[20%]";
  else if (occupationPercentage < 30) height = "h-[30%]";
  else if (occupationPercentage < 40) height = "h-[40%]";
  else if (occupationPercentage < 50) height = "h-[50%]";
  else if (occupationPercentage < 60) height = "h-[60%]";
  else if (occupationPercentage < 70) height = "h-[70%]";
  else if (occupationPercentage < 80) height = "h-[80%]";
  else if (occupationPercentage < 100) height = "h-[90%]";
  else if (occupationPercentage >= 100) height = "h-[100%]";

  let bgColor = "bg-snu-purple-300";
  if (occupationPercentage > 100) bgColor = "bg-red-500";

  return occupationPercentage ? (
    <div className="bg-white rounded-lg shadow-sm py-4 px-8 max-w-xl">
      <div className="text-lg font-medium mb-1 text-gray-900">Taux d&apos;occupation</div>
      <div className="flex gap-4">
        {/* barre */}
        <div className="flex flex-col justify-end w-9 h-[100px] bg-gray-200 rounded-lg overflow-hidden">
          <div className={`flex justify-center items-center w-9 ${height} ${bgColor} rounded-lg text-white font-bold text-xs`}>{Math.floor(occupationPercentage)}%</div>
        </div>
        {/* nombres */}
        <div className="flex flex-col justify-around">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gray-200" />
            <div>
              <div className="text-xs font-normal">Place disponibles</div>
              <div className="text-base font-bold">{placesLeft}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-snu-purple-300" />
            <div>
              <div className="text-xs font-normal">Place occupées</div>
              <div className="text-base font-bold">{placesTotal - placesLeft}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
