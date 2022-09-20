import { ReactiveBase, ReactiveComponent } from "@appbaseio/reactivesearch";
import React, { useEffect, useState, useRef } from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import Loader from "../../../../components/Loader";
import { apiURL } from "../../../../config";
import api from "../../../../services/api";
import { APPLICATION_STATUS, ES_NO_LIMIT, formatStringDateTimezoneUTC, translate, translateApplication, ROLES, colors, SENDINBLUE_TEMPLATES } from "../../../../utils";
import { capture } from "../../../../sentry";
import IconDomain from "../../../../components/IconDomain";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import ModalConfirmWithMessage from "../../../../components/modals/ModalConfirmWithMessage";
import ModalConfirm from "../../../../components/modals/ModalConfirm";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import LoadingButton from "../../../../components/buttons/LoadingButton";

export default function ApplicationList({ young, onChangeApplication }) {
  const [applications, setApplications] = useState(null);
  const getExportQuery = () => ({ query: { bool: { filter: { term: { "youngId.keyword": young._id } } } }, sort: [{ "priority.keyword": "asc" }], size: ES_NO_LIMIT });
  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  useEffect(() => {
    getApplications();
  }, []);

  const getApplications = async () => {
    if (!young) return;
    const { ok, data, code } = await api.get(`/young/${young._id}/application`);
    if (!ok) {
      capture(code);
      return toastr.error("Oups, une erreur est survenue", code);
    }
    data.sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0));
    return setApplications(data);
  };

  if (!applications) return <Loader />;
  return (
    <div className="p-1">
      <div className="flex mx-14 mb-2 justify-end">
        {/* <div>Filtre</div> */}
        <div>
          <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <div className="py-2">
              <ExportComponent
                defaultQuery={getExportQuery}
                title="Exporter les candidatures"
                exportTitle={`Candidatures-${young.firstName}-${young.lastName}`}
                index="application"
                transform={(all) => {
                  return all.map((data) => {
                    return {
                      _id: data._id,
                      Cohorte: data.youngCohort,
                      Prénom: data.youngFirstName,
                      Nom: data.youngLastName,
                      "Date de naissance": data.youngBirthdateAt,
                      Email: data.youngEmail,
                      Téléphone: young.phone,
                      "Adresse du volontaire": young.address,
                      "Code postal du volontaire": young.zip,
                      "Ville du volontaire": young.city,
                      "Département du volontaire": young.department,
                      "Prénom représentant légal 1": young.parent1FirstName,
                      "Nom représentant légal 1": young.parent1LastName,
                      "Email représentant légal 1": young.parent1Email,
                      "Téléphone représentant légal 1": young.parent1Phone,
                      "Prénom représentant légal 2": young.parent2LastName,
                      "Nom représentant légal 2": young.parent2LastName,
                      "Email représentant légal 2": young.parent2Email,
                      "Téléphone représentant légal 2": young.parent2Phone,
                      Choix: data.priority,
                      "Nom de la mission": data.missionName,
                      "Département de la mission": data.missionDepartment,
                      "Région de la mission": data.missionRegion,
                      "Candidature créée lé": data.createdAt,
                      "Candidature mise à jour le": data.updatedAt,
                      "Statut de la candidature": translate(data.status),
                      Tuteur: data.tutorName,
                      "Pièces jointes à l’engagement": translate(`${optionsType.reduce((sum, option) => sum + data[option].length, 0) !== 0}`),
                    };
                  });
                }}
              />
            </div>
          </ReactiveBase>
        </div>
      </div>

      {/* Mission card */}
      <div className="mx-14 ">
        {applications.map((hit, i) => (
          <Hit key={hit._id} young={young} hit={hit} index={i} onChangeApplication={onChangeApplication} optionsType={optionsType} />
        ))}

        {applications.length ? null : <div className="italic text-center m-8">Aucune candidature n&apos;est liée à ce volontaire.</div>}
      </div>
    </div>
  );
}

const Hit = ({ hit, index, young, onChangeApplication }) => {
  const [mission, setMission] = useState();
  const [tags, setTags] = useState();

  const history = useHistory();
  useEffect(() => {
    (async () => {
      if (!hit.missionId) return;
      const { ok, data, code } = await api.get(`/mission/${hit.missionId}`);
      if (!ok) {
        capture(code);
        return toastr.error("Oups, une erreur est survenue", code);
      }
      setMission(data);
      const t = [];
      data?.city && t.push(data?.city + (data?.zip ? ` - ${data?.zip}` : ""));
      (data?.domains || []).forEach((d) => t.push(translate(d)));
      setTags(t);
    })();
  }, []);

  if (!mission) return null;
  return (
    <div className="relative w-full  bg-white shadow-nina rounded-xl p-4 border-[1px] border-white hover:border-gray-200 shadow-ninaButton mb-4">
      {/* Choix*/}
      <div className="text-gray-500 font-medium uppercase text-xs flex justify-end tracking-wider mb-2">
        {hit.status === APPLICATION_STATUS.WAITING_ACCEPTATION ? "Mission proposée au volontaire" : `Choix ${index + 1}`}
      </div>
      <div className="flex justify-between  ">
        <Link className="flex basis-[35%] items-center" to={`/mission/${hit.missionId}`}>
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
        <div className="flex basis-[65%] justify-between items-center">
          {/* date */}
          <div className="flex flex-col basis-[30%] justify-center">
            <div>
              <span className="text-gray-500 mr-1 text-xs">Du</span>
              <span className="text-[#242526] text-xs">{formatStringDateTimezoneUTC(mission.startAt)}</span>
            </div>
            <div>
              <span className="text-gray-500 text-xs mr-1">Au</span>
              <span className="text-[#242526] text-xs">{formatStringDateTimezoneUTC(mission.endAt)}</span>
            </div>
          </div>

          {/* places disponibles */}
          <div className="flex basis-[25%]">
            {mission.placesLeft <= 1 ? (
              <div className="font-medium text-xs text-gray-700 "> {mission.placesLeft} place disponible</div>
            ) : (
              <div className="font-medium text-xs text-gray-700 "> {mission.placesLeft} places disponibles</div>
            )}
          </div>
          <div className="flex flex-col basis-[35%] justify-end">
            {/* statut */}
            <div onClick={(e) => e.stopPropagation()}>
              <div>
                <SelectStatusApplicationPhase2
                  hit={hit}
                  callback={(status) => {
                    if (status === "VALIDATED") {
                      history.push(`/volontaire/${young._id}/phase2/application/${hit._id}/contrat`);
                    }
                    onChangeApplication();
                  }}
                />
              </div>
            </div>
          </div>
          {/* end statut */}
        </div>
      </div>
    </div>
  );
};

const ExportComponent = ({ handleClick, title, exportTitle, index, react, transform, searchType = "export", defaultQuery = () => ({ query: { query: { match_all: {} } } }) }) => {
  const [exporting, setExporting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const query = useRef(defaultQuery().query);
  const onClick = () => {
    handleClick?.();
    setModal({
      isOpen: true,
      onConfirm: () => setExporting(true),
      title: "Téléchargement",
      message:
        "En téléchargeant ces informations, vous vous engagez à les supprimer après consultation en application des dispositions légales sur la protection des données personnelles (RGPD, CNIL)",
    });
  };

  useEffect(() => {
    if (searchType === "_msearch") {
      query.current = defaultQuery().query;
    }
  }, [defaultQuery()]);

  if (exporting) {
    return (
      <ReactiveComponent
        defaultQuery={() => ({ ...defaultQuery(), size: 1 })}
        componentId="EXPORT"
        react={react}
        onQueryChange={(prev, next) => {
          if (searchType !== "_msearch") {
            query.current = next.query;
          }
        }}
        render={(props) => {
          const { setQuery, data, loading } = props;
          return (
            <Loading
              setQuery={setQuery}
              currentQuery={query.current}
              data={data}
              loading={loading}
              onFinish={() => setExporting(false)}
              index={index}
              exportTitle={exportTitle}
              transform={transform}
              searchType={searchType}
            />
          );
        }}
      />
    );
  }

  return (
    <>
      <button className="bg-write text-blue-600 border-blue-600 border-[1px] font-ubuntu text-sm rounded-lg p-2" onClick={onClick}>
        {title}
      </button>
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
};

function Loading({ onFinish, loading, exportTitle, transform, currentQuery, index, searchType }) {
  const STATUS_LOADING = "Récupération des données";
  const STATUS_TRANSFORM = "Mise en forme";
  const STATUS_EXPORT = "Création du fichier";
  const [status, setStatus] = useState(null);
  const [data, setData] = useState([]);

  const [run, setRun] = useState(false);

  useEffect(() => {
    if (loading === false) setRun(true);
  }, [loading]);

  useEffect(() => {
    if (!run) return;

    if (!status) {
      setStatus(STATUS_LOADING);
    } else if (status === STATUS_LOADING) {
      getAllResults(index, currentQuery, searchType).then((results) => {
        setData(results);
        setStatus(STATUS_TRANSFORM);
      });
    } else if (status === STATUS_TRANSFORM) {
      toArrayOfArray(data, transform).then((results) => {
        setData(results);
        setStatus(STATUS_EXPORT);
      });
    } else if (status === STATUS_EXPORT) {
      const fileName = `${exportTitle}_${dayjs().format("YYYY-MM-DD_HH[h]mm[m]ss[s]")}.xlsx`;

      exportData(fileName, data);
      onFinish();
    }
  }, [run, status]);

  return (
    <div>
      <LoadingButton loading={loading || run} loadingText={status}></LoadingButton>
    </div>
  );
}

async function toArrayOfArray(results, transform) {
  const data = transform ? await transform(results) : results;
  let columns = Object.keys(data[0] ?? []);
  return [columns, ...data.map((item) => Object.values(item))];
}

async function getAllResults(index, query, searchType) {
  let result;
  if (searchType === "_msearch") {
    result = await api.esQuery(index, query);
    if (!result.responses.length) return [];
    return result.responses[0];
  } else {
    result = await api.post(`/es/${index}/export`, { query });
    if (!result.data.length) return [];
    return result.data;
  }
}

async function exportData(fileName, csv) {
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const ws = XLSX.utils.aoa_to_sheet(csv);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const resultData = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(resultData, fileName + fileExtension);
}

const lookUpAuthorizedStatus = ({ status, role }) => {
  if ([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(role)) {
    return [
      APPLICATION_STATUS.WAITING_ACCEPTATION,
      APPLICATION_STATUS.WAITING_VERIFICATION,
      APPLICATION_STATUS.WAITING_VALIDATION,
      APPLICATION_STATUS.VALIDATED,
      APPLICATION_STATUS.IN_PROGRESS,
      APPLICATION_STATUS.DONE,
      APPLICATION_STATUS.CANCEL,
      APPLICATION_STATUS.ABANDON,
      APPLICATION_STATUS.REFUSED,
    ];
  } else {
    switch (status) {
      case APPLICATION_STATUS.WAITING_ACCEPTATION:
        return [APPLICATION_STATUS.REFUSED];
      case APPLICATION_STATUS.WAITING_VALIDATION:
        return [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED];
      case APPLICATION_STATUS.VALIDATED:
        return [APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON];
      case APPLICATION_STATUS.IN_PROGRESS:
        return [APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON];
      case APPLICATION_STATUS.WAITING_VERIFICATION:
        return [APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.VALIDATED];
      case APPLICATION_STATUS.REFUSED:
      case APPLICATION_STATUS.CANCEL:
      case APPLICATION_STATUS.DONE:
      case APPLICATION_STATUS.ABANDON:
        return [];
      default:
        return [];
    }
  }
};

const SelectStatusApplicationPhase2 = ({ hit, options = [], callback }) => {
  const [application, setApplication] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, onConfirm: null });
  const [modalRefuse, setModalRefuse] = useState({ isOpen: false, onConfirm: null });
  const [modalDone, setModalDone] = useState({ isOpen: false, onConfirm: null });

  const user = useSelector((state) => state.Auth.user);

  const theme = {
    background: {
      WAITING_VALIDATION: "rgb(224 242 254)",
      WAITING_VERIFICATION: "rgb(224 242 254)",
      WAITING_ACCEPTATION: "rgb(249 115 22)",
      VALIDATED: "#71C784",
      DONE: "#5694CD",
      REFUSED: "#0B508F",
      CANCEL: "#F4F4F4",
      IN_PROGRESS: "rgb(79 70 229)",
      ABANDON: "rgb(249 250 251)",
    },
    text: {
      WAITING_VALIDATION: "rgb(2 132 199)",
      WAITING_VERIFICATION: "rgb(2 132 199)",
      WAITING_ACCEPTATION: "#fff",
      VALIDATED: "#fff",
      DONE: "#fff",
      REFUSED: "#fff",
      CANCEL: "#6B6B6B",
      IN_PROGRESS: "#fff",
      ABANDON: "rgb(156 163 175)",
    },
  };

  useEffect(() => {
    (async () => {
      const id = hit && hit._id;
      if (!id) return setApplication(null);
      const { data } = await api.get(`/application/${id}`);
      setApplication(data);
    })();
  }, [hit._id]);

  if (!application) return <i style={{ color: colors.darkPurple }}>Chargement...</i>;

  options = lookUpAuthorizedStatus({ status: application.status, role: user.role });

  const onClickStatus = (status) => {
    setModalConfirm({
      isOpen: true,
      title: "Êtes-vous sûr(e) de vouloir modifier le statut de cette candidature?\nUn email sera automatiquement envoyé.",
      onConfirm: () => handleClickStatus(status),
    });
  };

  const handleClickStatus = (status) => {
    if (status === APPLICATION_STATUS.REFUSED) setModalRefuse({ isOpen: true });
    else if (status === APPLICATION_STATUS.DONE) setModalDone({ isOpen: true });
    else setStatus(status);
  };

  const setStatus = async (status, message, duration) => {
    try {
      const { ok, code, data } = await api.put("/application", { _id: application._id, status, missionDuration: duration });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      setApplication(data);
      toastr.success("Mis à jour!");
      if (status === APPLICATION_STATUS.VALIDATED) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED}`);
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION}`);
      } else if (status === APPLICATION_STATUS.CANCEL) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION}`, { message });
      } else if (status === APPLICATION_STATUS.REFUSED) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION}`, { message });
      }
      callback && callback(status);
    } catch (e) {
      console.log(e);
      if (e.code !== "NO_TEMPLATE_FOUND") toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <>
      <ActionBox background={theme.background[application.status]} color={theme.text[application.status]}>
        <UncontrolledDropdown setActiveFromChild>
          <DropdownToggle tag="button">
            {translateApplication(application.status)}
            <Chevron color={theme.text[application.status]} />
          </DropdownToggle>
          <DropdownMenu>
            {options
              .filter((e) => e !== application.status)
              .map((status) => {
                return (
                  <DropdownItem key={status} className="dropdown-item" onClick={() => onClickStatus(status)}>
                    {translateApplication(status)}
                  </DropdownItem>
                );
              })}
          </DropdownMenu>
        </UncontrolledDropdown>
      </ActionBox>
      <ModalConfirmWithMessage
        isOpen={modalRefuse.isOpen}
        title="Veuillez éditer le message ci-dessous pour préciser les raisons du refus avant de l'envoyer"
        message={`Une fois le message ci-dessous validé, il sera transmis par mail à ${application.youngFirstName} (${application.youngEmail}).`}
        onChange={() => setModalRefuse({ isOpen: false, onConfirm: null })}
        onConfirm={(msg) => {
          setStatus(APPLICATION_STATUS.REFUSED, msg);
          setModalRefuse({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalConfirmWithMessage
        isOpen={modalDone.isOpen}
        title="Validation de réalisation de mission"
        message={`Merci de valider le nombre d'heures effectuées par ${application.youngFirstName} pour la mission ${application.missionName}.`}
        onChange={() => setModalDone({ isOpen: false, onConfirm: null })}
        type="number"
        defaultInput={application.missionDuration}
        placeholder="Nombre d'heures"
        onConfirm={(duration) => {
          setStatus(APPLICATION_STATUS.DONE, null, duration);
          setModalDone({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalConfirm
        isOpen={modalConfirm?.isOpen}
        title={modalConfirm?.title}
        message={modalConfirm?.message}
        onCancel={() => setModalConfirm({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalConfirm?.onConfirm();
          setModalConfirm({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
};

const Chevron = ({ ...props }) => {
  return (
    <ChevronContainer {...props}>
      <svg viewBox="0 0 407.437 407.437">
        <polygon points="386.258,91.567 203.718,273.512 21.179,91.567 0,112.815 203.718,315.87 407.437,112.815 " />
      </svg>
    </ChevronContainer>
  );
};

const ChevronContainer = styled.div`
  margin-left: auto;
  margin-left: 10px;
  svg {
    height: 10px;
  }
  svg polygon {
    fill: ${({ color }) => `${color}`};
  }
`;

const ActionBox = styled.div`
  .dropdown-menu {
    min-width: 0;
    /* width: 400px; */
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      padding: 5px 15px;
    }
  }
  button {
    ${({ background, color }) => `
      background-color: ${background};
      border: 1px solid ${background};
      color: ${color};
    `}
    display: inline-flex;
    align-items: center;
    text-align: left;
    border-radius: 4px;
    padding: 5px 6px;
    font-size: 12px;
    font-weight: 400;
    cursor: pointer;
    outline: 0;
    max-width: 300px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      // margin-left: auto;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    width: 100%;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
