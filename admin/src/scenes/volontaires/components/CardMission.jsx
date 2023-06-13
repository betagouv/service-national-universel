import React from "react";
import { BiMailSend } from "react-icons/bi";
import { formatStringDateTimezoneUTC, translate } from "snu-lib";
import IconDomain from "../../../components/IconDomain";
import Tag from "../../../components/Tag";

export default function CardMission({ mission, onSend, sent = false }) {
  return (
    <div className="my-8 rounded-xl bg-white p-3 shadow-ninaButton">
      <div className="flex gap-6">
        <div className="m-auto pl-2">
          <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
        </div>

        <div className="grid w-full grid-rows-4 text-xs">
          <div className="flex items-center">
            <p className="uppercase text-gray-500">{mission.structureName}</p>
          </div>

          <div className="row-span-2 flex items-center justify-between">
            <div className="flex w-1/2 overflow-hidden">
              <a href={"/mission/" + mission._id} className="my-auto text-lg font-semibold leading-6">
                {mission.name}
              </a>
            </div>
            <div className="w-1/6 space-y-1 text-xs font-medium">
              <div>
                <span className="text-gray-500">Du </span>
                <span className="text-gray-700">{formatStringDateTimezoneUTC(mission.startAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Au </span>
                <span className="text-gray-700">{formatStringDateTimezoneUTC(mission.endAt)}</span>
              </div>
            </div>
            <p className="w-1/6 font-medium leading-4">
              {mission.placesLeft} {mission.placesLeft > 1 ? "places disponibles" : "place disponible"}
            </p>
            <div className="w-1/6">
              {sent ? (
                <p className="text-green-500">Mission proposée</p>
              ) : (
                <button className="rounded-md bg-blue-600 px-3 py-2 text-sm text-blue-50 hover:brightness-110 active:brightness-125" onClick={onSend}>
                  <BiMailSend className="block h-4 w-4 xl:hidden" />
                  <p className="hidden xl:block">Proposer la mission</p>
                </button>
              )}
            </div>
          </div>

          <div className="flex h-8 items-center gap-2">
            <Tag tag={`${mission.city} ${mission.zip}`} />
            {mission.domains && mission.domains.map((tag, index) => <Tag key={index} tag={translate(tag)} />)}
            {mission.isMilitaryPreparation === "true" && <Tag tag="Préparation militaire" />}
          </div>
        </div>
      </div>
    </div>
  );
}
