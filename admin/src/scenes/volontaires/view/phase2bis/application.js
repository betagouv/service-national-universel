import React from "react";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";

import Wrapper from "../wrapper";
import api from "../../../../services/api";
import { appURL } from "../../../../config";
import { capture } from "../../../../sentry";
import { SENDINBLUE_TEMPLATES, translate, translateApplication, translateAddFilePhase2, copyToClipboard } from "../../../../utils";
import IconDomain from "../../../../components/IconDomain";
import { AiFillClockCircle } from "react-icons/ai";
import rubberStampValided from "../../../../assets/rubberStampValided.svg";
import rubberStampNotValided from "../../../../assets/rubberStampNotValided.svg";
import ReactTooltip from "react-tooltip";
import { BsChevronDown } from "react-icons/bs";
import { HiPlus } from "react-icons/hi";
import ModalPJ from "./components/ModalPJ";
import Clock from "../../../../assets/Clock.svg";
import LeftArrow from "../../../../assets/icons/ArrowNarrowLeft";
import Pencil from "../../../../assets/icons/Pencil";
import ModalConfirm from "../../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../../components/modals/ModalConfirmWithMessage";
import FileCard from "../../../../components/FileCard";

export default function Phase2Application({ young, onChange }) {
  const [application, setApplication] = React.useState(null);
  const [mission, setMission] = React.useState();
  const [tags, setTags] = React.useState();
  const [contract, setContract] = React.useState(null);
  const [openAttachments, setOpenAttachments] = React.useState(false);
  const [modalDocument, setModalDocument] = React.useState({ isOpen: false });
  const [modalDurationOpen, setModalDurationOpen] = React.useState(false);

  let { applicationId } = useParams();
  const history = useHistory();

  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

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

  React.useEffect(() => {
    getApplication();
  }, []);

  const getMission = async () => {
    if (!application?.missionId) return;
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

  React.useEffect(() => {
    if (!application) return;
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
        <div className="bg-white w-full h-full rounded-lg px-4">
          <div className="flex justify-between py-6">
            <button onClick={history.goBack} className="flex items-center space-x-1 bg-gray-100 rounded-full p-[9px]">
              <LeftArrow stroke={"#374151"} width={15} />
            </button>
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div>Espace&nbsp;candidature </div>
              <div className="flex items-center justify-end">
                <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} px-1.5 py-[5px] rounded-sm`}>
                  {translateApplication(application.status)}
                </div>
              </div>
            </div>
            {/* TODO */}
            <button
              className="flex items-center gap-2 bg-gray-100 rounded py-2 px-4 border-[1px] border-gray-100 hover:border-gray-300"
              onClick={() => history.push(`/volontaire/${young._id.toString()}/phase2/application/${application._id.toString()}/historique`)}>
              <img src={Clock} /> <div className="text-xs text-gray-800 ">Historique</div>
            </button>
          </div>
          <hr className="my-4" />
          <div className="flex relative w-full rounded-xl  border-[1px] border-white hover:border-gray-200">
            {/* Choix*/}
            <div className="flex-1 flex justify-between basis-[60%] ">
              <Link className="flex items-center w-full px-2" to={`/mission/${application.missionId}`}>
                {/* icon */}
                <div className="flex items-center mr-4">
                  <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
                </div>
                {/* mission info */}
                <div className="flex flex-1 justify-between items-start">
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
                  <button
                    className="flex items-center gap-2 bg-gray-100 rounded py-2 px-4 border-[1px] border-gray-100 hover:border-gray-300"
                    onClick={() => history.push(`/mission/${mission._id.toString()}`)}>
                    <div className="text-xs text-gray-800 ">Voir la mission</div>
                  </button>
                </div>
              </Link>
            </div>
            <div className="border-x border-x-gray-200 basis-[40%]">
              <div className="flex flex-col justify-center items-center p-4 m-0 border-b border-b-gray-200">
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG prévisionnelles</div>
                {/* get duration du contrat ou de la mission ? */}
                <div className="font-bold text-2xl text-[#242526]">{contract?.missionDuration || "0"}h</div>
              </div>
              <div className="flex flex-col justify-center items-center p-4 m-0">
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG réalisées</div>
                <div className="flex items-center gap-2 font-bold text-2xl text-[#242526]">
                  <div>{application?.missionDuration || "0"}h</div>
                  <div className="group flex justify-center items-center cursor-pointer" onClick={() => setModalDurationOpen(true)}>
                    <div className="flex justify-center items-center h-8 w-8 group-hover:bg-gray-50 text-blue-500 rounded-full">
                      <Pencil width={16} height={16} />
                    </div>
                  </div>
                </div>
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
          <div className="mx-8 mt-8 pb-8">
            <div className="flex justify-between">
              <div className="text-lg leading-6 font-semibold">Documents</div>
              <div className="flex space-x-4 items-center">
                {optionsType.reduce((nmb, option) => nmb + application[option].length, 0) !== 0 && (
                  <div
                    className="group flex items-center rounded-lg text-blue-600 text-center text-sm py-2 px-10 border-blue-600 border-[1px] hover:bg-blue-600 hover:text-white transition duration-100 ease-in-out cursor-pointer"
                    onClick={() => setOpenAttachments((e) => !e)}>
                    Voir mes pièces jointes
                    <BsChevronDown className={`ml-3 text-blue-600 group-hover:text-white h-5 w-5 ${openAttachments ? "rotate-180" : ""}`} />
                  </div>
                )}
                <div
                  className="text-white bg-blue-600 rounded-full p-2 hover:bg-blue-500 cursor-pointer"
                  onClick={() => {
                    setModalDocument({
                      isOpen: true,
                      stepOne: true,
                    });
                  }}>
                  <HiPlus />
                </div>
              </div>
            </div>

            {openAttachments && (
              <div className="flex flex-row overflow-x-auto gap-4 my-4 w-full ">
                {optionsType.map(
                  (option, index) =>
                    application[option].length > 0 && (
                      <FileCard
                        key={index}
                        name={translateAddFilePhase2(option).toUpperCase()}
                        icon="reglement"
                        filled={application[option].length}
                        color="text-blue-600 bg-white"
                        status="Modifier"
                        onClick={() =>
                          setModalDocument({
                            isOpen: true,
                            name: option,
                            stepOne: false,
                          })
                        }
                      />
                    ),
                )}
              </div>
            )}
            <ModalPJ
              isOpen={modalDocument?.isOpen}
              name={modalDocument?.name}
              young={young}
              application={application}
              optionsType={optionsType}
              onCancel={async () => {
                setModalDocument({ isOpen: false });
                await getMission();
              }}
              onSend={async (type, multipleDocument) => {
                try {
                  const responseNotification = await api.post(`/application/${application._id}/notify/${SENDINBLUE_TEMPLATES.ATTACHEMENT_PHASE_2_APPLICATION}`, {
                    type,
                    multipleDocument,
                  });
                  if (!responseNotification?.ok) return toastr.error(translate(responseNotification?.code), "Une erreur s'est produite avec le service de notification.");
                  toastr.success("L'email a bien été envoyé");
                } catch (e) {
                  toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
                }
              }}
              onSave={async () => {
                setModalDocument({ isOpen: false });
                await getMission();
                await getApplication();
              }}
              typeChose={modalDocument?.stepOne}
            />
            <ModalConfirmWithMessage
              isOpen={modalDurationOpen}
              title="Validation de réalisation de mission"
              message={`Merci de valider le nombre d'heures effectuées par ${application.youngFirstName} pour la mission ${application.missionName}.`}
              type="number"
              onChange={() => setModalDurationOpen(false)}
              defaultInput={application.missionDuration}
              placeholder="Nombre d'heures"
              onConfirm={async (duration) => {
                try {
                  const { ok, code, data } = await api.put("/application", { _id: application._id, missionDuration: duration });
                  if (!ok) {
                    toastr.error("Une erreur s'est produite :", translate(code));
                  } else {
                    // onChangeApplication();
                    setApplication(data);
                    toastr.success("Mis à jour!");
                  }
                } catch (e) {
                  toastr.error("Une erreur s'est produite :", translate(e?.code));
                }
                setModalDurationOpen(false);
              }}
            />
          </div>
        </div>
        {/* {JSON.stringify(application)} */}
      </Wrapper>
    </div>
  );
}

const StatusContractPeople = ({ value, description, firstName, lastName, token, contract, target }) => (
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
    {value !== "VALIDATED" ? (
      <div className="mt-4">
        <div
          className="text-xs text-blue-500 cursor-pointer hover:underline"
          onClick={() => {
            copyToClipboard(`${appURL}/validate-contract?token=${token}`);
            toastr.success("Le lien a été copié dans le presse papier.");
          }}>
          Copier le lien de validation
        </div>
        <SendContractLink contract={contract} target={target} />
      </div>
    ) : null}
  </div>
);

function SendContractLink({ contract, target }) {
  const [modal, setModal] = React.useState({ isOpen: false, onConfirm: null });

  return (
    <>
      <div
        className="text-xs text-blue-500 cursor-pointer hover:underline"
        onClick={async () => {
          try {
            const email = contract[target + "Email"];
            setModal({
              isOpen: true,
              title: "Envoie de contrat par mail",
              message: "Souhaitez-vous renvoyer le mail avec le lien de validation du contrat d'engagement à " + email,
              onConfirm: async () => {
                const { ok } = await api.post(`/contract/${contract._id}/send-email/${target}`);
                if (!ok) return toastr.error("Une erreur est survenue lors de l'envoi du mail");
                toastr.success("L'email a bien été envoyé", email);
              },
            });
          } catch (e) {
            toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
          }
        }}>
        ✉️ Renvoyer le lien par email
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
}
