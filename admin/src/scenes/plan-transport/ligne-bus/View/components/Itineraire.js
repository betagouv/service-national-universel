import React from "react";
import { GoPrimitiveDot } from "react-icons/go";
import { IoAirplaneOutline, IoRocketOutline } from "react-icons/io5";
import { formatDateFR } from "snu-lib";
import BusSvg from "../../../../../assets/icons/Bus";
import Train from "../../components/Icons/Train";
import Toggle from "../../components/Toggle";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getIcon(type) {
  switch (type) {
    case "train":
      return <Train className="text-gray-400" />;
    case "bus":
      return <BusSvg className="text-gray-400" />;
    case "avion":
      return <IoAirplaneOutline className="text-gray-400" />;
    case "fusée":
      return <IoRocketOutline className="text-gray-400" />;
  }
}

export default function Itineraire({ meetingsPoints, center, aller, retour }) {
  const [showRetour, setShowRetour] = React.useState(false);
  const [timeline, setTimeline] = React.useState([]);

  const toggleAllerRetour = () => {
    let flatMeetingsPoints = [];
    for (let i = 0; i < meetingsPoints.length; i++) {
      flatMeetingsPoints.push(meetingsPoints[i]);
      if (meetingsPoints[i]?.stepPoints.length) {
        for (let j = 0; j < meetingsPoints[i].stepPoints.length; j++) {
          flatMeetingsPoints.push({ ...meetingsPoints[i].stepPoints[j], isEtape: true });
        }
      }
    }

    let sortMeetingsPoints = flatMeetingsPoints.sort((a, b) => {
      if (showRetour) return a.returnHour.split(":")[0] - b.returnHour.split(":")[0];
      return a.departureHour.split(":")[0] - b.departureHour.split(":")[0];
    });

    let timeline = sortMeetingsPoints.map((meetingPoint, index) => {
      return {
        id: showRetour ? index + 1 : index,
        time: showRetour ? meetingPoint?.returnHour : meetingPoint?.departureHour,
        transportType: meetingPoint?.transportType,
        department: meetingPoint?.department,
        region: meetingPoint?.region,
        name: meetingPoint?.name,
        address: meetingPoint?.address,
        city: meetingPoint?.city,
        zip: meetingPoint?.zip,
        isEtape: meetingPoint?.isEtape ? true : false,
        iconColor: meetingPoint?.isEtape ? "text-gray-400" : "text-blue-600",
      };
    });

    timeline.push({
      id: showRetour ? 0 : timeline.length,
      time: showRetour ? center?.returnHour : center?.departureHour,
      transportType: null,
      department: center?.department,
      region: center?.region,
      name: center?.name,
      address: center?.address,
      city: center?.city,
      zip: center?.zip,
      iconColor: "text-blue-600",
    });

    timeline.sort((a, b) => {
      return a.id - b.id;
    });

    setTimeline(timeline);
  };

  React.useEffect(() => {
    toggleAllerRetour();
  }, [showRetour, meetingsPoints, center, aller, retour]);

  return (
    <div className="p-8 w-1/2 bg-white rounded-xl min-h-[396px]">
      <div className="flex items-center justify-between">
        <div className="text-xl leading-6 text-[#242526]">Itinéraire</div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="text-gray-500 text-xs leading-5 font-light">Aller</div>
            <div className="text-gray-800 text-xs leading-4">{formatDateFR(aller)}</div>
          </div>
          <Toggle value={showRetour} onChange={() => setShowRetour(!showRetour)} />
          <div className="flex flex-col">
            <div className="text-gray-500 text-xs leading-5 font-light">Retour</div>
            <div className="text-gray-800 text-xs leading-4">{formatDateFR(retour)}</div>
          </div>
        </div>
      </div>
      <div className="flow-root mt-8 mb-8">
        <ul role="list" className="pr-4">
          {timeline.map((event, eventIdx) => (
            <li key={event.id} className="list-none">
              <div className="relative">
                <span className="absolute left-[88px] -ml-[2px] h-full w-1 bg-gray-200 space-x-3" aria-hidden="true" />
                <div className={classNames(eventIdx !== timeline.length - 1 ? "pb-4" : "", "flex items-center gap-4")}>
                  <div className="flex items-center justify-center py-2 rounded-lg bg-gray-100 w-14 text-xs font-medium leading-4">{event.time}</div>
                  <div>
                    <span className="flex items-center justify-center w-8 h-8">
                      <GoPrimitiveDot className={classNames(event.iconColor, "h-5 w-5 z-10")} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between items-center space-x-4">
                    <div className="flex flex-col">
                      {event.isEtape ? (
                        <>
                          <p className="text-xs leading-4 text-[#738297]">Correspondance</p>
                          <p className="text-xs leading-4 text-[#738297] font-light">{event.address}</p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-sm leading-6 text-[#242526]">
                            {event.department} • {event.region}
                          </p>
                          <p className="text-xs leading-4 text-[#738297] font-light">{event.name}</p>
                          <p className="text-xs leading-4 text-[#738297] font-light">
                            {event.address}, {event.zip}, {event.city}
                          </p>
                        </>
                      )}
                    </div>
                    {event.transportType && getIcon(event.transportType)}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
