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
        for (const stepPoint of meetingsPoints[i].stepPoints) {
          const allerRetourStepsConfigured = Boolean(stepPoint.type);
          const isRetourStep = stepPoint.type === "retour" && showRetour;
          const isAllerStep = stepPoint.type === "aller" && !showRetour;
          if (!allerRetourStepsConfigured || isRetourStep || isAllerStep) flatMeetingsPoints.push({ ...stepPoint, isEtape: true });
        }
      }
    }

    let sortMeetingsPoints = flatMeetingsPoints.sort((a, b) => {
      const fieldName = showRetour ? "returnHour" : "departureHour";
      const hourA = a[fieldName].split(":")[0];
      const hourB = b[fieldName].split(":")[0];
      if (hourA !== hourB) {
        return hourA - hourB;
      }
      const minuteA = a[fieldName].split(":")[1];
      const minuteB = b[fieldName].split(":")[1];
      return minuteA - minuteB;
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
    <div className="w-1/2 rounded-xl bg-white p-8">
      <div className="flex items-center justify-between">
        <div className="text-xl leading-6 text-[#242526]">Itinéraire</div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="text-xs font-light leading-5 text-gray-500">Aller</div>
            <div className="text-xs leading-4 text-gray-800">{formatDateFR(aller)}</div>
          </div>
          <Toggle value={showRetour} onChange={() => setShowRetour(!showRetour)} />
          <div className="flex flex-col">
            <div className="text-xs font-light leading-5 text-gray-500">Retour</div>
            <div className="text-xs leading-4 text-gray-800">{formatDateFR(retour)}</div>
          </div>
        </div>
      </div>
      <div className="mt-8 mb-8 flow-root max-h-[300px] overflow-y-auto">
        <ul role="list" className="pr-4">
          {timeline.map((event, eventIdx) => (
            <li key={event.id} className="list-none">
              <div className="relative">
                <span className="absolute left-[88px] -ml-[2px] h-full w-1 space-x-3 bg-gray-200" aria-hidden="true" />
                <div className={classNames(eventIdx !== timeline.length - 1 ? "pb-4" : "", "flex items-center gap-4")}>
                  <div className="flex w-14 items-center justify-center rounded-lg bg-gray-100 py-2 text-xs font-medium leading-4">{event.time}</div>
                  <div>
                    <span className="flex h-8 w-8 items-center justify-center">
                      <GoPrimitiveDot className={classNames(event.iconColor, "z-10 h-5 w-5")} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between space-x-4">
                    <div className="flex flex-col">
                      {event.isEtape ? (
                        <>
                          <p className="text-xs leading-4 text-[#738297]">Correspondance</p>
                          <p className="text-xs font-light leading-4 text-[#738297]">{event.address}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium leading-6 text-[#242526]">
                            {event.department} • {event.region}
                          </p>
                          <p className="text-xs font-light leading-4 text-[#738297]">{event.name}</p>
                          <p className="text-xs font-light leading-4 text-[#738297]">
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
