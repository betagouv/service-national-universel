import React, { useState } from "react";
import { HiOutlineAdjustments } from "react-icons/hi";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Col, Row } from "reactstrap";
import { ROLES, YOUNG_PHASE, YOUNG_STATUS_PHASE2, translate } from "snu-lib";
import Menu from "@/assets/icons/Menu";
import Pencil from "@/assets/icons/Pencil";
import { Box, BoxTitle } from "@/components/box";
import { ModalExport } from "@/components/filters-system-v2";
import SelectStatus from "@/components/selectStatus";
import { capture } from "@/sentry";
import api from "@/services/api";
import YoungHeader from "../../../phase0/components/YoungHeader";
import Toolbox from "../../components/Toolbox";
import Phase2MilitaryPreparation from "../phase2MilitaryPreparationV2";
import ApplicationList2 from "./applicationList2";
import Preferences from "./preferences";
import EquivalenceList from "./EquivalenceList";
import useApplications from "./lib/useApplications";
import Loader from "@/components/Loader";
import Voiture from "../../../../assets/icons/Voiture";
import { transform, getExportFields } from "./utils";
import ButtonRoadCodeRefund from "./ButtonRoadCodeRefund";

export default function Phase2({ young, onChange }) {
  const [blocOpened, setBlocOpened] = useState("missions");
  const [editPreference, setEditPreference] = useState(false);
  const [savePreference, setSavePreference] = useState(false);
  const [errorMessage, setErrorMessage] = useState({});
  const [openDesiredLocation, setOpenDesiredLocation] = React.useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { data: applications, isLoading } = useApplications(young._id);
  const applicationsToMilitaryPreparation = applications?.filter((e) => e.mission?.isMilitaryPreparation);

  const user = useSelector((state) => state.Auth.user);
  const cohorts = useSelector((state) => state.Cohorts);
  const cohort = cohorts.find(({ _id, name }) => _id === young?.cohortId || name === young?.cohort);

  const [dataPreference, setDataPreference] = React.useState({
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

  if (isLoading) return <Loader />;

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
        <div className="flex items-stretch bg-white p-6 rounded-lg shadow w-full mb-4">
          <div className="flex items-center w-1/2 pr-4">
            <div className="mr-2 mr-4">
              <Voiture className="w-12 h-12" />
            </div>
            <div>
              <div className="text-lg leading-6 font-semibold text-gray-900 mb-2">Code de la route</div>
              <div className="text-sm text-gray-500">
                La validation de la phase engagement permet aux jeunes de bénéficier d&apos;une première présentation gratuite au code de la route.
              </div>
            </div>
          </div>
          <div className="w-px bg-gray-200 mx-4 self-stretch" />

          <div className="flex flex-col justify-center w-1/2 pl-4">
            <div className="flex flex-col">
              {young.roadCodeRefund === "true" ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium mb-1">
                    <span>✔</span>
                    <span>Le volontaire a bien bénéficié du remboursement</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Renseigné
                    {young.roadCodeRefundOrganization && (
                      <span>
                        par <b>{young.roadCodeRefundOrganization}</b>,
                      </span>
                    )}{" "}
                    le {new Date(young.roadCodeRefundDate).toLocaleDateString("fr-FR")}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mb-1">
                  <span>✔</span>
                  <span>Le volontaire n'a pas bénéficié du remboursement</span>
                </div>
              )}
            </div>
            {user.role == ROLES.ADMIN && young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED && (
              <div className="mt-1 flex justify-end">
                <ButtonRoadCodeRefund young={young} />
              </div>
            )}
          </div>
        </div>

        <Phase2MilitaryPreparation young={young} applications={applicationsToMilitaryPreparation} />
        <EquivalenceList young={young} cohort={cohort} />

        <Toolbox young={young} applications={applications} />
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
                    exportFields={getExportFields(user)}
                    exportTitle={`Candidatures de ${young.firstName} ${young.lastName}`}
                    showTotalHits={true}
                    selectedFilters={{}}
                  />
                </div>
              </div>
            ) : null}
          </div>
          {blocOpened === "missions" && <ApplicationList2 young={young} applications={applications} />}
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
