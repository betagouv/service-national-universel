import React from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory, useParams } from "react-router-dom";

import api from "../../../../services/api";
import { appURL } from "../../../../config";
import { capture } from "../../../../sentry";
import { SENDINBLUE_TEMPLATES, translate, translateApplication, translateAddFilePhase2WithoutPreposition } from "snu-lib";
import { copyToClipboard } from "../../../../utils";
import downloadPDF from "../../../../utils/download-pdf";
import ReactLoading from "react-loading";

import IconDomain from "../../../../components/IconDomain";
import { AiFillClockCircle } from "react-icons/ai";
import rubberStampValided from "../../../../assets/rubberStampValided.svg";
import rubberStampNotValided from "../../../../assets/rubberStampNotValided.svg";
import ReactTooltip from "react-tooltip";

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
import Bell from "../../../../assets/icons/Bell";
import Tag from "../../../../components/Tag";

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
  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />
      <div className="m-8 rounded-xl bg-white p-8 shadow-sm">
        <div className="grid grid-cols-6">
          <div>
            <button
              onClick={history.goBack}
              className="flex h-8 w-8 items-center justify-center space-x-1 rounded-full border-[1px] border-gray-100 bg-gray-100 hover:border-gray-300">
              <LeftArrow stroke={"#374151"} width={15} />
            </button>
          </div>
          <div className="col-span-4 flex items-center justify-center gap-4">
            <p className="pb-1 text-2xl font-bold">Espace&nbsp;candidature</p>
            <p className={`h-min rounded-sm px-2 py-1 text-xs font-normal ${theme.background[application.status]} ${theme.text[application.status]} `}>
              {translateApplication(application.status)}
            </p>
          </div>
          {/* {application?.contractId && ( */}
          <div className="flex justify-end">
            <button
              className="flex items-center gap-2 rounded border-[1px] border-gray-100 bg-gray-100 py-2 px-4 hover:border-gray-300"
              onClick={() => history.push(`/volontaire/${young._id.toString()}/phase2/application/${application._id.toString()}/historique`)}>
              <img src={Clock} /> <div className="text-xs text-gray-800 ">Historique</div>
            </button>
          </div>
          {/* )} */}
        </div>

        <div className="space-y-16">
          <>
            <div className="my-8 grid grid-cols-3 grid-rows-2 border-t border-b">
              <div className="relative col-span-2 row-span-2 flex w-full flex-col justify-center border-r py-4 pr-4">
                {/* mission info */}
                <div className="flex gap-5">
                  {/* icon */}
                  <div className="flex items-center">
                    <IconDomain domain={mission?.isMilitaryPreparation === "true" ? "PREPARATION_MILITARY" : mission?.mainDomain} />
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{mission.structureName}</div>
                    <div className="text-font-gray-800 text-2xl font-bold">{mission.name}</div>
                    {/* tags */}
                    {tags && (
                      <div className="inline-flex flex-wrap gap-2 pt-2">
                        {tags.map((tag, index) => (
                          <Tag key={index} tag={tag} />
                        ))}
                        {mission.isMilitaryPreparation === "true" && <Tag tag="Préparation militaire" />}
                      </div>
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 z-10 flex h-14 justify-end px-4 pt-4">
                  <a
                    className="flex items-center gap-2 rounded border-[1px] border-gray-100 bg-gray-100 py-2 px-4 text-xs text-gray-800 hover:border-gray-300"
                    href={`/mission/${mission._id}`}>
                    Voir la mission
                  </a>
                </div>
              </div>

              <div className="flex h-28 flex-col items-center justify-center gap-1 border-b">
                <div className="text-xs uppercase tracking-wide text-gray-400">Heures de MIG prévisionnelles</div>
                <div className="text-2xl font-bold text-gray-800">{contract?.missionDuration || "0"}h</div>
              </div>

              <div className="flex flex-col items-center justify-center gap-1">
                <div className="text-xs uppercase tracking-wide text-gray-400">Heures de MIG réalisées</div>
                <div className="grid grid-cols-3">
                  <div />
                  <p className="text-2xl font-bold text-gray-800">{application?.missionDuration || "0"}h</p>
                  {["VALIDATED", "IN_PROGRESS", "DONE"].includes(application.status) && (
                    <div className="group flex cursor-pointer items-center justify-center" onClick={() => setModalDurationOpen(true)}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-blue-500 group-hover:bg-gray-50">
                        <Pencil width={16} height={16} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
          {["VALIDATED", "IN_PROGRESS", "DONE"].includes(application.status) ? (
            <>
              <div className="space-y-4 rounded-xl bg-gray-50 p-6">
                <div className="flex justify-between">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-lg font-bold">Contrat d’engagement en mission d’intérêt général</div>
                    {contractStatus === "SENT" && (
                      <Link to={`/volontaire/${young._id}/phase2/application/${application._id}/contrat`} className="flex items-center justify-center gap-2 text-xs text-blue-600">
                        <Pencil width={14} height={14} />
                        <div>Modifier le contrat</div>
                      </Link>
                    )}
                  </div>
                  {contractStatus === "SENT" ? (
                    <div className="flex items-center rounded-sm bg-sky-100 px-2 text-xs font-normal text-sky-600">
                      <AiFillClockCircle className="text-sky-400" />
                      <div>Contrat envoyé</div>
                    </div>
                  ) : contractStatus === "DRAFT" ? (
                    <div className="flex items-center rounded-sm bg-orange-500 px-2 text-xs font-normal text-white">
                      <Bell />
                      <div>Contrat en brouillon</div>
                    </div>
                  ) : contractStatus === "VALIDATED" ? (
                    <div className="flex items-center rounded-sm bg-[#71C784] px-2 text-xs font-normal text-white">
                      <Check />
                      <div>Contrat signé</div>
                    </div>
                  ) : null}
                </div>
                {contractStatus === "DRAFT" && (
                  <div className="text-sm">
                    Vous devez renseigner ce contrat d&apos;engagement puis l&apos;envoyer pour validation aux représentant(s) légal(aux) du volontaire, au tuteur de la mission et
                    au représentant de l&apos;État
                  </div>
                )}
                {contractStatus === "SENT" && (
                  <div className="text-sm">
                    Ce contrat doit être validé par les représentant(s) légal(aux) du volontaire, le tuteur de la mission et le représentant de l&apos;État.
                  </div>
                )}
                {contractStatus === "VALIDATED" && (
                  <div className="text-sm">
                    Ce contrat a été validé par les représentant(s) légal(aux) du volontaire, le tuteur de la mission et le représentant de l&apos;État.
                  </div>
                )}

                {contract?.invitationSent ? (
                  <div className="space-y-6">
                    <div className="flex gap-10">
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
                          token={contract?.youngContractToken}
                          description="Volontaire"
                          firstName={contract?.youngFirstName}
                          lastName={contract?.youngLastName}
                          target="young"
                          contract={contract}
                          status={contract?.youngContractStatus}
                          validationDate={contract?.youngContractValidationDate}
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
                    {contractStatus === "VALIDATED" && (
                      <button onClick={() => downloadContract()} className="flex items-center justify-center gap-2 rounded-md bg-[#71C784] py-2 px-3">
                        {loadingContract ? (
                          <div className="flex items-center justify-center">
                            <ReactLoading type="spin" color="#FFFFFF" width={20} height={20} />
                          </div>
                        ) : (
                          <div className="text-white">Télécharger le contrat</div>
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <a
                    href={`/volontaire/${young._id}/phase2/application/${application._id}/contrat`}
                    className="flex w-48 items-center justify-center rounded-md bg-blue-600 py-2 text-white hover:brightness-110 active:brightness-125">
                    Editer
                  </a>
                )}
              </div>
              <div className="space-y-6">
                <p className="text-lg font-semibold leading-6">Documents</p>
                <div className="flex w-full gap-6 overflow-x-auto">
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
                  {optionsType.reduce((acc, option) => acc + (application[option].length > 0 ? 1 : 0), 0) < optionsType.length && (
                    <div
                      onClick={() => {
                        setModalDocument({
                          isOpen: true,
                          stepOne: true,
                        });
                      }}
                      className="group flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-lg border-[1px] border-dashed border-blue-600 text-center transition hover:border-solid hover:bg-blue-50">
                      <div className="flex items-center gap-1 rounded-lg border-[1px] border-blue-600 px-3 py-2 text-blue-600 transition hover:brightness-110 active:brightness-125 group-hover:bg-blue-600 group-hover:text-white">
                        <HiPlus />
                        Ajouter une pièce jointe
                      </div>
                    </div>
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
                      const { ok, code, data } = await api.put("/application", {
                        _id: application._id,
                        missionDuration: duration,
                      });
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
  <div className="space-y-1">
    <div className="flex items-center gap-2" data-tip data-for={`${firstName}${lastName}-validation`}>
      <div className="w-8">
        {value === "VALIDATED" ? <img src={rubberStampValided} alt="rubberStampValided" /> : <img src={rubberStampNotValided} alt="rubberStampNotValided" />}
      </div>
      <div>
        <p className="max-w-[200px] truncate font-semibold">
          {firstName} {lastName?.toUpperCase()}
        </p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      {value !== "VALIDATED" ? (
        <ReactTooltip id={`${firstName}${lastName}-validation`} type="light" effect="solid">
          En attente de signature
        </ReactTooltip>
      ) : null}
    </div>
    {value !== "VALIDATED" ? (
      <div className="mt-2">
        <div
          className="cursor-pointer text-xs text-blue-600"
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
        className="cursor-pointer text-xs text-blue-600"
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
        Renvoyer le lien par email
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

function FileCard({ name, filled, icon, onClick, description, showNumber = false }) {
  return (
    <section className="flex h-64 w-64 flex-col items-center justify-between rounded-xl bg-gray-50 px-4 pt-4 text-center">
      <FileIcon filled={filled} icon={icon} />
      <section>
        <p className="mt-2 text-base font-bold">{name}</p>
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
