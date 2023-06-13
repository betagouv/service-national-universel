import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { isLigneBusDemandeDeModificationOpen, ligneBusCanCreateDemandeDeModification, translate, canExportLigneBus } from "snu-lib";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Loader from "../../../../components/Loader";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { Title } from "../../components/commons";
import Creation from "../modificationPanel/Creation";
import Centre from "./components/Centre";
import Info from "./components/Info";
import BusTeam from "./components/BusTeam";
import Itineraire from "./components/Itineraire";
import Modification from "./components/Modification";
import PointDeRassemblement from "./components/PointDeRassemblement";
import SelectAction from "../../../../components/SelectAction";
import Bus from "../../../../assets/icons/Bus";
import { exportLigneBusJeune } from "../../util";

export default function View(props) {
  const [data, setData] = React.useState(null);
  const [dataForCheck, setDataForCheck] = React.useState(null);
  const [demandeDeModification, setDemandeDeModification] = React.useState(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [nbYoung, setNbYoung] = React.useState();
  const [cohort, setCohort] = React.useState();
  const [addOpen, setAddOpen] = React.useState(false);
  const user = useSelector((state) => state.Auth.user);

  const getBus = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { ok, code, data: reponseBus } = await api.get(`/ligne-de-bus/${id}`);

      let body = {
        query: { bool: { filter: [{ terms: { "ligneId.keyword": [id] } }, { terms: { "status.keyword": ["VALIDATED"] } }, { terms: { "cohort.keyword": [reponseBus.cohort] } }] } },
        size: 0,
      };

      const { responses } = await api.esQuery("young", body, null, "?showAffectedToRegionOrDep=1");
      setNbYoung(responses[0].hits.total.value);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du bus", translate(code));
      }
      setData(reponseBus);
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
        await exportLigneBusJeune(cohort.name, data.busId, "total", data.team);
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
        await exportLigneBusJeune(cohort.name, data.busId, "Aller", data.team);
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
        await exportLigneBusJeune(cohort.name, data.busId, "Retour", data.team);
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
      <Breadcrumbs items={[{ label: "Plan de transport", to: `/ligne-de-bus?cohort=${data.cohort}` }, { label: "Fiche ligne" }]} />
      <div className="m-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Title>{data.busId}</Title>
            <div className="cursor-pointer rounded-full border-[1px] border-[#66A7F4] bg-[#F9FCFF] px-3 py-1 text-xs font-medium leading-5 text-[#0C7CFF]">{data.cohort}</div>
          </div>
          <div className="flex items-center gap-2">
            {ligneBusCanCreateDemandeDeModification(user) && isLigneBusDemandeDeModificationOpen(user, cohort) && (
              <button
                className="rounded-lg border-[1px] border-blue-600 bg-blue-600 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white hover:!text-blue-600"
                onClick={() => setPanelOpen(true)}>
                Demander une modification
              </button>
            )}
            {canExportLigneBus(user) && data.team.length > 0 ? (
              <SelectAction
                title="Exporter la ligne"
                alignItems="right"
                buttonClassNames="bg-blue-600"
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
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex gap-4">
            <Itineraire
              meetingsPoints={data.meetingsPointsDetail}
              aller={data.departuredDate}
              retour={data.returnDate}
              center={{ ...data.centerDetail, departureHour: data.centerArrivalTime, returnHour: data.centerDepartureTime }}
            />
            <Modification demandeDeModification={demandeDeModification} getModification={getDemandeDeModification} />
          </div>
          <Info bus={data} setBus={setData} dataForCheck={dataForCheck} nbYoung={nbYoung} />

          <BusTeam bus={data} setBus={setData} title={"Chef de file"} role={"leader"} idTeam={leader} addOpen={addOpen} />
          {data.team.filter((item) => item.role === "supervisor").length > 0 ? (
            data.team
              .filter((item) => item.role === "supervisor")
              .map((value) => (
                <BusTeam key={value._id} bus={data} setBus={setData} title="Encadrant" role={"supervisor"} idTeam={value._id} addOpen={addOpen} setAddOpen={setAddOpen} />
              ))
          ) : (
            <BusTeam bus={data} setBus={setData} title="Encadrant" role={"supervisor"} />
          )}
          {addOpen ? <BusTeam bus={data} setBus={setData} title="Encadrant" role={"supervisor"} setAddOpen={setAddOpen} /> : null}

          <div className="flex items-start gap-4">
            <div className="flex w-1/2 flex-col gap-4">
              {data.meetingsPointsDetail.map((pdr, index) => (
                <PointDeRassemblement bus={data} pdr={pdr} setBus={setData} index={index} key={index} volume={dataForCheck?.meetingPoints} getVolume={getDataForCheck} />
              ))}
            </div>
            <Centre bus={data} setBus={setData} />
          </div>
        </div>
      </div>
      <Creation open={panelOpen} setOpen={setPanelOpen} bus={data} getModification={getDemandeDeModification} />
    </>
  );
}
