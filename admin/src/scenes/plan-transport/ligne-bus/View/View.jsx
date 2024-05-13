import React from "react";
import { HiOutlineBell, HiOutlineChatAlt } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { ROLES, canExportLigneBus, isLigneBusDemandeDeModificationOpen, ligneBusCanCreateDemandeDeModification, translate } from "snu-lib";

import Bus from "../../../../assets/icons/Bus";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Loader from "../../../../components/Loader";
import SelectAction from "../../../../components/SelectAction";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { Title } from "../../components/commons";
import { exportLigneBusJeune } from "../../util";
import Creation from "../modificationPanel/Creation";
import BusTeam from "./components/BusTeam";
import Centre from "./components/Centre";
import Info from "./components/Info";
import Itineraire from "./components/Itineraire";
import Modification from "./components/Modification";
import PointDeRassemblement from "./components/PointDeRassemblement";
import InfoMessage from "../../../dashboardV2/components/ui/InfoMessage";

export default function View(props) {
  const [data, setData] = React.useState(null);
  const [dataForCheck, setDataForCheck] = React.useState(null);
  const [demandeDeModification, setDemandeDeModification] = React.useState(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [nbYoung, setNbYoung] = React.useState();
  const [cohort, setCohort] = React.useState();
  const [addOpen, setAddOpen] = React.useState(false);
  const user = useSelector((state) => state.Auth.user);
  const [isLoading, setIsLoading] = React.useState(false);

  const getBus = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { ok, code, data: reponseBus } = await api.get(`/ligne-de-bus/${id}`);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du bus", translate(code));
      }
      setData(reponseBus);

      const responseYoungs = await api.post(`/elasticsearch/young/in-bus/${String(id)}/search`, { filters: {} });

      setNbYoung(responseYoungs.responses[0].hits.total.value);

      await getCohortDetails(reponseBus.cohort);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  const getDataForCheck = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { ok, code, data: reponseCheck } = await api.get(`/ligne-de-bus/${id}/data-for-check`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du bus", translate(code));
      }
      setDataForCheck(reponseCheck);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  const getDemandeDeModification = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { ok, code, data: reponseDemandeDeModification } = await api.get(`/demande-de-modification/ligne/${id}`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du bus", translate(code));
      }
      reponseDemandeDeModification.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setDemandeDeModification(reponseDemandeDeModification);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  const getCohortDetails = async (cohort) => {
    try {
      const { ok, code, data } = await api.get(`/cohort/${cohort}`);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du bus", translate(code));
      }
      setCohort(data);
    } catch (e) {
      console.log(e);
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération de la cohorte");
    }
  };

  const sendNotifRef = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      setIsLoading(true);
      const { ok, code } = await api.post(`/ligne-de-bus/${id}/notifyRef`);
      if (!ok) {
        setIsLoading(false);
        return toastr.error("Oups, une erreur est survenue lors de l'envoi de la notification", translate(code));
      }
      setIsLoading(false);
      toastr.success("Notification envoyée !");
    } catch (e) {
      capture(e);
      setIsLoading(false);
      toastr.error("Oups, une erreur est survenue lors de l'envoi de la notification");
    }
  };

  React.useEffect(() => {
    getBus();
    getDataForCheck();
    getDemandeDeModification();
  }, []);
  React.useEffect(() => {
    setAddOpen(false);
  }, [data]);
  if (!data) return <Loader />;

  const leader = data.team.filter((item) => item.role === "leader")[0]?._id || null;

  let exportItems = [
    {
      key: "exportData",
      action: async () => {
        await exportLigneBusJeune(cohort.name, data, "total", data.team);
      },
      render: (
        <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
          <Bus className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
          <div className="text-sm text-gray-700">Informations complètes</div>
        </div>
      ),
    },
    {
      key: "exportDataAller",
      action: async () => {
        await exportLigneBusJeune(cohort.name, data, "Aller", data.team);
      },
      render: (
        <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
          <Bus className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
          <div className="text-sm text-gray-700">Informations Aller</div>
        </div>
      ),
    },
    {
      key: "exportDataRetour",
      action: async () => {
        await exportLigneBusJeune(cohort.name, data, "Retour", data.team);
      },
      render: (
        <div className="group flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 hover:bg-gray-50">
          <Bus className="text-gray-400 group-hover:scale-105 group-hover:text-green-500" />
          <div className="text-sm text-gray-700">Informations Retour</div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between mr-8 items-center">
        <Breadcrumbs items={[{ label: "Plan de transport", to: `/ligne-de-bus?cohort=${data.cohort}` }, { label: "Fiche ligne" }]} />
        {canExportLigneBus(user) && data.team.length > 0 ? (
          <SelectAction
            title="Exporter la ligne"
            alignItems="right"
            buttonClassNames="bg-blue-600 mt-8"
            textClassNames="text-white font-medium text-sm"
            rightIconClassNames="text-blue-300"
            optionsGroup={[
              {
                key: "export",
                title: "Télécharger",
                items: exportItems,
              },
            ]}
          />
        ) : null}
      </div>
      <div className="mx-8 mb-8 mt-3 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Title>{data.busId}</Title>
            <div className="cursor-pointer rounded-full border-[1px] border-[#66A7F4] bg-[#F9FCFF] px-3 py-1 text-xs font-medium leading-5 text-[#0C7CFF]">{data.cohort}</div>
          </div>
          <div className="flex items-center gap-2">
            {ligneBusCanCreateDemandeDeModification(user) && isLigneBusDemandeDeModificationOpen(user, cohort) && (
              <button className="flex items-center gap-2 px-3 bg-white text-blue-600 rounded-lg hover:scale-105 h-[30px]" onClick={() => setPanelOpen(true)}>
                <HiOutlineChatAlt className="text-blue-600 h-4 w-4" />
                Demander une modification
              </button>
            )}
            {user.role === ROLES.ADMIN && (
              <button
                disabled={isLoading}
                className="flex items-center gap-2 px-3 bg-white text-blue-600 rounded-lg hover:scale-105 h-[30px] disabled:hover:scale-100 disabled:opacity-75 disabled:cursor-progress"
                onClick={() => sendNotifRef()}>
                <HiOutlineBell className="text-blue-600 h-4 w-4" />
                Avertir le référent
              </button>
            )}
          </div>
        </div>
        {data.delayedForth === "true" || data.delayedBack === "true" ? (
          <InfoMessage
            priority="important"
            message={`Le départ de cette ligne de bus est retardé ${
              data.delayedForth === "true" && data.delayedBack === "true" ? "à l'aller et au retour" : data.delayedForth === "true" ? "à l'aller" : "au retour"
            }.`}
          />
        ) : null}
        <div className="flex flex-col gap-8">
          <div className="flex gap-4">
            <Itineraire
              meetingsPoints={data.meetingsPointsDetail}
              aller={data.departuredDate}
              retour={data.returnDate}
              center={{ ...data.centerDetail, departureHour: data.centerArrivalTime, returnHour: data.centerDepartureTime }}
              bus={data}
              setBus={setData}
            />
            <Modification demandeDeModification={demandeDeModification} getModification={getDemandeDeModification} />
          </div>
          <Info bus={data} setBus={setData} dataForCheck={dataForCheck} nbYoung={nbYoung} cohort={cohort} />

          <BusTeam bus={data} setBus={setData} title={"Chef de file"} role={"leader"} idTeam={leader} addOpen={addOpen} cohort={cohort} />
          {data.team.filter((item) => item.role === "supervisor").length > 0 ? (
            data.team
              .filter((item) => item.role === "supervisor")
              .map((value) => (
                <BusTeam
                  key={value._id}
                  bus={data}
                  setBus={setData}
                  title="Encadrant"
                  role={"supervisor"}
                  idTeam={value._id}
                  addOpen={addOpen}
                  setAddOpen={setAddOpen}
                  cohort={cohort}
                />
              ))
          ) : (
            <BusTeam bus={data} setBus={setData} title="Encadrant" role={"supervisor"} cohort={cohort} />
          )}
          {addOpen ? <BusTeam bus={data} setBus={setData} title="Encadrant" role={"supervisor"} setAddOpen={setAddOpen} cohort={cohort} /> : null}

          <div className="flex items-start gap-4">
            <div className="flex w-1/2 flex-col gap-4">
              {data.meetingsPointsDetail.map((pdr, index) => (
                <PointDeRassemblement
                  bus={data}
                  pdr={pdr}
                  setBus={setData}
                  index={index}
                  key={index}
                  volume={dataForCheck?.meetingPoints}
                  getVolume={getDataForCheck}
                  cohort={cohort}
                />
              ))}
            </div>
            <Centre bus={data} setBus={setData} cohort={cohort} />
          </div>
        </div>
      </div>
      <Creation open={panelOpen} setOpen={setPanelOpen} bus={data} getModification={getDemandeDeModification} />
    </>
  );
}
