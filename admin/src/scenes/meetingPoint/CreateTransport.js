import React, { useState } from "react";
import { useSelector } from "react-redux";
import BusSvg from "../../assets/icons/Bus";
import Plus from "../../assets/icons/Plus";
import Breadcrumbs from "../../components/Breadcrumbs";
import api from "../../services/api";
import { canCreateMeetingPoint } from "../../utils";

export default function CreateTransport(props) {
  const user = useSelector((state) => state.Auth.user);

  // todo: degage si t'as pas le droit
  if (!canCreateMeetingPoint(user)) return null;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Points de rassemblement", to: `/point-de-rassemblement` },
          { label: "Création d'un nouveau point de rassemblement", to: `/point-de-rassemblement/nouveau` },
          { label: "Création d'un nouveau transport" },
        ]}
      />
      <div className="m-9">
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="flex flex-row items-center">
            <BusSvg className="h-10 w-10 text-gray-400" />
            <div className="font-bold text-2xl ml-4">Nouveau transport</div>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center">
          <div className="flex flex-col w-2/5 bg-white rounded-xl p-9 self-stretch">
            <div className="flex justify-between">
              <h4>
                <strong>formulaire de création</strong>
              </h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
