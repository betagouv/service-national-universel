import React from "react";
import { toastr } from "react-redux-toastr";
import { useParams } from "react-router";
import { Link, useHistory } from "react-router-dom";

import api from "../../../../services/api";
import { appURL } from "../../../../config";
import { capture } from "../../../../sentry";
import { SENDINBLUE_TEMPLATES, translate, translateApplication, translateAddFilePhase2, copyToClipboard } from "../../../../utils";
import downloadPDF from "../../../../utils/download-pdf";
import ReactLoading from "react-loading";

import IconDomain from "../../../../components/IconDomain";
import { AiFillClockCircle } from "react-icons/ai";
import rubberStampValided from "../../../../assets/rubberStampValided.svg";
import rubberStampNotValided from "../../../../assets/rubberStampNotValided.svg";
import ReactTooltip from "react-tooltip";
import { getAge } from "snu-lib";

import { HiPlus } from "react-icons/hi";
import ModalPJ from "./components/ModalPJ";
import Clock from "../../../../assets/Clock.svg";
import LeftArrow from "../../../../assets/icons/ArrowNarrowLeft";
import Pencil from "../../../../assets/icons/Pencil";
import ModalConfirm from "../../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../../components/modals/ModalConfirmWithMessage";
import YoungHeader from "../../../phase0/components/YoungHeader";
import Loader from "../../../../components/Loader";
import Check from "../../../../assets/icons/Check";
import FileIcon from "../../../../assets/FileIcon";
import Download from "../../../../assets/icons/Download";

export default function Phase2Application({ young, onChange }) {
  const [application, setApplication] = React.useState(null);
  const [mission, setMission] = React.useState();
  const [tags, setTags] = React.useState();
  const [contract, setContract] = React.useState(null);
  const [modalDocument, setModalDocument] = React.useState({ isOpen: false });
  const [modalDurationOpen, setModalDurationOpen] = React.useState(false);
  const [contractStatus, setContractStatus] = React.useState(null);
  let { applicationId } = useParams();
  const history = useHistory();
  const [loadingContract, setLoadingContract] = React.useState(false);

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
        console.log("get contract", data);
        if (!ok) {
          capture(code);
          return toastr.error("Oups, une erreur est survenue", code);
        }
        setContract(data);
        checkStatusContract(data);
      } else {
        setContractStatus("DRAFT");
      }
    };
    getContract();
  }, [application]);
  const checkStatusContract = (contract) => {
    if (!contract.invitationSent || contract.invitationSent === "false") return setContractStatus("DRAFT");
    // To find if everybody has validated we count actual tokens and number of validated. It should be improved later.
    const tokenKeys = ["projectManagerToken", "structureManagerToken"];
    const validateKeys = ["projectManagerStatus", "structureManagerStatus"];

    const isYoungAdult = getAge(contract.youngBirthdate) >= 18;
    if (isYoungAdult) {
      tokenKeys.push("youngContractToken");
      validateKeys.push("youngContractStatus");
    } else {
      tokenKeys.push("parent1Token", "parent2Token");
      validateKeys.push("parent1Status", "parent2Status");
    }

    const tokenCount = tokenKeys.reduce((acc, current) => (contract[current] ? acc + 1 : acc), 0);
    const validatedCount = validateKeys.reduce((acc, current) => (contract[current] === "VALIDATED" ? acc + 1 : acc), 0);

    if (validatedCount >= tokenCount) {
      return setContractStatus("VALIDATED");
    } else {
      return setContractStatus("SENT");
    }
  };
  const transformNameDocument = (value) => {
    const string = translateAddFilePhase2(value).slice(3);
    return string[0].toUpperCase() + string.slice(1);
  };
  const downloadContract = async () => {
    try {
      setLoadingContract(true);
      await downloadPDF({
        url: `/contract/${application.contractId}/download`,
        fileName: `${young.firstName} ${young.lastName} - contrat ${application.contractId}.pdf`,
      });
      setLoadingContract(false);
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors du téléchargement du contrat");
      setLoadingContract(false);
    }
  };
  if (!application || !mission) return <Loader />;
  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />
      <div className="p-7">
        <div className="bg-white w-full h-full rounded-lg px-4">
          <div className="flex items-center justify-between py-6">
            <button
              onClick={history.goBack}
              className="h-8 w-8 flex items-center justify-center space-x-1 bg-gray-100 rounded-full border-[1px] border-gray-100 hover:border-gray-300">
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
            {application?.contractId ? (
              <button
                className="flex items-center gap-2 bg-gray-100 rounded py-2 px-4 border-[1px] border-gray-100 hover:border-gray-300"
                onClick={() => history.push(`/volontaire/${young._id.toString()}/phase2/application/${application._id.toString()}/historique`)}>
                <img src={Clock} /> <div className="text-xs text-gray-800 ">Historique</div>
              </button>
            ) : (
              <div />
            )}
          </div>
          <hr />
          <div className="flex relative items-center justify-center w-full rounded-xl  border-[1px] border-white hover:border-gray-200">
            {/* Choix*/}
            <div className="flex flex-col w-full pr-2 flex-1 justify-between basis-[60%] h-full">
              <div className="w-full flex justify-end">
                <button
                  className="flex items-center gap-2 bg-gray-100 rounded py-2 px-4 border-[1px] border-gray-100 hover:border-gray-300"
                  onClick={() => history.push(`/mission/${mission._id.toString()}`)}>
                  <div className="text-xs text-gray-800 ">Voir la mission</div>
                </button>
              </div>
              <Link className="flex flex-col w-full" to={`/mission/${application.missionId}`}>
                {/* mission info */}
                <div className="flex flex-1 justify-between items-start">
                  {/* icon */}
                  <div className="flex items-center mr-4">
                    <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
                  </div>
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
                </div>
              </Link>
              <div className="flex flex-1 py-2" />
            </div>
            <div className="border-x border-x-gray-200 basis-[40%] items-center justify-center my-4">
              <div className="flex flex-col justify-center items-center p-4 m-0 border-b border-b-gray-200">
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG prévisionnelles</div>
                {/* get duration du contrat ou de la mission ? */}
                <div className="font-bold text-2xl text-[#242526]">{contract?.missionDuration || "0"}h</div>
              </div>
              <div className="flex flex-col justify-center items-center p-4 m-0">
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG réalisées</div>
                <div className="flex items-center gap-2 font-bold text-2xl text-[#242526]">
                  <div>{application?.missionDuration || "0"}h</div>
                  {["VALIDATED", "IN_PROGRESS", "DONE"].includes(application.status) ? (
                    <div className="group flex justify-center items-center cursor-pointer" onClick={() => setModalDurationOpen(true)}>
                      <div className="flex justify-center items-center h-8 w-8 group-hover:bg-gray-50 text-blue-500 rounded-full">
                        <Pencil width={16} height={16} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <hr className="mb-4" />
          {["VALIDATED", "IN_PROGRESS", "DONE"].includes(application.status) ? (
            <>
              <div className="p-4">
                <div className="bg-gray-50 rounded-lg  px-10 py-6">
                  <div className="flex justify-between">
                    <div className="text-lg font-bold">Contrat d’engagement en mission d’intérêt général</div>
                    {contractStatus === "DRAFT" ? (
                      <div className="text-xs font-normal px-2  bg-orange-500 text-white rounded-sm items-center flex space-x-1">
                        <svg width="14" height="14" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M21.7521 14.9194L19.4615 12.7116V9.78696C19.4589 7.76582 18.6789 5.81741 17.2722 4.31848C15.8656 2.81955 13.9323 1.87659 11.8462 1.67194V0H10.1538V1.67194C8.06772 1.87659 6.13441 2.81955 4.72777 4.31848C3.32114 5.81741 2.54109 7.76582 2.53846 9.78696V12.7116L0.247923 14.9194C0.0892274 15.0723 4.7924e-05 15.2797 0 15.496V17.9428C0 18.1591 0.0891481 18.3665 0.247833 18.5195C0.406517 18.6724 0.62174 18.7583 0.846154 18.7583H6.76923V19.392C6.75082 20.4267 7.12919 21.4315 7.83182 22.214C8.53444 22.9964 9.51192 23.5014 10.5769 23.6322C11.1652 23.6885 11.7591 23.6254 12.3205 23.4471C12.8819 23.2688 13.3984 22.9792 13.8368 22.597C14.2751 22.2147 14.6256 21.7483 14.8657 21.2276C15.1057 20.707 15.2301 20.1437 15.2308 19.5739V18.7583H21.1538C21.3783 18.7583 21.5935 18.6724 21.7522 18.5195C21.9109 18.3665 22 18.1591 22 17.9428V15.496C22 15.2797 21.9108 15.0723 21.7521 14.9194ZM13.5385 19.5739C13.5385 20.2228 13.271 20.8452 12.795 21.304C12.3189 21.7629 11.6732 22.0207 11 22.0207C10.3268 22.0207 9.68109 21.7629 9.20504 21.304C8.72898 20.8452 8.46154 20.2228 8.46154 19.5739V18.7583H13.5385V19.5739ZM20.3077 17.1272H1.69231V15.8337L3.98285 13.6259C4.14154 13.473 4.23072 13.2656 4.23077 13.0493V9.78696C4.23077 8.05652 4.94395 6.39695 6.21343 5.17334C7.48291 3.94974 9.20469 3.26232 11 3.26232C12.7953 3.26232 14.5171 3.94974 15.7866 5.17334C17.056 6.39695 17.7692 8.05652 17.7692 9.78696V13.0493C17.7693 13.2656 17.8585 13.473 18.0172 13.6259L20.3077 15.8337V17.1272Z"
                            fill="#FFFFFF"
                          />
                        </svg>
                        <div>Contrat en brouillon</div>
                      </div>
                    ) : null}
                    {contractStatus === "VALIDATED" ? (
                      <div className="text-xs font-normal px-2  bg-green-400 rounded-sm items-center flex space-x-1">
                        <Check className="text-white" />
                        <div className="text-white">Contrat signé</div>
                      </div>
                    ) : null}
                    {contractStatus === "SENT" ? (
                      <div className="text-xs font-normal px-2  bg-sky-100 text-sky-500 rounded-sm items-center flex space-x-1">
                        <AiFillClockCircle className="text-sky-500" />
                        <div>Contrat envoyé</div>
                      </div>
                    ) : null}
                  </div>
                  <div className="text-sm mt-1">Ce contrat doit être validé par vos représentant(s) légal(aux), votre tuteur de mission et le référent départemental.</div>
                  {contract?.invitationSent ? (
                    <div>
                      <div className="grid gap-4 grid-cols-4 mt-4">
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
                          <StatusContractPeople
                            value={contract?.youngContractStatus}
                            description="Volontaire"
                            firstName={contract?.youngFirstName}
                            lastName={contract?.youngLastName}
                          />
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
                      {contractStatus === "VALIDATED" ? (
                        <div onClick={() => downloadContract()} className="cursor-pointer py-2 rounded-md mt-7 h-10 bg-green-400 w-48 max-w-xs items-center flex justify-center">
                          {loadingContract ? (
                            <div className="h-10 flex items-center justify-center">
                              <ReactLoading type="spin" color="#FFFFFF" width={20} height={20} />
                            </div>
                          ) : (
                            <div className="text-white">Télécharger le contrat</div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        history.push(`/volontaire/${young._id}/phase2/application/${application._id}/contrat`);
                      }}
                      className="cursor-pointer py-2 rounded-md mt-7 bg-blue-600 w-48 max-w-xs items-center flex justify-center">
                      <div className="text-white">Editer</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mx-8 mt-8 pb-8">
                <div className="flex justify-between">
                  <div className="text-lg leading-6 font-semibold">Documents</div>
                </div>
                <div className="flex flex-row overflow-x-auto gap-4 my-4 w-full items-stretch">
                  {optionsType.map(
                    (option, index) =>
                      application[option].length > 0 && (
                        <FileCard
                          key={index}
                          name={transformNameDocument(option)}
                          icon="reglement"
                          filled={application[option].length}
                          showNumber
                          color="text-blue-600 bg-white"
                          status="Modifier"
                          onClick={() =>
                            setModalDocument({
                              isOpen: true,
                              name: option,
                              stepOne: false,
                              defaultOption: option,
                            })
                          }
                        />
                      ),
                  )}
                  {optionsType.reduce((acc, option) => acc + (application[option].length > 0 ? 1 : 0), 0) < optionsType.length && (
                    <section
                      onClick={() => {
                        setModalDocument({
                          isOpen: true,
                          stepOne: true,
                        });
                      }}
                      className={`group basis-1/4 min-h-[230px] border-[1px] border-dashed border-blue-600 rounded-lg m-2 text-center flex flex-col items-center justify-center p-4 hover:border-solid hover:bg-blue-50 cursor-pointer`}>
                      <div className="flex items-center gap-1 px-3 py-2 border-[1px] border-blue-600 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white ">
                        <HiPlus />
                        Ajouter une pièce jointe
                      </div>
                    </section>
                  )}
                </div>
                <ModalPJ
                  isOpen={modalDocument?.isOpen}
                  name={modalDocument?.name}
                  defaultOption={modalDocument?.defaultOption}
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
                      setModalDocument({ isOpen: false });
                    } catch (e) {
                      toastr.error("Une erreur est survenue lors de l'envoi du mail", e.message);
                    }
                  }}
                  onSave={async () => {
                    await getMission();
                    await getApplication();
                  }}
                  closeModal={() => setModalDocument({ isOpen: false })}
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
            </>
          ) : (
            <div className="pt-5"></div>
          )}
        </div>
      </div>
    </>
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

function FileCard({ name, filled, icon, onClick, tw, description, showNumber = false }) {
  return (
    <section className={`basis-1/4  bg-gray-50 rounded-lg m-2 text-center flex flex-col items-center justify-between px-4 pt-4 ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section>
        <p className="text-base font-bold mt-2">{name}</p>
        {description ? <p className="ttext-xs leading-4 font-normal mt-1">{description}</p> : null}
      </section>
      {showNumber ? (
        <div className="text-gray-500">
          {filled} {filled > 1 ? "documents" : "document"}{" "}
        </div>
      ) : null}
      <div></div>
      <div className="flex flex-col w-full justify-end items-end self-end my-2">
        <div
          onClick={() => onClick()}
          className="relative border-red-600 border-3 self-endtransition duration-150 flex rounded-full bg-blue-600 p-2 items-center justify-center hover:scale-110 ease-out hover:ease-in cursor-pointer">
          <Download className=" text-indigo-100 bg-blue-600" />
        </div>
      </div>
    </section>
  );
}
