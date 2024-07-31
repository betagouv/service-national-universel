import React from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory, useParams } from "react-router-dom";

import api from "../../../services/api";
import { appURL } from "../../../config";
import { capture } from "../../../sentry";
import { SENDINBLUE_TEMPLATES, translate, translateApplication, translateAddFilePhase2WithoutPreposition } from "snu-lib";
import { copyToClipboard, ENABLE_PM } from "../../../utils";
import downloadPDF from "../../../utils/download-pdf";
import ReactLoading from "react-loading";

import IconDomain from "../../../components/IconDomain";
import { AiFillClockCircle } from "react-icons/ai";
import rubberStampValided from "../../../assets/rubberStampValided.svg";
import rubberStampNotValided from "../../../assets/rubberStampNotValided.svg";
import ReactTooltip from "react-tooltip";

import { HiPlus } from "react-icons/hi";
import ModalPJ from "../../volontaires/view/phase2bis/components/ModalPJ";
import Pencil from "../../../assets/icons/Pencil";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import YoungHeader from "../../phase0/components/YoungHeader";
import Loader from "../../../components/Loader";
import Check from "../../../assets/icons/Check";
import FileIcon from "../../../assets/FileIcon";
import Download from "../../../assets/icons/Download";
import Bell from "../../../assets/icons/Bell";
import Breadcrumbs from "../../../components/Breadcrumbs";

import Dossier from "./dossier";
import Phase2MilitaryPreparation from "./phase2MilitaryPreparationV2";

export default function Phase2Application({ young, onChange, currentTab = "candidature" }) {
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
      if (code === "INVALID_PARAMS") {
        return toastr.error("Mauvaise URL", "Cette URL n'est pas valide");
      }
      capture(new Error(code));
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
      capture(new Error(code));
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
          capture(new Error(code));
          return toastr.error("Oups, une erreur est survenue", code);
        }
        setContract(data);
        setContractStatus(application.contractStatus);
      } else {
        setContractStatus("DRAFT");
      }
    };
    getContract();
  }, [application]);

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

  if (currentTab === "dossier")
    return (
      <>
        <Breadcrumbs items={[{ label: "Mes candidatures", to: "/volontaire/list/all" }, { label: "Fiche candidature" }]} />
        <YoungHeader young={young} tab={currentTab} onChange={onChange} isStructure={true} applicationId={application?._id} />
        <Dossier young={young} />
      </>
    );
  return (
    <>
      <Breadcrumbs items={[{ label: "Mes candidatures", to: "/volontaire/list/all" }, { label: "Fiche candidature" }]} />
      <YoungHeader young={young} tab={"candidature"} onChange={onChange} isStructure={true} applicationId={application?._id} />
      {ENABLE_PM && mission?.isMilitaryPreparation === "true" && <Phase2MilitaryPreparation young={young} FileCard={FileCard} />}

      <div className="p-7">
        <div className="h-full w-full rounded-lg bg-white px-4">
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div>Espace&nbsp;candidature </div>
              <div className="flex items-center justify-end">
                <div className={`text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} rounded-sm px-1.5 py-[5px]`}>
                  {translateApplication(application.status)}
                </div>
              </div>
            </div>
          </div>
          <hr />
          <div className="relative flex w-full items-center justify-center rounded-xl  border-[1px] border-white hover:border-gray-200">
            {/* Choix*/}
            <div className="flex h-full w-full flex-1 basis-[60%] flex-col justify-between pr-2">
              <div className="flex w-full justify-end">
                <button
                  className="flex items-center gap-2 rounded border-[1px] border-gray-100 bg-gray-100 py-2 px-4 hover:border-gray-300"
                  onClick={() => history.push(`/mission/${mission._id.toString()}`)}>
                  <div className="text-xs text-gray-800 ">Voir la mission</div>
                </button>
              </div>
              <Link className="flex w-full flex-col" to={`/mission/${application.missionId}`}>
                {/* mission info */}
                <div className="flex flex-1 items-start justify-between">
                  {/* icon */}
                  <div className="mr-4 flex items-center">
                    <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <div className="mb-1 text-[11px] font-medium uppercase tracking-wider text-gray-500">{mission.structureName}</div>
                    <div className="mb-2 text-base font-bold text-[#242526]">{mission.name}</div>
                    {/* tags */}
                    {tags && (
                      <div className=" inline-flex flex-wrap">
                        {tags.map((tag, index) => {
                          return (
                            <div
                              key={index}
                              className=" mb-2 mt-1 mr-1 flex items-center justify-center rounded-full border-[1px] border-gray-200 px-3 py-0.5 text-[11px]  font-medium text-gray-600 ">
                              {tag}
                            </div>
                          );
                        })}
                        {mission.isMilitaryPreparation === "true" ? (
                          <div className="mb-2 mr-1 flex items-center justify-center rounded-full border-[1px] border-gray-200 bg-blue-900 px-3 py-0.5 text-[11px] font-medium text-white">
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
            <div className="my-4 basis-[40%] items-center justify-center border-x border-x-gray-200">
              <div className="m-0 flex flex-col items-center justify-center border-b border-b-gray-200 p-4">
                <div className="text-[11px] uppercase tracking-[5%] text-[#7E858C]">Heures de MIG prévisionnelles</div>
                {/* get duration du contrat ou de la mission ? */}
                <div className="text-2xl font-bold text-[#242526]">{contract?.missionDuration || "0"}h</div>
              </div>
              <div className="m-0 flex flex-col items-center justify-center p-4">
                <div className="text-[11px] uppercase tracking-[5%] text-[#7E858C]">Heures de MIG réalisées</div>
                <div className="flex items-center gap-2 text-2xl font-bold text-[#242526]">
                  <div>{application?.missionDuration || "0"}h</div>
                  {["VALIDATED", "IN_PROGRESS", "DONE"].includes(application.status) ? (
                    <div className="group flex cursor-pointer items-center justify-center" onClick={() => setModalDurationOpen(true)}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-blue-500 group-hover:bg-gray-50">
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
                <div className="rounded-lg bg-gray-50  px-10 py-6">
                  <div className="flex justify-between">
                    <div className="flex flex-row items-center justify-center gap-4">
                      <div className="text-lg font-bold">Contrat d’engagement en mission d’intérêt général</div>
                      {contractStatus === "SENT" ? (
                        <div
                          onClick={() => {
                            history.push(`/volontaire/${young._id}/phase2/application/${application._id}/contrat`);
                          }}
                          className="flex cursor-pointer flex-row items-center justify-center gap-2 text-xs text-blue-500">
                          <Pencil width={14} height={14} />
                          <div>Modifier le contrat</div>
                        </div>
                      ) : null}
                    </div>
                    {contractStatus === "SENT" ? (
                      <div className="flex items-center space-x-1  rounded-sm bg-sky-100 px-2 text-xs font-normal text-sky-500">
                        <AiFillClockCircle className="text-sky-500" />
                        <div>Contrat envoyé</div>
                      </div>
                    ) : contractStatus === "DRAFT" ? (
                      <div className="flex items-center space-x-1  rounded-sm bg-orange-500 px-2 text-xs font-normal text-white">
                        <Bell />
                        <div>Contrat en brouillon</div>
                      </div>
                    ) : contractStatus === "VALIDATED" ? (
                      <div className="flex items-center space-x-1  rounded-sm bg-green-400 px-2 text-xs font-normal">
                        <Check className="text-white" />
                        <div className="text-white">Contrat signé</div>
                      </div>
                    ) : null}
                  </div>
                  {contractStatus === "DRAFT" ? (
                    <div className="mt-1 text-sm">
                      Vous devez renseigner ce contrat d&apos;engagement puis l&apos;envoyer pour validation aux représentant(s) légal(aux) du volontaire, au tuteur de la mission
                      et au représentant de l&apos;État
                    </div>
                  ) : null}
                  {contractStatus === "SENT" ? (
                    <div className="mt-1 text-sm">
                      Ce contrat doit être validé par les représentant(s) légal(aux) du volontaire, le tuteur de la mission et le représentant de l&apos;État.
                    </div>
                  ) : null}
                  {contractStatus === "VALIDATED" ? (
                    <div className="mt-1 text-sm">
                      Ce contrat a été validé par les représentant(s) légal(aux) du volontaire, le tuteur de la mission et le représentant de l&apos;État.
                    </div>
                  ) : null}

                  {contract?.invitationSent ? (
                    <div>
                      <div className="mt-4 grid grid-cols-4 gap-4">
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
                        <div onClick={() => downloadContract()} className="mt-7 flex h-10 w-48 max-w-xs cursor-pointer items-center justify-center rounded-md bg-green-400 py-2">
                          {loadingContract ? (
                            <div className="flex h-10 items-center justify-center">
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
                      className="mt-7 flex w-48 max-w-xs cursor-pointer items-center justify-center rounded-md bg-blue-600 py-2">
                      <div className="text-white">Editer</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="mx-8 mt-8 pb-8">
                <div className="flex justify-between">
                  <div className="text-lg font-semibold leading-6">Documents</div>
                </div>
                <div className="my-4 flex flex-row flex-wrap justify-start gap-4 self-center">
                  {optionsType.map(
                    (option, index) =>
                      application[option].length > 0 && (
                        <FileCard
                          key={index}
                          name={translateAddFilePhase2WithoutPreposition(option)}
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
                  {/* case du modele d'avenant */}
                  <FileCard
                    key={"model-avenant"}
                    name={"Avenant au contat d'engagement"}
                    icon="reglement"
                    filled={true}
                    color="text-blue-600 bg-white"
                    topSubComment="Modèle à télécharger"
                    status="Modifier"
                    onClick={() => {
                      window.open("https://cellar-c2.services.clever-cloud.com/cni-bucket-prod/file/modele_avenant_au_contrat_phase2.pdf", "_blank");
                    }}
                  />
                  {optionsType.reduce((acc, option) => acc + (application[option].length > 0 ? 1 : 0), 0) < optionsType.length && (
                    <section
                      onClick={() => {
                        setModalDocument({
                          isOpen: true,
                          stepOne: true,
                        });
                      }}
                      className={`group m-2 flex min-h-[230px] w-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-[1px] border-dashed border-blue-600 p-4 text-center hover:border-solid hover:bg-blue-50`}>
                      <div className="flex items-center gap-1 rounded-lg border-[1px] border-blue-600 px-3 py-2 text-blue-600 group-hover:bg-blue-600 group-hover:text-white ">
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
  <div className="flex flex-col items-start justify-center ">
    <div className="flex flex-col items-start justify-center " data-tip data-for={`${firstName}${lastName}-validation`}>
      <div className="mr-2">
        {value === "VALIDATED" ? <img src={rubberStampValided} alt="rubberStampValided" /> : <img src={rubberStampNotValided} alt="rubberStampNotValided" />}
      </div>
      <div>
        <div className="flex space-x-2 font-semibold">
          <div>{firstName}</div>
          <div>{lastName?.toUpperCase()}</div>
        </div>
        <div className="text-xs text-gray-500">{description}</div>
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
          className="cursor-pointer text-xs text-blue-500 hover:underline"
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
        className="cursor-pointer text-xs text-blue-500 hover:underline"
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

function FileCard({ name, filled, icon, onClick, tw, description, showNumber = false, topSubComment }) {
  return (
    <section className={` m-2 flex flex-col items-center justify-between rounded-lg bg-gray-50 px-4 pt-4 text-center ${tw} w-[300px]`}>
      <FileIcon filled={filled} icon={icon} />
      <section className="mt-2">
        {topSubComment ? <p className="text-xs">{topSubComment}</p> : null}
        <p className="text-base font-bold">{name}</p>
        {description ? <p className="ttext-xs mt-1 font-normal leading-4">{description}</p> : null}
      </section>
      {showNumber ? (
        <div className="text-gray-500">
          {filled} {filled > 1 ? "documents" : "document"}{" "}
        </div>
      ) : null}
      <div></div>
      <div className="my-2 flex w-full flex-col items-end justify-end self-end">
        <div
          onClick={() => onClick()}
          className="border-3 self-endtransition relative flex cursor-pointer items-center justify-center rounded-full border-red-600 bg-blue-600 p-2 duration-150 ease-out hover:scale-110 hover:ease-in">
          <Download className=" bg-blue-600 text-indigo-100" />
        </div>
      </div>
    </section>
  );
}
