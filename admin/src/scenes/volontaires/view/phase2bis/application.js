import React from "react";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router";
import { Link, useHistory, NavLink } from "react-router-dom";

import Wrapper from "../wrapper";
import api from "../../../../services/api";
import { capture } from "../../../../sentry";
import { APPLICATION_STATUS, colors, formatStringDateTimezoneUTC, ROLES, SENDINBLUE_TEMPLATES, translate, translateApplication } from "../../../../utils";
import IconDomain from "../../../../components/IconDomain";

export default function Phase2Application({ young, onChange }) {
  const [application, setApplication] = React.useState(null);
  const [mission, setMission] = React.useState();
  const [tags, setTags] = React.useState();

  let { applicationId } = useParams();
  const history = useHistory();

  const theme = {
    background: {
      WAITING_VALIDATION: "bg-sky-100",
      WAITING_VERIFICATION: "bg-sky-100",
      WAITING_ACCEPTATION: "bg-orange-500",
      VALIDATED: "bg-[#71C784]",
      DONE: "bg-[#5694CD]",
      REFUSED: "bg-[#0B508F]",
      CANCEL: "bg-[#F4F4F4]",
      IN_PROGRESS: "bg-indigo-600",
      ABANDON: "bg-gray-50",
    },
    text: {
      WAITING_VALIDATION: "text-sky-600",
      WAITING_VERIFICATION: "text-sky-600",
      WAITING_ACCEPTATION: "text-white",
      VALIDATED: "text-white",
      DONE: "text-white",
      REFUSED: "text-white",
      CANCEL: "text-[#6B6B6B]",
      IN_PROGRESS: "text-white",
      ABANDON: "text-gray-400",
    },
  };

  React.useEffect(() => {
    const getApplication = async () => {
      if (!young) return;
      // todo : why not just
      let { ok, data, code } = await api.get(`/application/${applicationId}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }

      setApplication(data);
    };

    getApplication();
  }, []);

  React.useEffect(() => {
    if (!application) return;
    const getMission = async () => {
      if (!application.missionId) return;
      const { ok, data, code } = await api.get(`/mission/${application.missionId}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setMission(data);
      const t = [];
      data?.city && t.push(data?.city + (data?.zip ? ` - ${data?.zip}` : ""));
      (data?.domains || []).forEach((d) => t.push(translate(d)));
      setTags(t);
    };
    getMission();
  }, [application]);

  if (!application || !mission) return "chargement";

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <Wrapper young={young} tab="phase2" onChange={onChange}>
        {/* <Contract young={young} admin={true} /> */}
        <div className="bg-white w-full h-full rounded-lg">
          <div className="flex justify-between p-6">
            <button onClick={history.goBack}>retour</button>
            <div className="flex items-center gap-3 text-2xl font-bold">
              Espace&nbsp;candidature{" "}
              <div className="flex basis-[44%] items-center justify-end">
                <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} px-2 py-[2px] rounded-sm`}>
                  {translateApplication(application.status)}
                </div>
              </div>
            </div>
            {/* TODO */}
            <button onClick={() => {}}>Historique</button>
          </div>
          <hr className="my-4" />
          <div className="flex relative w-full rounded-xl px-4 border-[1px] border-white hover:border-gray-200">
            {/* Choix*/}
            <div className="flex justify-between  ">
              <Link className="flex basis-[35%] items-center" to={`/mission/${application.missionId}`}>
                {/* icon */}
                <div className="flex items-center mr-4">
                  <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
                </div>
                {/* mission info */}
                <div className="flex flex-col flex-1 justify-center">
                  <div className="uppercase text-gray-500 font-medium text-[11px] tracking-wider mb-1">{mission.structureName}</div>
                  <div className="text-[#242526] font-bold text-base mb-2">{mission.name}</div>
                  {/* tags */}
                  {tags && (
                    <div className=" inline-flex flex-wrap">
                      {tags.map((tag, index) => {
                        return (
                          <div
                            key={index}
                            className=" flex text-[11px] text-gray-600 rounded-full border-gray-200 border-[1px] justify-center items-center mb-2 mt-1 mr-1 px-3  py-0.5 font-medium ">
                            {tag}
                          </div>
                        );
                      })}
                      {mission.isMilitaryPreparation === "true" ? (
                        <div className="flex justify-center items-center bg-blue-900 text-white border-gray-200 border-[1px] rounded-full text-[11px] mb-2 mr-1 px-3 py-0.5 font-medium">
                          Préparation militaire
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </Link>
            </div>
            <div>
              <div className="flex flex-col justify-center items-center p-4 m-0">
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG prévisionnelles</div>
                {/* get duration du contrat ou de la mission ? */}
                <div className="font-bold text-2xl text-[#242526]">{application.missionDuration || "0"}h</div>
              </div>
              <div className="flex flex-col justify-center items-center p-4 m-0">
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG réalisées</div>
                <div className="font-bold text-2xl text-[#242526]">{application.missionDuration || "0"}h</div>
              </div>
            </div>
          </div>
          <hr className="my-4" />
        </div>
        {JSON.stringify(application)}
      </Wrapper>
    </div>
  );
}
