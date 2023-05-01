import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { isLigneBusDemandeDeModificationOpen, ligneBusCanCreateDemandeDeModification, translate } from "snu-lib";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import Loader from "../../../../components/Loader";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { Title } from "../../components/commons";
import Creation from "../modificationPanel/Creation";
import Centre from "./components/Centre";
import Info from "./components/Info";
import Itineraire from "./components/Itineraire";
import Modification from "./components/Modification";
import PointDeRassemblement from "./components/PointDeRassemblement";

export default function View(props) {
  const [data, setData] = React.useState(null);
  const [dataForCheck, setDataForCheck] = React.useState(null);
  const [demandeDeModification, setDemandeDeModification] = React.useState(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [nbYoung, setNbYoung] = React.useState();
  const [cohort, setCohort] = React.useState();
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

  if (!data) return <Loader />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport", to: `/ligne-de-bus?cohort=${data.cohort}` }, { label: "Fiche ligne" }]} />
      <div className="m-8 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Title>{data.busId}</Title>
            <div className="cursor-pointer rounded-full border-[1px] border-[#66A7F4] bg-[#F9FCFF] px-3 py-1 text-xs font-medium leading-5 text-[#0C7CFF]">{data.cohort}</div>
          </div>
          {ligneBusCanCreateDemandeDeModification(user) && isLigneBusDemandeDeModificationOpen(user, cohort) && (
            <button
              className="rounded-lg border-[1px] border-blue-600 bg-blue-600 px-4 py-2 text-white shadow-sm transition duration-300 ease-in-out hover:bg-white hover:!text-blue-600"
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
