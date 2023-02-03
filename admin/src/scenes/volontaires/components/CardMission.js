import React from "react";
import { formatStringDateTimezoneUTC, translate } from "snu-lib";
import IconDomain from "../../../components/IconDomain";
import Tag from "../../../components/Tag";

export default function CardMission({ mission, onSend, sent = false }) {
  return (
    <div className="bg-white shadow-ninaButton rounded-xl p-4 my-8">
      <div className="flex gap-6">
        <div className="m-auto">
          <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
        </div>

        <div className="w-full text-xs">
          <div className="h-8 relative overflow-hidden">
            <p className="uppercase text-gray-500 absolute bottom-0">{mission.structureName}</p>
          </div>

          <div className="flex justify-between items-center my-2">
            <div className="h-12 w-1/2 overflow-hidden flex">
              <a href={"/mission/" + mission._id} className="text-lg font-semibold leading-6 my-auto">
                {mission.name}
              </a>
            </div>
            <div className="w-1/6 text-xs font-medium space-y-1">
              <div>
                <span className="text-gray-500">Du </span>
                <span className="text-gray-700">{formatStringDateTimezoneUTC(mission.startAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Au </span>
                <span className="text-gray-700">{formatStringDateTimezoneUTC(mission.endAt)}</span>
              </div>
            </div>
            <p className="w-1/6 leading-4 font-medium">
              {mission.placesLeft} {mission.placesLeft > 1 ? "places disponibles" : "place disponible"}
            </p>
            <div className="w-1/6">
              {sent ? (
                <p className="text-green-500">Mission proposée</p>
              ) : (
                <button className="bg-blue-600 px-3 py-2 rounded-md text-sm text-blue-50 hover:brightness-110 active:brightness-125" onClick={onSend}>
                  Proposer la mission
                </button>
              )}
            </div>
          </div>

          <div className="h-8 flex items-center gap-2">
            <Tag tag={`${mission.city} ${mission.zip}`} />
            {mission.domains && mission.domains.map((tag, index) => <Tag key={index} tag={translate(tag)} />)}
            {mission.isMilitaryPreparation === "true" && <Tag tag="Préparation militaire" />}
          </div>
        </div>
      </div>
    </div>
  );
}
