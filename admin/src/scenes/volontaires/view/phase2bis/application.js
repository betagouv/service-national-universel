import React from "react";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router";
import { Link, useHistory, NavLink } from "react-router-dom";

import Wrapper from "../wrapper";
import api from "../../../../services/api";
import { appURL } from "../../../../config";
import { capture } from "../../../../sentry";
import { APPLICATION_STATUS, colors, formatStringDateTimezoneUTC, ROLES, SENDINBLUE_TEMPLATES, translate, translateApplication, copyToClipboard } from "../../../../utils";
import IconDomain from "../../../../components/IconDomain";
import { AiOutlineClockCircle, AiFillClockCircle } from "react-icons/ai";
import rubberStampValided from "../../../../assets/rubberStampValided.svg";
import rubberStampNotValided from "../../../../assets/rubberStampNotValided.svg";
import ReactTooltip from "react-tooltip";

export default function Phase2Application({ young, onChange }) {
  const [application, setApplication] = React.useState(null);
  const [mission, setMission] = React.useState();
  const [tags, setTags] = React.useState();
  const [contract, setContract] = React.useState(null);

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

  React.useEffect(() => {
    const getContract = async () => {
      if (application?.contractId) {
        const { ok, data, code } = await api.get(`/contract/${application.contractId}`);
        if (!ok) {
          capture(code);
          return toastr.error("Oups, une erreur est survenue", code);
        }
        setContract(data);
      }
    };
    getContract();
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
            <div className="flex-1 flex justify-between  ">
              <Link className="flex items-center" to={`/mission/${application.missionId}`}>
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
            <div className="">
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
          <div className="p-4">
            <div className="bg-gray-50 rounded-lg  px-10 py-6">
              <div className="flex justify-between">
                <div className="text-lg font-bold">Contrat d’engagement en mission d’intérêt général</div>
                <div className="text-xs font-normal px-2  bg-sky-100 text-sky-500 rounded-sm items-center flex space-x-1">
                  <AiFillClockCircle className="text-sky-500" />
                  <div>Contrat {contract?.invitationSent ? "envoyé" : "en brouillon"}</div>
                </div>
              </div>
              <div className="text-sm mt-1">Ce contrat doit être validé par vos représentant(s) légal(aux), votre tuteur de mission et le référent départemental.</div>
              {contract?.invitationSent && (
                <div className="grid gap-4 grid-cols-4   mt-4">
                  <StatusContractPeople
                    value={contract?.projectManagerStatus}
                    description="Représentant de l’État"
                    firstName={contract?.projectManagerFirstName}
                    lastName={contract?.projectManagerLastName}
                    target="projectManager"
                    contract={contract}
                    status={contract?.projectManagerStatus}
                    token={contract?.projectManagerToken}
                    validationDate={contract?.projectManagerValidationDate}
                  />
                  <StatusContractPeople
                    value={contract?.structureManagerStatus}
                    description="Représentant de la structure"
                    firstName={contract?.structureManagerFirstName}
                    lastName={contract?.structureManagerLastName}
                    target="structureManager"
                    contract={contract}
                    status={contract?.structureManagerStatus}
                    token={contract?.structureManagerToken}
                    validationDate={contract?.structureManagerValidationDate}
                  />
                  {contract?.isYoungAdult === "true" ? (
                    <StatusContractPeople value={contract?.youngContractStatus} description="Volontaire" firstName={contract?.youngFirstName} lastName={contract?.youngLastName} />
                  ) : (
                    <>
                      <StatusContractPeople
                        value={contract?.parent1Status}
                        description="Représentant légal 1"
                        firstName={contract?.parent1FirstName}
                        lastName={contract?.parent1LastName}
                        target="parent1"
                        contract={contract}
                        status={contract?.parent1Status}
                        token={contract?.parent1Token}
                        validationDate={contract?.parent1ValidationDate}
                      />
                      {contract?.parent2Email && (
                        <StatusContractPeople
                          value={contract?.parent2Status}
                          description="Représentant légal 2"
                          firstName={contract?.parent2FirstName}
                          lastName={contract?.parent2LastName}
                          target="parent2"
                          contract={contract}
                          status={contract?.parent2Status}
                          token={contract?.parent2Token}
                          validationDate={contract?.parent2ValidationDate}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* {JSON.stringify(application)} */}
      </Wrapper>
    </div>
  );
}

const StatusContractPeople = ({ value, description, firstName, lastName, token }) => (
  <div className="flex flex-col justify-center items-start ">
    <div className="flex flex-col justify-center items-start " data-tip data-for={`${firstName}${lastName}-validation`}>
      <div className="mr-2">
        {value === "VALIDATED" ? <img src={rubberStampValided} alt="rubberStampValided" /> : <img src={rubberStampNotValided} alt="rubberStampNotValided" />}
      </div>
      <div>
        <div className="flex font-semibold space-x-2">
          <div>{firstName}</div>
          <div>{lastName?.toUpperCase()}</div>
        </div>
        <div className="text-gray-500 text-xs">{description}</div>
      </div>
      {value !== "VALIDATED" ? (
        <ReactTooltip id={`${firstName}${lastName}-validation`} type="light">
          En attente de signature
        </ReactTooltip>
      ) : null}
    </div>
    <div className="mt-4">
      <div
        className="text-xs text-blue-500 cursor-pointer hover:underline"
        onClick={() => {
          copyToClipboard(`${appURL}/validate-contract?token=${token}`);
          toastr.success("Le lien a été copié dans le presse papier.");
        }}>
        Copier le lien de validation
      </div>
      {/* <SendContractLink contract={contract} target={target} /> */}
    </div>
  </div>
);
