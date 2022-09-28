import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import { Box, BoxTitle } from "../../../../components/box";
import DownloadAttestationButton from "../../../../components/buttons/DownloadAttestationButton";
import MailAttestationButton from "../../../../components/buttons/MailAttestationButton";
import SelectStatus from "../../../../components/selectStatus";
import api from "../../../../services/api";
import { ENABLE_PM, ES_NO_LIMIT, translate, YOUNG_PHASE, YOUNG_STATUS_PHASE2 } from "../../../../utils";
import CardEquivalence from "../../components/Equivalence";
import Toolbox from "../../components/Toolbox";
import Phase2militaryPrepartionV2 from "../phase2MilitaryPreparationV2";
import WrapperPhase2 from "../wrapper";
import ApplicationList2 from "./applicationList2";
import Preferences from "./preferences";
// import Pencil from "../../../../assets/pencil.svg";
import { ReactiveBase } from "@appbaseio/reactivesearch";
import { HiOutlineAdjustments } from "react-icons/hi";
import Menu from "../../../../assets/icons/Menu";
import Pencil from "../../../../assets/icons/Pencil";
import ExportComponent from "../../../../components/ExportXlsx";
import { apiURL } from "../../../../config";
import { toastr } from "react-redux-toastr";

export default function Phase2({ young, onChange }) {
  const [equivalences, setEquivalences] = React.useState([]);
  const [blocOpened, setBlocOpened] = useState("missions");
  const [editPreference, setEditPreference] = useState(false);
  const [savePreference, setSavePreference] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ required: "Ce champs est obligatoire" });

  const [dataPreference, setDataPreference] = React.useState({
    professionnalProject: "",
    professionnalProjectPrecision: "",
    engaged: "",
    desiredLocation: "",
    engagedDescription: "",
    domains: [],
    missionFormat: "",
    mobilityTransport: [],
    period: [],
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
      engaged: young?.engaged || "",
      desiredLocation: young?.desiredLocation || "",
      engagedDescription: young?.engagedDescription || "",
      domains: young?.domains ? [...young.domains] : [],
      missionFormat: young?.missionFormat || "",
      mobilityTransport: young?.mobilityTransport ? [...young.mobilityTransport] : [],
      period: young?.period || [],
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
    //loader a utiliser + error a throw

    setSavePreference(true);
    console.log("dataPreference==>", dataPreference);
    const { ok, data, code } = await api.put(`/young/${young._id.toString()}/phase2/preference`, dataPreference);
    console.log("code==>", code);

    if (!ok) return toastr.error("Oups, une erreur est survenue", translate(code));
    toastr.success("Succès", "Vos préférences ont bien été enregistrées");

    await onChange();
    setEditPreference(false);
    setSavePreference(false);
  };

  const getExportQuery = () => ({ query: { bool: { filter: { term: { "youngId.keyword": young._id } } } }, sort: [{ "priority.keyword": "asc" }], size: ES_NO_LIMIT });
  const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

  React.useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/young/${young._id.toString()}/phase2/equivalences`);
      if (ok) return setEquivalences(data);
    })();
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase2 young={young} tab="phase2" onChange={onChange}>
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
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG prévisionnelles</div>
                <div className="font-bold text-2xl text-[#242526]">{young.phase2NumberHoursEstimated || "0"}h</div>
              </Row>
              <Row style={{ height: "50%", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1rem", margin: 0 }}>
                <div className="uppercase text-[11px] text-[#7E858C] tracking-[5%]">Heures de MIG réalisées</div>
                <div className="font-bold text-2xl text-[#242526]">{young.phase2NumberHoursDone || "0"}h sur 84h</div>
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
          <div className="flex border-b-[1px] border-b-gray-200 mb-3 items-center justify-between mx-8">
            <div className="flex items-center">
              <div
                className={`py-4 flex border-b-[2px] items-center cursor-pointer ${blocOpened === "missions" ? "border-blue-500" : "border-transparent"}`}
                onClick={() => {
                  setBlocOpened("missions");
                }}>
                <Menu className={blocOpened === "missions" ? "text-blue-600" : "text-gray-500"} />
                <div className={`text-sm font-medium ml-2 ${blocOpened === "missions" ? "text-blue-600" : "text-gray-500"}`}>Missions candidatées</div>
              </div>
              <div
                className={`ml-8 py-4 flex border-b-[2px] items-center cursor-pointer ${blocOpened === "preferences" ? "border-blue-500" : "border-transparent"}`}
                onClick={() => {
                  setBlocOpened("preferences");
                }}>
                <HiOutlineAdjustments className={`w-5 h-5 ${blocOpened === "preferences" ? "text-blue-600" : "text-gray-500"}`} />
                <div className={`text-sm font-medium ml-2 ${blocOpened === "preferences" ? "text-blue-600" : "text-gray-500"}`}>Préférences de missions</div>
              </div>
            </div>

            {blocOpened === "preferences" ? (
              <div className="flex items-center gap-4">
                {editPreference ? (
                  <div className="hover:scale-105 flex items-center gap-2 bg-gray-100 rounded-[28px] px-[9px] py-[7px] h-[32px]" onClick={() => setEditPreference(false)}>
                    <div className="text-gray-700 text-xs font-medium cursor-pointer">Annuler</div>
                  </div>
                ) : null}
                <div
                  className="hover:scale-105 flex items-center gap-2 bg-blue-100 rounded-[28px] px-[9px] py-[7px] h-[32px]"
                  onClick={() => {
                    if (!editPreference) setEditPreference(true);
                    else onSubmit();
                  }}>
                  <Pencil className="h-4 w-4 text-blue-600" />
                  <div className="text-blue-600 text-xs font-medium cursor-pointer">{editPreference ? "Enregistrer les changements" : "Modifier"}</div>
                </div>
              </div>
            ) : null}

            {blocOpened === "missions" ? (
              <div className="flex">
                <ReactiveBase url={`${apiURL}/es`} app="application" headers={{ Authorization: `JWT ${api.getToken()}` }}>
                  <div className="py-2">
                    <ExportComponent
                      defaultQuery={getExportQuery}
                      title="Exporter les candidatures"
                      exportTitle={`Candidatures-${young.firstName}-${young.lastName}`}
                      index="application"
                      css={{
                        override: true,
                        button: "border-blue-600 text-blue-600 border-[1px] rounded-md px-2.5 py-1.5 text-sm hover:bg-blue-600 hover:text-white",
                        loadingButton: "border-[1px] rounded-md px-2.5 py-1.5 text-sm bg-blue-600 text-white opacity-70",
                      }}
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
            />
          )}
        </Box>

        {young.statusPhase2 === "VALIDATED" ? (
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ textAlign: "center" }}>
              <DownloadAttestationButton young={young} uri="2">
                Télécharger l&apos;attestation de réalisation de la phase 2
              </DownloadAttestationButton>
              <MailAttestationButton style={{ marginTop: ".5rem" }} young={young} type="2" template="certificate" placeholder="Attestation de réalisation de la phase 2">
                Envoyer l&apos;attestation par mail
              </MailAttestationButton>
            </div>
          </div>
        ) : null}
      </WrapperPhase2>
    </div>
  );
}
