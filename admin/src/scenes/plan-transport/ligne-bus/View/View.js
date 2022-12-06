import React from "react";
import { toastr } from "react-redux-toastr";
import Breadcrumbs from "../../../../components/Breadcrumbs";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { Title } from "../../components/commons";
import Info from "./components/Info";
import Itineraire from "./components/Itineraire";
import Modification from "./components/Modification";
import Panel from "./components/Panel";

export default function View(props) {
  const [data, setData] = React.useState(null);
  const [panelOpen, setPanelOpen] = React.useState(false);

  const getBus = async () => {
    try {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { ok, code, data: reponsePDR } = await api.get(`/ligne-de-bus/${id}`);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue lors de la récupération du bus", code);
        return history.push("/point-de-rassemblement");
      }
      setData({ ...reponsePDR, addressVerified: true });
      return reponsePDR.cohorts;
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération du bus");
    }
  };

  React.useEffect(() => {
    getBus();
  }, []);

  if (!data) return <div />;

  return (
    <>
      <Breadcrumbs items={[{ label: "Plan de transport", to: "/ligne-de-bus" }, { label: "Fiche ligne" }]} />
      <div className="flex flex-col m-8 gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Title>{data.busId}</Title>
            <div className="rounded-full text-xs font-medium leading-5 cursor-pointer px-3 py-1 border-[1px] border-[#66A7F4] text-[#0C7CFF] bg-[#F9FCFF]">{data.cohort}</div>
          </div>
          <button
            className="border-[1px] border-blue-600 bg-blue-600 shadow-sm px-4 py-2 text-white hover:!text-blue-600 hover:bg-white transition duration-300 ease-in-out rounded-lg"
            onClick={() => setPanelOpen(true)}>
            Demander une modification
          </button>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex gap-4 items-stretch">
            <Itineraire
              meetingsPoints={data.meetingsPointsDetail}
              aller={data.departuredDate}
              retour={data.returnDate}
              center={{ ...data.centerDetail, departureHour: data.centerArrivalTime, returnHour: data.centerDepartureTime }}
            />
            <Modification />
          </div>
          <Info bus={data} setBus={setData} />
          <div className="flex gap-4 items-start">
            <div className="flex flex-col gap-4 w-1/2">
              {data.meetingsPointsDetail.map((pdr, index) => (
                <div key={index} className="rounded-lg bg-white h-[396px] w-full"></div>
              ))}
            </div>
            <div className="rounded-lg bg-white h-[396px] w-1/2"></div>
          </div>
        </div>
      </div>
      <Panel open={panelOpen} setOpen={setPanelOpen} />
    </>
  );
}
