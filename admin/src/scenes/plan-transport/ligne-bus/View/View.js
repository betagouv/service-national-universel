import React from "react";
import { toastr } from "react-redux-toastr";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { Title } from "../../components/commons";
import Centre from "./components/Centre";
import Info from "./components/Info";
import Itineraire from "./components/Itineraire";
import Modification from "./components/Modification";
import PointDeRassemblement from "./components/PointDeRassemblement";
import Loader from "../../../../components/Loader";
import { ROLES, translate } from "snu-lib";
import Creation from "../modificationPanel/Creation";
import { useSelector } from "react-redux";
import { environment } from "../../../../config";

export default function View(props) {
  const [data, setData] = React.useState(null);
  const [dataForCheck, setDataForCheck] = React.useState(null);
  const [demandeDeModification, setDemandeDeModification] = React.useState(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [nbYoung, setNbYoung] = React.useState();
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

      const { responses } = await api.esQuery("young", body);

      setNbYoung(responses[0].hits.total.value);

      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la récupération du bus", translate(code));
      }
      setData(reponseBus);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  const getDataForCheck = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
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

  React.useEffect(() => {
    getBus();
    getDataForCheck();
    getDemandeDeModification();
  }, []);

  if (!data) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/ligne-de-bus" }, { label: "Fiche ligne" }]} />
      <div className="flex flex-col m-8 gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Title>{data.busId}</Title>
            <div className="rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 border-[1px] border-[#66A7F4] text-[#0C7CFF] bg-[#F9FCFF]">{data.cohort}</div>
          </div>
          {user.role !== ROLES.REFERENT_DEPARTMENT && environment !== "production" && (
            <button
              className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg"
              onClick={() => setPanelOpen(true)}>
              Demander une modification
            </button>
          )}
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
          <div className="flex gap-4 items-start">
            <div className="flex flex-col gap-4 w-1/2">
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
