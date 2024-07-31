import React, { useState } from "react";
import { HiOutlineAdjustments } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Col, Row } from "reactstrap";
import { ROLES, applicationExportFields, formatDateFRTimezoneUTC, formatLongDateUTC } from "snu-lib";
import Menu from "../../../../assets/icons/Menu";
import Pencil from "../../../../assets/icons/Pencil";
import { Box, BoxTitle } from "../../../../components/box";
import DownloadAttestationButton from "../../../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../../../components/buttons/MailAttestationButton";
import { ModalExport } from "../../../../components/filters-system-v2";
import SelectStatus from "../../../../components/selectStatus";
import { capture } from "../../../../sentry";
import api from "../../../../services/api";
import { YOUNG_PHASE, YOUNG_STATUS_PHASE2, translate } from "snu-lib";
import { ENABLE_PM } from "../../../../utils";
import YoungHeader from "../../../phase0/components/YoungHeader";
import CardEquivalence from "../../components/Equivalence";
import Toolbox from "../../components/Toolbox";
import Phase2militaryPrepartionV2 from "../phase2MilitaryPreparationV2";
import ApplicationList2 from "./applicationList2";
import Preferences from "./preferences";

export default function Phase2({ young, onChange }) {
  const [equivalences, setEquivalences] = React.useState([]);
  const [blocOpened, setBlocOpened] = useState("missions");
  const [editPreference, setEditPreference] = useState(false);
  const [savePreference, setSavePreference] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [openDesiredLocation, setOpenDesiredLocation] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const user = useSelector((state) => state.Auth.user);

  const [dataPreference, setDataPreference] = React.useState({
    professionnalProject: "",
    professionnalProjectPrecision: "",
    engaged: "",
    desiredLocation: "",
    engagedDescription: "",
    domains: [],
    missionFormat: "",
    mobilityTransport: [],
    period: "",
    mobilityTransportOther: "",
    mobilityNearHome: "false",
    mobilityNearSchool: "false",
    mobilityNearRelative: "false",
    mobilityNearRelativeName: "",
    mobilityNearRelativeAddress: "",
    mobilityNearRelativeZip: "",
    mobilityNearRelativeCity: "",
    periodRanking: [],
  });

  React.useEffect(() => {
    setDataPreference({
      professionnalProject: young?.professionnalProject || "",
      professionnalProjectPrecision: young?.professionnalProjectPrecision || "",
      engaged: young?.engaged || "false",
      desiredLocation: young?.desiredLocation || "",
      engagedDescription: young?.engagedDescription || "",
      domains: young?.domains ? [...young.domains] : [],
      missionFormat: young?.missionFormat || "",
      mobilityTransport: young?.mobilityTransport ? [...young.mobilityTransport] : [],
      period: young?.period || "",
      mobilityTransportOther: young?.mobilityTransportOther || "",
      mobilityNearHome: young?.mobilityNearHome || "false",
      mobilityNearSchool: young?.mobilityNearSchool || "false",
      mobilityNearRelative: young?.mobilityNearRelative || "false",
      mobilityNearRelativeName: young?.mobilityNearRelativeName || "",
      mobilityNearRelativeAddress: young?.mobilityNearRelativeAddress || "",
      mobilityNearRelativeZip: young?.mobilityNearRelativeZip || "",
      mobilityNearRelativeCity: young?.mobilityNearRelativeCity || "",
      periodRanking: young?.periodRanking ? [...young.periodRanking] : [],
    });
  }, [young, editPreference]);

  const onSubmit = async () => {
    try {
      let error = {};
      let data = dataPreference;

      //Error : professionnalProjet
      if (dataPreference.professionnalProject === "UNIFORM") {
        if (!["FIREFIGHTER", "POLICE", "ARMY"].includes(dataPreference.professionnalProjectPrecision)) {
          error.errorProject = "Ce champs est obligatoire";
        }
      }

      if (dataPreference.professionnalProject === "OTHER" && dataPreference.professionnalProjectPrecision === "") {
        error.errorProject = "Ce champs est obligatoire";
      }

      //Error : Desired Location
      if (openDesiredLocation && !dataPreference.desiredLocation) {
        error.desiredLocation = "Ce champs est obligatoire";
      }

      //Error : Engaged
      if (dataPreference.engaged === "true" && !dataPreference.engagedDescription) {
        error.engaged = "Ce champs est obligatoire";
      }

      //Error : transport
      if (dataPreference.mobilityTransport.includes("OTHER") && dataPreference.mobilityTransportOther === "") {
        error.transport = "Ce champs est obligatoire";
      }

      //Error : MobilityNearRelative
      if (
        dataPreference.mobilityNearRelative === "true" &&
        (!dataPreference?.mobilityNearRelativeAddress ||
          dataPreference.mobilityNearRelativeAddress === "" ||
          !dataPreference?.mobilityNearRelativeCity ||
          dataPreference.mobilityNearRelativeCity === "" ||
          !dataPreference?.mobilityNearRelativeName ||
          dataPreference.mobilityNearRelativeName === "" ||
          !dataPreference?.mobilityNearRelativeZip ||
          dataPreference.mobilityNearRelativeZip === "")
      ) {
        error.mobilityNearRelative = "Veuillez renseigner une adresse";
      }

      //Error
      if (dataPreference.domains.length !== 3 && dataPreference.domains.length !== 0) {
        error.domains = "Veuillez sélectionner 3 domaines favoris";
      }

      if (dataPreference.professionnalProject === "") {
        // Error enum
        delete data.professionnalProject;
      }

      if (dataPreference.period === "") {
        delete data.period;
      }

      if (Object.keys(error).length) {
        setErrorMessage(error);
      } else {
        setErrorMessage({});
        setSavePreference(true);
        const { ok, code } = await api.put(`/young/${young._id.toString()}/phase2/preference`, data);

        if (!ok) return toastr.error("Oups, une erreur est survenue", translate(code));
        toastr.success("Succès", "Vos préférences ont bien été enregistrées");
        console.log(code);

        await onChange();
        setEditPreference(false);
        setSavePreference(false);
      }
    } catch (error) {
      capture(error);
      setSavePreference(false);
    }
  };

  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  async function transform(data, values) {
    let all = data;

    return all.map((data) => {
      if (!data.young) data.young = {};
      if (!data.young.domains) data.young.domains = [];
      if (!data.young.periodRanking) data.young.periodRanking = [];
      if (!data.mission) data.mission = {};
      if (!data.tutor) data.tutor = {};
      if (!data.structure) data.structure = {};
      if (!data.structure.types) data.structure.types = [];

      const allFields = {
        application: {
          "Statut de la candidature": translate(data.status),
          "Choix - Ordre de la candidature": data.priority,
          "Candidature créée le": formatLongDateUTC(data.createdAt),
          "Candidature mise à jour le": formatLongDateUTC(data.updatedAt),
          "Statut du contrat d'engagement": translate(data.contractStatus),
          "Pièces jointes à l’engagement": translate(`${optionsType.reduce((sum, option) => sum + data[option]?.length, 0) !== 0}`),
          "Statut du dossier d'éligibilité PM": translate(data.young.statusMilitaryPreparationFiles),
        },
        missionInfo: {
          "ID de la mission": data.missionId,
          "Titre de la mission": data.mission.name,
          "Date du début": formatDateFRTimezoneUTC(data.mission.startAt),
          "Date de fin": formatDateFRTimezoneUTC(data.mission.endAt),
          "Domaine principal de la mission": translate(data.mission.mainDomain) || "Non renseigné",
          "Préparation militaire": translate(data.mission.isMilitaryPreparation),
        },
        missionTutor: {
          "Nom du tuteur": data.tutor?.lastName,
          "Prénom du tuteur": data.tutor?.firstName,
          "Email du tuteur": data.tutor?.email,
          "Portable du tuteur": data.tutor?.mobile,
          "Téléphone du tuteur": data.tutor?.phone,
        },
        missionLocation: {
          Adresse: data.mission.address,
          "Code postal": data.mission.zip,
          Ville: data.mission.city,
          Département: data.mission.department,
          Région: data.mission.region,
        },
        structureInfo: {
          "Id de la structure": data.structureId,
          "Nom de la structure": data.structure.name,
          "Statut juridique de la structure": data.structure.legalStatus,
          "Type(s) de structure": data.structure.types.toString(),
          "Sous-type de structure": data.structure.sousType,
          "Présentation de la structure": data.structure.description,
        },
        structureLocation: {
          "Adresse de la structure": data.structure.address,
          "Code postal de la structure": data.structure.zip,
          "Ville de la structure": data.structure.city,
          "Département de la structure": data.structure.department,
          "Région de la structure": data.structure.region,
        },
        status: {
          "Statut général": translate(data.young.status),
          "Statut phase 2": translate(data.young.statusPhase2),
          "Statut de la candidature": translate(data.status),
          "Motif du refus": data.statusComment,
        },
        // pas pour structures :
        choices: {
          "Domaine de MIG 1": data.young.domains[0],
          "Domaine de MIG 2": data.young.domains[1],
          "Domaine de MIG 3": data.young.domains[2],
          "Projet professionnel": translate(data.young.professionnalProject),
          "Information supplémentaire sur le projet professionnel": data.professionnalProjectPrecision,
          "Période privilégiée pour réaliser des missions": data.period,
          "Choix 1 période": translate(data.young.periodRanking[0]),
          "Choix 2 période": translate(data.young.periodRanking[1]),
          "Choix 3 période": translate(data.young.periodRanking[2]),
          "Choix 4 période": translate(data.young.periodRanking[3]),
          "Choix 5 période": translate(data.young.periodRanking[4]),
          "Mobilité aux alentours de son établissement": translate(data.young.mobilityNearSchool),
          "Mobilité aux alentours de son domicile": translate(data.young.mobilityNearHome),
          "Mobilité aux alentours d'un de ses proches": translate(data.young.mobilityNearRelative),
          "Adresse du proche": data.young.mobilityNearRelativeAddress,
          "Mode de transport": data.young.mobilityTransport?.map((t) => translate(t)).join(", "),
          "Format de mission": translate(data.young.missionFormat),
          "Engagement dans une structure en dehors du SNU": translate(data.young.engaged),
          "Description engagement ": data.young.youngengagedDescription,
          "Souhait MIG": data.young.youngdesiredLocation,
        },
        representative1: {
          "Statut représentant légal 1": translate(data.young.parent1Status),
          "Prénom représentant légal 1": data.young.parent1FirstName,
          "Nom représentant légal 1": data.young.parent1LastName,
          "Email représentant légal 1": data.young.parent1Email,
          "Téléphone représentant légal 1": data.young.parent1Phone,
          "Adresse représentant légal 1": data.young.parent1Address,
          "Code postal représentant légal 1": data.young.parent1Zip,
          "Ville représentant légal 1": data.young.parent1City,
          "Département représentant légal 1": data.young.parent1Department,
          "Région représentant légal 1": data.young.parent1Region,
        },
        representative2: {
          "Statut représentant légal 2": translate(data.young.parent2Status),
          "Prénom représentant légal 2": data.young.parent2FirstName,
          "Nom représentant légal 2": data.young.parent2LastName,
          "Email représentant légal 2": data.young.parent2Email,
          "Téléphone représentant légal 2": data.young.parent2Phone,
          "Adresse représentant légal 2": data.young.parent2Address,
          "Code postal représentant légal 2": data.young.parent2Zip,
          "Ville représentant légal 2": data.young.parent2City,
          "Département représentant légal 2": data.young.parent2Department,
          "Région représentant légal 2": data.young.parent2Region,
        },
      };
      let fields = { ID: data._id };
      for (const element of values) {
        let key;
        for (key in allFields[element]) fields[key] = allFields[element][key];
      }
      return fields;
    });
  }

  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, [young]);

  function getExportFields() {
    if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(user.role)) {
      return applicationExportFields.filter((e) => !["choices", "identity", "contact", "address", "location"].includes(e.id));
    } else return applicationExportFields.filter((e) => !["identity", "contact", "address", "location"].includes(e.id));
  }

  return (
    <>
      <YoungHeader young={young} tab="phase2" onChange={onChange} />
      <div className="p-[30px]">
        <Box>
          <Row>
            <Col md={4} sm={4} style={{ padding: "3rem", borderRight: "2px solid #f4f5f7" }}>
              <BoxTitle>Réalisation des 84 heures de mission d&apos;intérêt général</BoxTitle>
              <p style={{ flex: 1 }}>
                Le volontaire doit réaliser sa phase 2 dans l&apos;année suivant son séjour de cohésion.
                <br />
                Pour plus d&apos;informations,{" "}
                <a
                  className="underline hover:underline"
                  href="https://support.snu.gouv.fr/base-de-connaissance/de-combien-de-temps-je-dispose-pour-realiser-ma-mig"
                  target="_blank"
                  rel="noreferrer">
                  cliquez-ici
                </a>
                .
              </p>
            </Col>
            <Col md={4} sm={4} style={{ padding: 0, borderRight: "2px solid #f4f5f7" }}>
              <Row
                style={{
                  height: "50%",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "1rem",
                  margin: 0,
                  borderBottom: "2px solid #f4f5f7",
                }}>
                <div className="text-[11px] uppercase tracking-[5%] text-[#7E858C]">Heures de MIG prévisionnelles</div>
                <div className="text-2xl font-bold text-[#242526]">{young.phase2NumberHoursEstimated || "0"}h</div>
              </Row>
              <Row style={{ height: "50%", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1rem", margin: 0 }}>
                <div className="text-[11px] uppercase tracking-[5%] text-[#7E858C]">Heures de MIG réalisées</div>
                <div className="text-2xl font-bold text-[#242526]">{young.phase2NumberHoursDone || "0"}h sur 84h</div>
              </Row>
            </Col>
            <Col md={4} sm={4} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <SelectStatus
                hit={young}
                statusName="statusPhase2"
                phase={YOUNG_PHASE.INTEREST_MISSION}
                options={Object.keys(YOUNG_STATUS_PHASE2).filter((e) => e !== YOUNG_STATUS_PHASE2.WITHDRAWN)}
              />
            </Col>
          </Row>
        </Box>
        {ENABLE_PM ? <Phase2militaryPrepartionV2 young={young} /> : null}
        {equivalences.map((equivalence, index) => (
          <CardEquivalence key={index} equivalence={equivalence} young={young} />
        ))}

        <Toolbox young={young} />
        <Box>
          <div className="mx-8 mb-3 flex items-center justify-between border-b-[1px] border-b-gray-200">
            <div className="flex items-center">
              <div
                className={`flex cursor-pointer items-center border-b-[2px] py-4 ${blocOpened === "missions" ? "border-blue-500" : "border-transparent"}`}
                onClick={() => {
                  setBlocOpened("missions");
                }}>
                <Menu className={blocOpened === "missions" ? "text-blue-600" : "text-gray-500"} />
                <div className={`ml-2 text-sm font-medium ${blocOpened === "missions" ? "text-blue-600" : "text-gray-500"}`}>Missions candidatées</div>
              </div>
              <div
                className={`ml-8 flex cursor-pointer items-center border-b-[2px] py-4 ${blocOpened === "preferences" ? "border-blue-500" : "border-transparent"}`}
                onClick={() => {
                  setBlocOpened("preferences");
                }}>
                <HiOutlineAdjustments className={`h-5 w-5 ${blocOpened === "preferences" ? "text-blue-600" : "text-gray-500"}`} />
                <div className={`ml-2 text-sm font-medium ${blocOpened === "preferences" ? "text-blue-600" : "text-gray-500"}`}>Préférences de missions</div>
              </div>
            </div>

            {blocOpened === "preferences" && !savePreference ? (
              <div className="flex items-center gap-4">
                {editPreference ? (
                  <div className="flex h-[32px] items-center gap-2 rounded-[28px] bg-gray-100 px-[9px] py-[7px] hover:scale-105" onClick={() => setEditPreference(false)}>
                    <div className="cursor-pointer text-xs font-medium text-gray-700">Annuler</div>
                  </div>
                ) : null}
                <div
                  className="flex h-[32px] items-center gap-2 rounded-[28px] bg-blue-100 px-[9px] py-[7px] hover:scale-105"
                  onClick={() => {
                    if (!editPreference) setEditPreference(true);
                    else onSubmit();
                  }}>
                  <Pencil className="h-4 w-4 text-blue-600" />
                  <div className="cursor-pointer text-xs font-medium text-blue-600">{editPreference ? "Enregistrer les changements" : "Modifier"}</div>
                </div>
              </div>
            ) : null}

            {blocOpened === "missions" ? (
              <div className="flex">
                <div className="py-2">
                  <button
                    className="items-center justify-center rounded-md border-[1px] border-blue-600 py-1.5 px-2.5 text-sm text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={() => {
                      setIsExportOpen(true);
                    }}>
                    Exporter les candidatures
                  </button>

                  <ModalExport
                    isOpen={isExportOpen}
                    setIsOpen={setIsExportOpen}
                    route={`/elasticsearch/application/by-young/${young._id.toString()}/export`}
                    transform={transform}
                    exportFields={getExportFields()}
                    exportTitle={`Candidatures de ${young.firstName} ${young.lastName}`}
                    showTotalHits={true}
                    selectedFilters={{}}
                  />
                </div>
              </div>
            ) : null}
          </div>
          {blocOpened === "missions" && <ApplicationList2 young={young} onChangeApplication={onChange} />}
          {blocOpened === "preferences" && (
            <Preferences
              young={young}
              data={dataPreference}
              setData={setDataPreference}
              editPreference={editPreference}
              savePreference={savePreference}
              setEditPreference={setEditPreference}
              setSavePreference={setSavePreference}
              onSubmit={onSubmit}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              openDesiredLocation={openDesiredLocation}
              setOpenDesiredLocation={setOpenDesiredLocation}
            />
          )}
        </Box>
      </div>
    </>
  );
}
